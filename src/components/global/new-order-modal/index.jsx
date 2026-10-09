"use client";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { OrderService } from "@/services/frontend/order";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { DietaryBadge } from "@/components/global/dietary-badge";
import { startOrderRinger, stopOrderRinger } from "@/lib/sound/orderChime";
import { getPusherClient, getRestaurantChannelName, PUSHER_EVENTS } from "@/lib/pusher/client";
import { Bell, Volume2, VolumeX, CheckCircle2, XCircle, MapPin, Phone, User, Clock, AlertTriangle, Receipt, FileText, ChevronLeft, ChevronRight, CheckCheck, Utensils, Store, Loader2 } from "lucide-react";


export function NewOrderAlertModal() {
  const { restaurantId: activeRestaurantId, restaurants } = useRestaurant();
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [orderQueue, setOrderQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const currentOrder = orderQueue[currentIndex] || orderQueue[0] || null;

  useEffect(() => {
    if (!restaurants || restaurants.length === 0) return;

    const fetchPendingOrders = async () => {
      try {
        const restaurantIds = restaurants.map(r => r._id).join(",");
        const response = await OrderService.getBulk({ status: "PLACED", restaurantIds, limit: 100 }).catch(() => null);
        
        let allPending = [];
        if (response) {
          const orders = response?.data?.orders || response?.data || response?.orders || response || [];
          const pendingOrders = Array.isArray(orders) ? orders.filter(o => o.orderStatus === "PLACED") : [];
          allPending.push(...pendingOrders);
        }

        if (allPending.length > 0) {
          setOrderQueue(prev => {
            const newOrders = allPending.filter(po => !prev.some(o => o._id === po._id));
            return [...prev, ...newOrders];
          });
        }
      } catch (err) {
        console.error("Failed to fetch initial pending orders:", err);
      }
    };

    fetchPendingOrders();
  }, [restaurants]);

  useEffect(() => {
    if (orderQueue.length > 0 && !isMuted) {
      startOrderRinger();
    } else {
      stopOrderRinger();
    }

    return () => {
      stopOrderRinger();
    };
  }, [orderQueue.length, isMuted]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (orderQueue.length === 0 || typeof document === "undefined") return;

    const originalTitle = document.title;
    let isFlashing = false;
    const interval = setInterval(() => {
      document.title = isFlashing
        ? `(${orderQueue.length}) 🔔 NEW ORDER RECEIVED!`
        : originalTitle;
      isFlashing = !isFlashing;
    }, 1000);

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [orderQueue.length]);

  useEffect(() => {
    if (!restaurants || restaurants.length === 0) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channels = restaurants.map(r => {
      const channelName = getRestaurantChannelName(r._id);
      let channel = pusher.channel(channelName);
      if (!channel) {
        channel = pusher.subscribe(channelName);
      }
      return { channel, restaurantId: r._id };
    });

    const handleNewOrder = (data, rId) => {
      const order = data?.order || data;
      if (!order || !order._id) return;

      if (!order.restaurantId) {
        order.restaurantId = rId;
      }

      const orderNum = order?.orderNumber || "New Order";
      const amount = order?.totalAmount ? ` ₹${order.totalAmount}` : "";

      notification.success(`🔔 Order #${orderNum} received!${amount}`, {
        duration: 5000,
      });

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(`🔔 New Order #${orderNum}!`, {
            body: `Total: ₹${order?.totalAmount || 0} • ${order?.items?.length || 0} item(s)`,
            icon: "/favicon.ico",
          });
        } catch (e) {
        }
      }

      queryClient.invalidateQueries({ queryKey: ["live-orders", rId] });
      queryClient.invalidateQueries({ queryKey: ["orders", rId] });

      setOrderQueue((prev) => {
        if (prev.some((o) => o._id === order._id)) return prev;
        return [...prev, order];
      });
    };

    const listeners = channels.map(({ channel, restaurantId }) => {
      const listener = (data) => handleNewOrder(data, restaurantId);
      channel.bind(PUSHER_EVENTS.ORDER_CREATED, listener);
      return { channel, listener };
    });

    return () => {
      listeners.forEach(({ channel, listener }) => {
        channel.unbind(PUSHER_EVENTS.ORDER_CREATED, listener);
      });
    };
  }, [restaurants, queryClient, notification]);

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  const handleDismissAll = () => {
    stopOrderRinger();
    setOrderQueue([]);
    setCurrentIndex(0);
    setShowRejectReason(false);
  };

  const handleDismissCurrent = () => {
    if (!currentOrder) return;
    setOrderQueue((prev) => {
      const next = prev.filter((o) => o._id !== currentOrder._id);
      setCurrentIndex((curr) => Math.min(curr, Math.max(0, next.length - 1)));
      return next;
    });
    setShowRejectReason(false);
    setRejectReason("");
  };

  const handlePrevOrder = () => {
    setShowRejectReason(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : orderQueue.length - 1));
  };

  const handleNextOrder = () => {
    setShowRejectReason(false);
    setCurrentIndex((prev) => (prev < orderQueue.length - 1 ? prev + 1 : 0));
  };

  const handleAcceptCurrent = async () => {
    if (!currentOrder) return;
    const orderRestaurantId = currentOrder.restaurantId || currentOrder.restaurant?._id || currentOrder.restaurant || activeRestaurantId;
    if (!orderRestaurantId) return;

    try {
      setIsProcessing(true);
      const targetOrder = currentOrder;

      await OrderService.update(orderRestaurantId, targetOrder._id, {
        action: "advance",
      });

      const remainingCount = orderQueue.length - 1;
      notification.success(
        `Order #${targetOrder.orderNumber} updated successfully: PREPARING${
          remainingCount > 0 ? ` (${remainingCount} more waiting)` : ""
        }`,
        { duration: 4000 }
      );

      queryClient.invalidateQueries({ queryKey: ["live-orders", orderRestaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderRestaurantId] });

      setShowRejectReason(false);
      setRejectReason("");

      setOrderQueue((prev) => {
        const next = prev.filter((o) => o._id !== targetOrder._id);
        setCurrentIndex((curr) => Math.min(curr, Math.max(0, next.length - 1)));
        return next;
      });
    } catch (err) {
      console.error("Failed to accept order:", err);
      notification.error(
        err?.response?.data?.message || err?.message || "Failed to accept order."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCurrent = async (reason) => {
    if (!currentOrder) return;
    const orderRestaurantId = currentOrder.restaurantId || currentOrder.restaurant?._id || currentOrder.restaurant || activeRestaurantId;
    if (!orderRestaurantId) return;

    try {
      setIsProcessing(true);
      const targetOrder = currentOrder;
      const finalReason = reason || rejectReason || "Restaurant unable to accept order at this time";

      await OrderService.update(orderRestaurantId, targetOrder._id, {
        action: "reject",
        reason: finalReason,
      });

      notification.success(
        `Order #${targetOrder.orderNumber} updated successfully: REJECTED`,
        { duration: 4000 }
      );

      queryClient.invalidateQueries({ queryKey: ["live-orders", orderRestaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderRestaurantId] });

      setShowRejectReason(false);
      setRejectReason("");

      setOrderQueue((prev) => {
        const next = prev.filter((o) => o._id !== targetOrder._id);
        setCurrentIndex((curr) => Math.min(curr, Math.max(0, next.length - 1)));
        return next;
      });
    } catch (err) {
      console.error("Failed to reject order:", err);
      notification.error(
        err?.response?.data?.message || err?.message || "Failed to reject order."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAll = async () => {
    if (orderQueue.length === 0) return;
    
    try {
      setIsProcessing(true);
      const ordersToProcess = [...orderQueue];

      await Promise.all(
        ordersToProcess.map((ord) => {
          const orderRestaurantId = ord.restaurantId || ord.restaurant?._id || ord.restaurant || activeRestaurantId;
          return OrderService.update(orderRestaurantId, ord._id, { action: "advance" })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["live-orders", orderRestaurantId] });
              queryClient.invalidateQueries({ queryKey: ["orders", orderRestaurantId] });
            });
        })
      );

      notification.success(
        `All ${ordersToProcess.length} orders updated successfully: PREPARING`,
        { duration: 4500 }
      );

      handleDismissAll();
    } catch (err) {
      console.error("Failed to accept all orders:", err);
      notification.error(
        err?.response?.data?.message || err?.message || "Failed to accept all orders."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = currentOrder?.totalAmount || 0;
  const items = currentOrder?.items || [];
  const orderType = currentOrder?.orderType || "DINE_IN";
  const table = currentOrder?.table;
  
  const currentRestaurantId = currentOrder?.restaurantId || currentOrder?.restaurant?._id || currentOrder?.restaurant || activeRestaurantId;
  const currentRestaurant = restaurants?.find(r => r._id === currentRestaurantId);

  return (
    <AnimatePresence>
      {currentOrder && orderQueue.length > 0 && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            key={currentOrder._id || "new-order-modal"}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 360 }}
            className="relative w-full max-w-xl bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5"
          >
          <div className="bg-white dark:bg-zinc-950 px-5 py-4 flex items-center justify-between shrink-0 border-b border-border shadow-sm">
            <div className="flex items-center gap-4">
              {currentRestaurant?.imageUrl || currentRestaurant?.logo || currentRestaurant?.image ? (
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-border shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={getImageUrl(currentRestaurant.imageUrl || currentRestaurant.logo || currentRestaurant.image, true)} 
                    alt={currentRestaurant.name || "Restaurant"} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentRestaurant.name || "R");
                    }} 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 shadow-sm flex items-center justify-center shrink-0 text-primary">
                  <Store className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: isMuted ? 0 : [-12, 12, -12, 12, 0],
                      scale: isMuted ? 1 : [1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "easeInOut",
                    }}
                    className="flex items-center text-primary"
                  >
                    <Bell className="w-4.5 h-4.5 fill-primary/20" />
                  </motion.div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-foreground">
                    {orderQueue.length > 1
                      ? `${orderQueue.length} New Orders Waiting!`
                      : "New Order Received!"}
                  </h3>
                  {orderQueue.length > 1 && (
                    <span className="bg-primary/10 text-primary text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs border border-primary/20">
                      {currentIndex + 1} of {orderQueue.length}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground font-medium tracking-wide mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border">Order #{currentOrder.orderNumber}</span>
                  {currentRestaurant && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-bold flex items-center gap-1 text-foreground">
                        {currentRestaurant.name} {currentRestaurant.location ? `(${currentRestaurant.location})` : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border shadow-xs"
                title={isMuted ? "Unmute Ring" : "Mute Ring"}
              >
                {isMuted ? (
                  <VolumeX className="w-4.5 h-4.5" />
                ) : (
                  <Volume2 className="w-4.5 h-4.5" />
                )}
              </Button>
            </div>
          </div>

          {orderQueue.length > 1 && (
            <div className="flex items-center justify-between px-3 py-2 bg-muted/60 border-b border-border/70 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 mr-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
                  Queue:
                </span>
                {orderQueue.map((ord, idx) => (
                  <button
                    key={ord._id}
                    onClick={() => {
                      setShowRejectReason(false);
                      setCurrentIndex(idx);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      idx === currentIndex
                        ? "bg-primary text-primary-foreground shadow-xs scale-102"
                        : "bg-card text-foreground/80 hover:bg-muted border border-border"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>#{ord.orderNumber.slice(-6)}</span>
                    <span className="opacity-80">₹{ord.totalAmount}</span>
                  </button>
                ))}
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevOrder}
                  className="h-7 w-7 rounded-md cursor-pointer border-border"
                  title="Previous Order"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextOrder}
                  className="h-7 w-7 rounded-md cursor-pointer border-border"
                  title="Next Order"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-foreground">
            <div className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
                  {orderType.replace(/_/g, " ")}
                </span>
                {table?.tableNumber && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-muted-foreground" />
                    Table {table.tableNumber} {table.zone ? `• ${table.zone}` : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {currentOrder.createdAt
                    ? `Placed at ${format(new Date(currentOrder.createdAt), "hh:mm a")}`
                    : "Placed just now"}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block leading-tight">Customer</span>
                  <span className="font-bold text-foreground truncate block">
                    {currentOrder.customer?.name || "Guest Customer"}
                  </span>
                  {currentOrder.customer?.email && (
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {currentOrder.customer.email}
                    </span>
                  )}
                </div>
              </div>
              {currentOrder.customer?.phone ? (
                <a
                  href={`tel:${currentOrder.customer.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary shrink-0 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block leading-tight">Phone</span>
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate block">
                      {currentOrder.customer.phone}
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60 text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px]">No phone provided</span>
                </div>
              )}
            </div>

            {orderType === "DELIVERY" && currentOrder.deliveryAddress && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                      Delivery Address
                    </span>
                    {currentOrder.deliveryAddress.label && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {currentOrder.deliveryAddress.label}
                      </span>
                    )}
                  </div>
                  <span className="text-blue-800/90 dark:text-blue-300 leading-relaxed block text-xs">
                    {currentOrder.deliveryAddress.street}, {currentOrder.deliveryAddress.city}
                    {currentOrder.deliveryAddress.state ? `, ${currentOrder.deliveryAddress.state}` : ""}{" "}
                    {currentOrder.deliveryAddress.zipCode}
                  </span>
                  {currentOrder.deliveryAddress.instructions && (
                    <span className="text-[11px] text-blue-700 dark:text-blue-400 italic block mt-1">
                      <span className="font-semibold not-italic">Delivery Note: </span>
                      "{currentOrder.deliveryAddress.instructions}"
                    </span>
                  )}
                </div>
              </div>
            )}

            {orderType === "DINE_IN" && table && (
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 text-xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">
                    Table {table.tableNumber} {table.label ? `(${table.label})` : ""}
                  </span>
                  {table.zone && (
                    <span className="text-purple-700 dark:text-purple-300 text-[11px]">
                      Zone: {table.zone}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                <span>Items Ordered ({items.length})</span>
                <span>Subtotal</span>
              </div>
              <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card max-h-60 overflow-y-auto">
                {items.map((item, idx) => {
                  const variantName = item.variant?.name || item.selectedVariant?.name;
                  const variantPrice = item.variant?.price || item.selectedVariant?.price;
                  const addons = Array.isArray(item.addons) ? item.addons : [];
                  const itemNote = item.specialInstructions;
                  const dietary = item.dietaryType || item.menuItem?.dietaryType;
                  const lineTotal =
                    item.totalPrice ||
                    (item.unitPrice
                      ? item.unitPrice * item.quantity
                      : (item.price || item.menuItem?.base_price || 0) * (item.quantity || 1));

                  return (
                    <div key={idx} className="p-3 text-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <DietaryBadge dietaryType={dietary} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px] shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-bold text-foreground text-xs leading-snug">
                                {item.name || item.menuItem?.name || "Item"}
                              </span>
                            </div>

                            {variantName && variantName.trim() !== "" && (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/80 border border-border/60 text-[11px] font-semibold text-muted-foreground">
                                <span>Variant:</span>
                                <span className="text-foreground font-bold">{variantName}</span>
                                {variantPrice > 0 && (
                                  <span className="opacity-80">
                                    (₹{Number(variantPrice).toFixed(2)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-foreground text-xs block">
                            ₹{Number(lineTotal).toFixed(2)}
                          </span>
                          {item.quantity > 1 && item.unitPrice && (
                            <span className="text-[10px] text-muted-foreground block">
                              @ ₹{Number(item.unitPrice).toFixed(2)}/ea
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {addons.length > 0 && (
                        <div className="ml-6 space-y-1 pt-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Add-ons:
                          </span>
                          <div className="flex flex-col gap-1">
                            {addons.map((addon, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/40 border border-border/50 text-[11px]"
                              >
                                <span className="font-medium text-foreground/90">
                                  + {addon.name}
                                </span>
                                <span className="font-bold text-foreground shrink-0">
                                  {addon.price > 0
                                    ? `₹${Number(addon.price).toFixed(2)}`
                                    : "FREE"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {itemNote && (
                        <div className="ml-6 mt-1 px-2 py-1 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 italic flex items-start gap-1.5">
                          <span className="font-semibold not-italic">Note:</span>
                          <span>"{itemNote}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
              
            {currentOrder.specialInstructions && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5 text-amber-900 dark:text-amber-300">Order Note:</span>
                  <span className="italic leading-relaxed">
                    "{currentOrder.specialInstructions}"
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                    Bill Summary
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-card border border-border font-bold text-[11px] text-foreground">
                    {currentOrder.paymentMethod || "CASH"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                      currentOrder.paymentStatus?.toLowerCase() === "paid" ||
                      currentOrder.paymentStatus?.toLowerCase() === "completed"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {currentOrder.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px]">
                {currentOrder.subtotal != null && currentOrder.subtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ₹{Number(currentOrder.subtotal).toFixed(2)}
                    </span>
                  </div>
                )}
                {currentOrder.tax != null && currentOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Taxes & Charges</span>
                    <span className="font-semibold text-foreground">
                      +₹{Number(currentOrder.tax).toFixed(2)}
                    </span>
                  </div>
                )}
                {currentOrder.discount != null && currentOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{Number(currentOrder.discount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  ₹{Number(totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {showRejectReason && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl space-y-2.5 text-xs"
              >
                <div className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Select Reason for Rejection:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Restaurant too busy",
                    "Items out of stock",
                    "Kitchen closed",
                    "Delivery unavailable",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRejectReason(r)}
                      disabled={isProcessing}
                      className={`px-2.5 py-1.5 rounded-md text-left text-[11px] font-medium border transition-colors cursor-pointer ${
                        rejectReason === r
                          ? "bg-red-100 dark:bg-red-900/60 border-red-400 text-red-900 dark:text-red-200"
                          : "bg-card border-border hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or type custom reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-card border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectCurrent()}
                    disabled={isProcessing}
                    className="h-8 px-3 text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border/60 flex flex-col gap-2 shrink-0">
            {!showRejectReason ? (
              <>
                <div className="flex items-center gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectReason(true)}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 font-bold gap-2 transition-all cursor-pointer text-[15px]"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleAcceptCurrent}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md gap-2 transition-all cursor-pointer text-[15px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Accept & Prepare</span>
                      </>
                    )}
                  </Button>
                </div>

                {orderQueue.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAcceptAll}
                    disabled={isProcessing}
                    className="w-full h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Accept All ({orderQueue.length} Orders)</span>
                  </Button>
                )}
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowRejectReason(false)}
                className="w-full h-10 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-medium"
              >
                ← Back to Accept / Reject
              </Button>
            )}
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
