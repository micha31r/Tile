'use client';

import { useNextPush } from 'next-push/client';
import { createClient } from '@/lib/supabase/client';
import { useContext, useEffect, useState } from 'react';
import { ProfileContext } from './profile-context';
import { useHaptic } from 'react-haptic';
import { useRouter } from 'next/navigation';

type pushServiceRecord ={
  id: string
}

export function EnablePush() {
  const { subscribe, subscribed, loading, isSupported } = useNextPush();
  const [pushRecord, setPushRecord] = useState<pushServiceRecord | null>(null);
  const [pushRecordLoading, setPushRecordLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const { userId } = useContext(ProfileContext);
  const { vibrate } = useHaptic();
  const supabase = createClient();
  const router = useRouter();

  async function save(subscription: PushSubscription): Promise<boolean> {
    if (!subscription) return false;

    // Normalise the shape for storage
    const endpoint = subscription.endpoint;
    const keyPair = subscription.toJSON()?.keys as { p256dh?: string; auth?: string } | undefined;

    if (keyPair?.p256dh && keyPair?.auth) {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null;
      const platform = ua && /iPhone|iPad|iPod/.test(ua) ? 'ios' : 'web';

      const { error } = await supabase.from('user_push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint,
          p256dh: keyPair.p256dh,
          auth: keyPair.auth,
          ua,
          platform
        }, { onConflict: 'endpoint' });

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.log(error);
        }
        return false;
      }
      return true;
    } else {
      console.log("No p256dh or auth on keyPair");
      return false;
    }
  };

  async function enable() {
    vibrate();

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        await subscribe();
        subscription = await registration.pushManager.getSubscription();
      }

      if (subscription) {
        const success = await save(subscription);
        if (success) {
          setVisible(false);
          router.push(`/app?success=${encodeURIComponent("Successfully turned on notifications")}`);
        }
      } else {
        console.log('No subscription returned after subscribe()');
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.log('Enable push failed:', e);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (!isSupported) {
        setPushRecordLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const endpoint = subscription.endpoint;
          const { data, error } = await supabase
            .from('user_push_subscriptions')
            .select('id')
            .eq('endpoint', endpoint)
            .maybeSingle();

          if (error && process.env.NODE_ENV === "development") {
            console.log(`Failed to find subscription for ${endpoint}: ${error.message}`);
          }
          setPushRecord(data);
        }
      } finally {
        setPushRecordLoading(false);
        setVisible(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  if (!isSupported || !visible || pushRecordLoading) {
    return null;
  }
  
  const notificationEnabled = subscribed && !!pushRecord;
  
  if (notificationEnabled) {
    console.log("Notification is on");
    return null;
  }

  return (
    <div className="space-y-2 p-4 bg-secondary rounded-3xl">
      <h4 className="font-medium">Turn on notifications?</h4>
      <p className="text-sm">Receive updates when your friends complete their goals to stay extra motivated.</p>
      <div className="grid grid-cols-2 gap-3 !mt-4">
        <button 
          onClick={() => setVisible(false)}
          className="p-2.5 bg-black/10 dark:bg-white/10 rounded-full font-medium hover:scale-95 transition-transform cursor-pointer"
        >
          Close
        </button>
        <button 
          disabled={loading} 
          onClick={enable}
          className="p-3 py-1.5 bg-foreground text-background rounded-full font-medium hover:scale-95 transition-transform cursor-pointer"
        >
          {notificationEnabled ? 'Notifications enabled' : (loading ? 'Enabling…' : 'Enable')}
        </button>
      </div>
    </div>
  );
}
