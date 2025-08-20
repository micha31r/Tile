import { Logo } from "@/components/logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-between">
      <Logo tileWidth={28} />

      <p className="text-center leading-snug text-3xl">
        404 Not Found
      </p>

      <Link href="/" className="text-center rounded-full bg-foreground text-background px-6 py-4 w-full text-md font-medium hover:scale-95 transition-transform">
        Go to home
      </Link>
    </div>
  );
}
