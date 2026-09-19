const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:4000";

export const emitSocketEvent = async (event, room, payload) => {
  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/internal/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        room,
        payload,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to emit socket event '${event}' to room '${room}':`, response.statusText);
    }
  } catch (error) {
    console.error(`Socket server unreachable while emitting '${event}' to room '${room}':`, error.message);
  }
};
