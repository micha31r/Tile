"use client";
import { createClient } from "@/lib/supabase/client";
import { JwtPayload } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileContextWrapper } from "@/components/app/profile-context-wrapper";
import Loading from "../loading";
import { cn } from "@/lib/utils";


export default function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [user, setUser] = useState<JwtPayload>();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) return;
      setUser(data.claims);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) {

    }
  }, [loaded]);

  if (!loaded) {
    return <Loading />;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <ProfileContextWrapper user={user}>
      <Loading className={cn("fixed z-30 inset-0 w-full h-[100svh]", {
        "opacity-0 pointer-events-none": loaded
      })} />
      {children}
    </ProfileContextWrapper>
  );
}
