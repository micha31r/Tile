import { Logo } from "@/components/logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-between">
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
        A simple app designed to help you focus on outcomes, while giving you the freedom to breathe.
      </p>

      <Link href="/auth/login" className="text-center rounded-full bg-foreground text-background px-8 py-4 w-full text-md font-medium hover:scale-95 transition-transform">
        Continue with email
      </Link>
    </div>
  );
}
