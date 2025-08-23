'use client';

import { useNextPush } from 'next-push/client';
import { createClient } from '@/lib/supabase/client';

export function EnablePush() {
  const { subscribe, subscribed, subscription, loading, isSupported } = useNextPush();

  const save = async () => {
    if (!subscription) return;
    const supabase = createClient();

    // Normalise the shape for storage
    const endpoint = subscription.endpoint;
    const keyPair = subscription.toJSON()?.keys as { p256dh?: string; auth?: string } | undefined;

    await supabase.from('user_push_subscriptions')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        endpoint,
        p256dh: keyPair?.p256dh ?? '',
        auth: keyPair?.auth ?? '',
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'web'
      }, { onConflict: 'endpoint' });
  };

  const enable = async () => {
    await subscribe(); // prompts user, registers SW, creates subscription
    await save();      // persist to Supabase
  };

  if (!isSupported) return <p>Push not supported.</p>;

  return (
    <button disabled={loading || subscribed} onClick={enable}>
      {subscribed ? 'Notifications enabled' : (loading ? 'Enabling…' : 'Enable notifications')}
    </button>
  );
}
