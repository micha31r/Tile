"use server";

import { createClient } from "@/lib/supabase/server";
import { dangerCreateServerRoleClient } from "../supabase/server-role";
import webPush from "web-push";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type FriendSubscription = {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type WebSub = { 
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string
  }
};

export default async function sendPushNotification(userId: string, title: string, message: string) {
  const supabase = await createClient();

  const { data: subs, error } = await supabase
    .rpc("get_friend_subscriptions", { actor: userId });

  if (error) throw error;
  if (!subs || subs.length === 0) {
    return { ok: true, sent: 0, failed: 0, removed: 0 };
  }

  // Convert to Web Push subscription objects
  const webSubs: WebSub[] = (subs as FriendSubscription[]).map(s => ({
    endpoint: s.endpoint,
    keys: { p256dh: s.p256dh, auth: s.auth }
  }));

  const payload = {
    title,
    message,
    url: `/app?notificationUserId=${userId}`
  };

  type Result = { endpoint: string; statusCode: number };
  
  // Send notifications in parallel
  const results: Result[] = await Promise.all(
    webSubs.map(async (sub): Promise<Result> => {
      const { statusCode } = await webPush.sendNotification(sub, JSON.stringify(payload), {
        TTL: 60 
      });
      return {
        endpoint: sub.endpoint,
        statusCode
      };
    })
  );

  // Remove bad endpoints
  const badEndpoints = results
    .filter(result => result.statusCode === 404 || result.statusCode === 410 )
    .map(result => result.endpoint);

  if (badEndpoints.length) {
    const supabaseServiceRole = await dangerCreateServerRoleClient();
    await supabaseServiceRole
      .from("user_push_subscriptions")
      .delete()
      .in("endpoint", badEndpoints);
  }

  const sent = results.filter(result => result.statusCode === 200).length;
  const failed = results.length - sent;

  return { ok: true, sent, failed, removed: badEndpoints.length };
}
