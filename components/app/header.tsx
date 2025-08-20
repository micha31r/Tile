import { createClient } from '@/lib/supabase/server';
import Avatar from './avatar'
import { redirect } from 'next/navigation';
import { ShareIcon } from 'lucide-react';
import { UserDetailPopup } from './user-detail-popup';
import { getProfile } from '@/lib/data/profile';
import { ShareProfilePopup } from './share-profile-popup';

export async function Header() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const profile = await getProfile(data.claims.sub);

  return (
    <div className="sticky z-10 top-0 bg-background shadow-[0_-32px_0_48px_hsla(var(--background))] flex justify-between gap-4 items-center">
      <div>
        <UserDetailPopup>
          <Avatar size={32} firstName={profile?.first_name} lastName={profile?.last_name} email={data.claims.email} />
        </UserDetailPopup>
      </div>
      
      <p className="font-medium">{profile?.first_name ? profile?.first_name : "Home"}</p>

      <div>
        <ShareProfilePopup>
          <button className="flex items-center justify-center rounded-full w-8 aspect-square bg-secondary text-muted-foreground">
            <ShareIcon className="w-4 h-4" />
          </button>
        </ShareProfilePopup>
      </div>
    </div>
  )
}