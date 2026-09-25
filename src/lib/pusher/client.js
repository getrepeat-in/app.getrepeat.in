import PusherClient from "pusher-js";

let clientInstance = null;

export const PUSHER_EVENTS = {
  ORDER_CREATED: "order:created",
  ORDER_UPDATED: "order:updated",
  ORDER_STATUS_CHANGED: "order:status_changed",
};

export const getRestaurantChannelName = (restaurantId) => `restaurant-${restaurantId}`;
export const getOrderChannelName = (orderIdOrNumber) => `order-${orderIdOrNumber}`;

export const getPusherClient = () => {
  if (typeof window === "undefined") return null;

  if (clientInstance) return clientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "9ba2ef6a94032aeb6a6c";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  clientInstance = new PusherClient(key, {
    cluster,
    forceTLS: true,
  });

  return clientInstance;
};
