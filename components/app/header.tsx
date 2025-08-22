"use client";

import Avatar from './avatar';
import { ShareIcon } from 'lucide-react';
import { UserDetailPopup } from './user-detail-popup';
import { ShareProfilePopup } from './share-profile-popup';
import { useContext } from 'react';
import { ProfileContext } from './profile-context';
import { useHaptic } from 'react-haptic';

export function Header() {
  const { profile, email } = useContext(ProfileContext);
  const { vibrate } = useHaptic();

  function handleReload() {
    vibrate();
    window.location.reload();
  }

  return (
    <div className="sticky z-10 top-0 bg-background shadow-[0_-32px_0_48px_hsla(var(--background))] flex w-full justify-between gap-4 items-center">
      <div>
        <UserDetailPopup>
          <Avatar size={32} firstName={profile?.first_name} lastName={profile?.last_name} email={email} />
        </UserDetailPopup>
      </div>

      <p onClick={handleReload} className="flex-1 font-medium text-center cursor-pointer">
        <span className="line-clamp-1 break-all">{profile?.first_name ? profile?.first_name : "Home"}</span>
      </p>

      <div>
        <ShareProfilePopup>
          <button className="flex items-center justify-center rounded-full w-8 aspect-square bg-secondary text-muted-foreground">
            <ShareIcon className="w-4 h-4" />
          </button>
        </ShareProfilePopup>
      </div>
    </div>
  );
}