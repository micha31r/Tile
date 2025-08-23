"use server";

import { createServerPush } from "next-push/server";
import { createClient } from "@/lib/supabase/server";
import { dangerCreateServerRoleClient } from "../supabase/server-role";

const pushServer = createServerPush(
  process.env.VAPID_SUBJECT!,
  {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
  }
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

function statusCodeFrom(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const maybe =
      (typeof o.statusCode === "number" ? o.statusCode : undefined) ??
      (typeof o.code === "number" ? o.code : undefined) ??
      (typeof o.status === "number" ? o.status : undefined);
    return maybe;
  }
  return undefined;
}

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


  type Outcome = { endpoint: string; ok: true } | { endpoint: string; ok: false; code?: number };
  
  // Send notifications in parallel
  const outcomes: Outcome[] = await Promise.all(
    webSubs.map(async (sub): Promise<Outcome> => {
      try {
        await pushServer.sendNotification(sub, payload);
        return { endpoint: sub.endpoint, ok: true };
      } catch (e: unknown) {
        return { endpoint: sub.endpoint, ok: false, code: statusCodeFrom(e) };
      }
    })
  );

  // Remove 404/410 endpoints
  const badEndpoints = outcomes
    .filter(o => !o.ok && (o.code === 404 || o.code === 410))
    .map(o => o.endpoint);

  if (badEndpoints.length) {
    const supabaseServiceRole = await dangerCreateServerRoleClient();
    await supabaseServiceRole
      .from("user_push_subscriptions")
      .delete()
      .in("endpoint", badEndpoints);
  }

  const sent = outcomes.filter(o => o.ok).length;
  const failed = outcomes.length - sent;

  return { ok: true, sent, failed, removed: badEndpoints.length };
}
