"use client";

import { Logo } from "@/components/logo";
import Link from "next/link";
import { useHaptic } from "react-haptic";

export default function Home() {
  const { vibrate } = useHaptic();

  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-between sm:pt-0 pt-4">
      <Logo tileWidth={28} />

      <p className="text-center leading-snug text-xl">
        Distractions are
        <br />
        everywhere.

        <br /><br />
        We&apos;ve all tried filling our days with packed schedules, only to end up drained and burned out.
        But being productive isn&apos;t about doing more, it&apos;s about getting the right things done.

        <br /><br />
        That&apos;s why we built Tile.

        <br /><br />
        Our philosophy? Keep it simple.

        <br />
        4 goals, daily check-offs, and friends 
        
        <br />
        to keep you motivated.
      </p>

      <Link onClick={vibrate} href="/auth/login" className="text-center rounded-full bg-foreground text-background px-6 py-4 w-full text-md font-medium hover:scale-95 transition-transform">
        Continue with email
      </Link>
    </div>
  );
}
