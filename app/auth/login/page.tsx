"use client";
import { useAuthSync } from "@/components/app/auth/use-auth-sync";
import { StatusMessagePopup } from "@/components/app/status-message-popup";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useHaptic } from "react-haptic";

type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

function ensureDeviceId(): string {
  const key = 'auth-sync-device';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function LoginPage() {
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { status: authSyncStatus } = useAuthSync(deviceId);
  const router = useRouter();
  const { vibrate } = useHaptic();

  async function signInWithEmail(email: string) {
    const supabase = createClient();

    return await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent("/app")}&device=${deviceId}`,
      },
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    vibrate();

    const email = event.currentTarget.email.value;
    if (!email) {
      return;
    }

    setStatus('loading');

    const { error } = await signInWithEmail(email);
    if (error) {
      setStatus('error');
      router.push(`/auth/login?error=${error.message}`);
      return;
    }

    setStatus('success');
  }

  function handleReload() {
    vibrate();
    window.location.reload();
  }

  function handleTryAgain(event: React.MouseEvent<HTMLButtonElement>) {
    if (status === "success" || status === "error") {
      event.preventDefault();
      vibrate();
      setStatus('idle');
    }
  }

  useEffect(() => {
    setDeviceId(ensureDeviceId());
  }, []);

  useEffect(() => {
    if (authSyncStatus === "success") {
      router.push("/app");
    }
  }, [router, authSyncStatus]);

  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-between sm:pt-0 pt-4">
      <Suspense fallback={null}>
        <StatusMessagePopup />
      </Suspense>

      <div onClick={handleReload} className="hover:scale-95 transition-transform cursor-pointer">
        <Logo tileWidth={28} />
      </div>

      <div className="flex flex-col gap-6 w-full">
        <h3 className="text-center text-xl font-medium">Welcome to Tile</h3>
        <p className="text-center leading-snug text-xl">
          Enter your email address to<br /> get a magic link to log in.
        </p>
        <p className="text-center leading-snug text-xl">
          Didn&apos;t receive the email?<br /> Check your spam folder or email<br /> <Link className="underline" href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</Link>
        </p>
      </div>

      <form className="w-full" onSubmit={onSubmit}>
        <div className="h-0">
          <button onClick={handleTryAgain} className={cn("block -translate-y-[calc(100%+16px)] opacity-0 pointer-events-none transition-opacity text-muted-foreground text-sm m-auto", {
            "opacity-100 pointer-events-auto": status === "error" || status === "success",
          })}>
            Click to try again
          </button>
        </div>

        <input required type="email" name="email" autoComplete="off" data-1p-ignore data-lpignore="true" data-protonpass-ignore="true" className="mb-4 bg-secondary placeholder:text-muted-foreground py-4 indent-6 rounded-2xl w-full outline-2 outline-offset-4 outline-border font-medium" placeholder="tile@example.com" />
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
