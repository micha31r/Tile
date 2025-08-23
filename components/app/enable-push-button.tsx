'use client';

import { useNextPush } from 'next-push/client';
import { createClient } from '@/lib/supabase/client';
import { useContext } from 'react';
import { ProfileContext } from './profile-context';
import { useHaptic } from 'react-haptic';

export function EnablePush() {
  const { subscribe, subscribed, loading, isSupported } = useNextPush();
  const { userId } = useContext(ProfileContext);
  const { vibrate } = useHaptic();

  const save = async (subscription: PushSubscription) => {
    if (!subscription) return;
    const supabase = createClient();

    // Normalise the shape for storage
    const endpoint = subscription.endpoint;
    const keyPair = subscription.toJSON()?.keys as { p256dh?: string; auth?: string } | undefined;

    if (keyPair?.p256dh && keyPair?.auth) {
      const { error } = await supabase.from('user_push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint,
          p256dh: keyPair.p256dh,
          auth: keyPair.auth,
          ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'web'
        }, { onConflict: 'endpoint' });

      if (process.env.NODE_ENV === "development") {
        console.log(error);
      }
    } else {
      console.log("No p256dh or auth on keyPair");
    }
  };

  const enable = async () => {
    vibrate();
    await subscribe();

    // Immediately read the actual subscription from the SW
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await save(subscription);
    } else {
      console.log('No subscription returned after subscribe()');
    }
  };

  if (!isSupported) return <p>Push not supported.</p>;

  return (
    <button disabled={loading || subscribed} onClick={enable}>
      {subscribed ? 'Notifications enabled' : (loading ? 'Enabling…' : 'Enable notifications')}
    </button>
  );
}
