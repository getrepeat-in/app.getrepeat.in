"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useNotification from "@/store/hooks/useNotification";
import { playOrderChime } from "@/lib/sound/orderChime";
import { getPusherClient, getRestaurantChannelName, PUSHER_EVENTS } from "@/lib/pusher/client";

export function useRealtimeOrders({
  restaurantId,
  playChimeOnNewOrder = false,
  showNotificationOnNewOrder = true,
  onNewOrder,
  onOrderUpdated,
} = {}) {
  const queryClient = useQueryClient();
  const notification = useNotification();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = getRestaurantChannelName(restaurantId);
    let channel = pusher.channel(channelName);
    if (!channel) {
      channel = pusher.subscribe(channelName);
    }

    if (channel.subscribed || pusher.connection.state === "connected") {
      setIsConnected(true);
    }

    const onSubSucceeded = () => setIsConnected(true);
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => {
      // Even if websocket temporarily reconnects, background polling keeps data fresh
    };

    channel.bind("pusher:subscription_succeeded", onSubSucceeded);
    pusher.connection.bind("connected", onConnected);
    pusher.connection.bind("disconnected", onDisconnected);

    // Handle new incoming order
    const handleOrderCreated = (data) => {
      const order = data?.order || data;

      if (playChimeOnNewOrder) {
        playOrderChime();
      }

      if (showNotificationOnNewOrder) {
        const orderNum = order?.orderNumber || "New Order";
        const amount = order?.totalAmount ? ` ₹${order.totalAmount}` : "";
        notification.success(`🔔 ${orderNum} received!${amount}`, {
          duration: 5000,
        });
      }

      // Invalidate relevant react-query caches
      queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

      if (onNewOrder) {
        onNewOrder(order);
      }
    };

    // Handle order status or payment updates
    const handleOrderUpdated = (data) => {
      queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

      const orderId = data?.orderId || data?.order?._id;
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }

      if (onOrderUpdated) {
        onOrderUpdated(data);
      }
    };

    channel.bind(PUSHER_EVENTS.ORDER_CREATED, handleOrderCreated);
    channel.bind(PUSHER_EVENTS.ORDER_UPDATED, handleOrderUpdated);

    return () => {
      channel.unbind("pusher:subscription_succeeded", onSubSucceeded);
      pusher.connection.unbind("connected", onConnected);
      pusher.connection.unbind("disconnected", onDisconnected);
      channel.unbind(PUSHER_EVENTS.ORDER_CREATED, handleOrderCreated);
      channel.unbind(PUSHER_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    };
  }, [
    restaurantId,
    queryClient,
    notification,
    playChimeOnNewOrder,
    showNotificationOnNewOrder,
    onNewOrder,
    onOrderUpdated,
  ]);

  return { isConnected };
}
