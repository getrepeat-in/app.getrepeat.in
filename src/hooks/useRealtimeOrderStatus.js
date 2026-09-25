"use client";
import { useEffect, useState, useCallback } from "react";
import { getPusherClient, getOrderChannelName, PUSHER_EVENTS } from "@/lib/pusher/client";

export function useRealtimeOrderStatus({
  orderId,
  orderNumber,
  onStatusChange,
  refetch,
} = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);

  const identifier = orderId || orderNumber;

  const handleUpdate = useCallback(
    (data) => {
      const updatedOrder = data?.order || data;
      setLatestOrder(updatedOrder);

      if (onStatusChange) {
        onStatusChange(updatedOrder);
      }

      if (refetch) {
        refetch();
      }
    },
    [onStatusChange, refetch]
  );

  useEffect(() => {
    if (!identifier) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = getOrderChannelName(identifier);
    let channel = pusher.channel(channelName);
    if (!channel) {
      channel = pusher.subscribe(channelName);
    }

    if (channel.subscribed || pusher.connection.state === "connected") {
      setIsConnected(true);
    }

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channel.bind("pusher:subscription_error", (err) => {
      console.warn(`[Pusher] Order subscription error on ${channelName}:`, err);
    });

    channel.bind(PUSHER_EVENTS.ORDER_UPDATED, handleUpdate);
    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, handleUpdate);

    // Also subscribe to orderNumber channel if orderId was provided and vice versa
    let secondaryChannel = null;
    if (orderNumber && orderId && orderNumber !== orderId) {
      const secName = getOrderChannelName(orderNumber);
      secondaryChannel = pusher.subscribe(secName);
      secondaryChannel.bind(PUSHER_EVENTS.ORDER_UPDATED, handleUpdate);
      secondaryChannel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, handleUpdate);
    }

    return () => {
      channel.unbind(PUSHER_EVENTS.ORDER_UPDATED, handleUpdate);
      channel.unbind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, handleUpdate);
      pusher.unsubscribe(channelName);

      if (secondaryChannel) {
        const secName = getOrderChannelName(orderNumber);
        secondaryChannel.unbind_all();
        pusher.unsubscribe(secName);
      }

      setIsConnected(false);
    };
  }, [identifier, orderId, orderNumber, handleUpdate]);

  return {
    isConnected,
    latestOrder,
  };
}
