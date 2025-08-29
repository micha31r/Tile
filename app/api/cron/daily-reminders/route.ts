import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { dangerCreateServerRoleClient } from "@/lib/supabase/server-role";

export const runtime = "nodejs";

type Recipient = {
  user_id: string;
  email: string;
  timezone: string;
  local_day: string;
};

/**
 * Email template function
 */
function renderDailyGoalsEmail(ctx: { appName: string; timezone: string; localDay: string }): string {
  const { appName, timezone, localDay } = ctx;
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.5;">
      <p>Good morning! 👋</p>
      <p>This is your friendly reminder to set your daily goals for ${localDay}.</p>
      <p>Open <a href="${process.env.NEXT_PUBLIC_DOMAIN}/app">${appName}</a> now and set <strong>four</strong> goals before 11 am.</p>
      <p>Complete all your goals before the end of the day to keep your streak. ✨</p>
      <p>Have a great day!</p>
      <p>Current timezone: ${timezone}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="color:#6b7280; font-size: 12px;">You are receiving this because you are a Tile user</p>
      <p style="color:#6b7280; font-size: 12px;">Contact: <a href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}">${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</a></p>
      <p style="color:#6b7280; font-size: 12px;">Website: <a href="${process.env.NEXT_PUBLIC_DOMAIN}">tile.ac</a></p>
    </div>
  `;
}

const supabase = await dangerCreateServerRoleClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

const CRON_SECRET = process.env.CRON_SECRET as string;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatLocalDay(dateString: string): string {
  const date = new Date(dateString);

  const month = date.toLocaleString("en-US", { month: "short" }); // Aug
  const day = date.getDate();

  // get ordinal suffix
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const year = date.getFullYear();

  return `${month} ${day}${suffix}, ${year}`;
}

export async function GET(req: Request) {
  // verify caller by header or vercel cron header
  const headers = new Headers(req.headers);
  const hasVercelCronHeader = headers.has("x-vercel-cron");
  const authHeader = headers.get("authorization");
  const hasBearerSecret =
    CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
  const hasOurSecret =
    CRON_SECRET && headers.get("x-cron-secret") === CRON_SECRET;

  if (!hasVercelCronHeader && !hasOurSecret && !hasBearerSecret) {
    return new NextResponse("Unauthorised", { status: 401 });
  }

  // claim recipients atomically within two hours window before target local time
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { data, error } = await supabase.rpc<Recipient[]>(
    "claim_profiles_for_daily_email",
    { p_window: 4 }
  );

  if (error) {
    console.error("rpc error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  const recipients: Recipient[] = (data ?? []) as Recipient[];
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, claimed: 0, sent: 0 });
  }

  const FROM = `"${process.env.APP_NAME}" <${
    process.env.EMAIL_USER as string
  }>`;
  const batches = chunk(recipients, 25);

  let sent = 0;
  for (const group of batches) {
    const results = await Promise.allSettled(
      group.map((r: Recipient) =>
        transporter.sendMail({
          from: FROM,
          to: r.email,
          subject: `Daily goal reminder for ${formatLocalDay(r.local_day)}`,
          html: renderDailyGoalsEmail({
            appName: process.env.APP_NAME as string,
            timezone: r.timezone,
            localDay: formatLocalDay(r.local_day),
          }),
        })
      )
    );
    for (const res of results) {
      if (res.status === "fulfilled") sent += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    claimed: recipients.length,
    sent,
  });
}
