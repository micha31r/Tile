import { createClient } from '@/lib/supabase/server';
import Avatar from './avatar'
import { redirect } from 'next/navigation';
import { ShareIcon } from 'lucide-react';

export async function Header() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;

  return (
    <div className="flex justify-between gap-4 items-center">
      <Avatar size={32} email={user.email + 3} />
      <p className="font-medium">{user.email.split("@")[0]}</p>
      <button className="flex items-center justify-center rounded-full w-8 aspect-square bg-secondary">
        <ShareIcon className="w-4 h-4" />
      </button>
    </div>
  )
}