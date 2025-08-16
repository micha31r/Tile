"use client"
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

export default function LoginPage() {
  const [status, setStatus] = useState<ButtonStatus>('idle')

  async function signInWithEmail(email: string) {
    const supabase = createClient();

    return await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = event.currentTarget.email.value;
    if (!email) {
      return
    }

    setStatus('loading')

    const { error } = await signInWithEmail(email)
    if (error) {
      setStatus('error')
    }

    setStatus('success')
  }

  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-between">
      <Logo tileWidth={28} />

      <div className="flex flex-col gap-6 w-full">
        <h3 className="text-center text-xl font-semibold">Welcome to Tile</h3>
        <p className="text-center leading-snug text-xl">
          Enter your email address to get a magic link to log in.
        </p>
        <p className="text-center leading-snug text-xl">
          Didn&apos;t receive the email? Check your spam folder or contact us at <Link className="underline" href="mailto:support@tile.com">support@tile.com</Link>
        </p>
      </div>

      <form className="space-y-4 w-full" onSubmit={onSubmit}>
        <input required type="email" name="email" autoComplete="off" data-1p-ignore data-lpignore="true" data-protonpass-ignore="true" className="bg-secondary placeholder:text-muted-foreground py-4 indent-6 rounded-2xl w-full outline-2 outline-offset-4 outline-border font-medium" placeholder="tile@example.com" />
        <button disabled={status !== 'idle'} type="submit" className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-4 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          {status === 'idle' && "Get magic link"}
          {status === 'loading' && "Sending..."}
          {status === 'success' && "Check your inbox"}
          {status === 'error' && "Error, please try again"}
        </button>
      </form>
    </div>
  );
}
