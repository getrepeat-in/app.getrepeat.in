import { triggerPusherEvent } from "@/lib/pusher/server";

/**
 * Emits a real-time event to a room/channel.
 * Compatible with serverless environments (Vercel).
 */
export const emitSocketEvent = async (event, room, payload) => {
  try {
    if (room) {
      await triggerPusherEvent([room], event, payload);
    } else {
      await triggerPusherEvent(["global"], event, payload);
    }
  } catch (error) {
    console.error(`[Pusher] Failed to emit '${event}' to room '${room}':`, error?.message || error);
  }
};
