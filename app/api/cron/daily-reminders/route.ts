import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { dangerCreateServerRoleClient } from '@/lib/supabase/server-role';

export const runtime = 'nodejs';

const supabase = await dangerCreateServerRoleClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!
  }
});

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  // 1) Verify caller: either our secret header or Vercel’s cron header
  const h = new Headers(req.headers);
  const hasVercelCronHeader = h.has('x-vercel-cron');
  const hasOurSecret = CRON_SECRET && h.get('x-cron-secret') === CRON_SECRET;
  if (!hasVercelCronHeader && !hasOurSecret) {
    return new NextResponse('Unauthorised', { status: 401 });
  }

  // 2) Claim recipients atomically (±2 hours window around 10:00)
  const { data: recipients, error } = await supabase
    .rpc('claim_profiles_for_daily_email', { p_window: 2 });

  if (error) {
    console.error('RPC error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ ok: true, claimed: 0 });
  }

  // 3) Send emails (simple concurrency; adjust as needed)
  const CHUNK = 25;
  const chunks = [];
  for (let i = 0; i < recipients.length; i += CHUNK) {
    chunks.push(recipients.slice(i, i + CHUNK));
  }

  let sent = 0;
  for (const group of chunks) {
    // Fire in parallel per chunk
    const results = await Promise.allSettled(
      group.map(r =>
        transporter.sendMail({
          from: `"Tile App" <${process.env.EMAIL_USER}>`,
          to: r.email,
          subject: 'Good morning!',
          html: `
            <p>Hi there,</p>
            <p>Remember to create your daily goals!</p>
          `
        })
      )
    );
    results.forEach(res => { if (res.status === 'fulfilled') sent += 1; });
    // Optional: small delay to be gentle on SMTP providers
    // await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ ok: true, claimed: recipients.length, sent });
}
