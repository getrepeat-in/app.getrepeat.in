import Pusher from "pusher";

let pusherInstance = null;

export const getPusherServer = () => {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "ap2";

  if (!appId || !key || !secret) {
    console.warn("[Pusher Server] Credentials missing. Set PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER.");
    return null;
  }

  pusherInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherInstance;
};

export const triggerPusherEvent = async (channelOrChannels, event, data) => {
  try {
    const pusher = getPusherServer();
    if (!pusher) return false;

    await pusher.trigger(channelOrChannels, event, data);
    return true;
  } catch (error) {
    console.error(`[Pusher Server] Failed to trigger '${event}':`, error?.message || error);
    return false;
  }
};
