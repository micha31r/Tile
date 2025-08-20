"use client";
import { createClient } from "@/lib/supabase/client";
import { JwtPayload } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileContextWrapper } from "@/components/app/profile-context-wrapper";


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

  if (!loaded) {
    return null;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <ProfileContextWrapper user={user}>
      {children}
    </ProfileContextWrapper>
  );
}
