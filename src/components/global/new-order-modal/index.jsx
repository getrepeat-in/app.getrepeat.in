"use client";
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  User,
  Clock,
  AlertTriangle,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/services/frontend/order";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { startOrderRinger, stopOrderRinger } from "@/lib/sound/orderChime";
import {
  getPusherClient,
  getRestaurantChannelName,
  PUSHER_EVENTS,
} from "@/lib/pusher/client";

export function NewOrderAlertModal() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [orderQueue, setOrderQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const currentOrder = orderQueue[currentIndex] || null;

  // 1. Independent Continuous Ringer Effect:
  // Keeps ringing as long as there are pending orders in queue and not muted.
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

  // 2. Pusher Real-Time Listener Effect:
  // Subscribes once to the restaurant channel and never cancels the ringer on queue changes.
  useEffect(() => {
    if (!restaurantId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = getRestaurantChannelName(restaurantId);
    let channel = pusher.channel(channelName);
    if (!channel) {
      channel = pusher.subscribe(channelName);
    }

    const handleNewOrder = (data) => {
      const order = data?.order || data;
      if (!order || !order._id) return;

      // Invalidate dashboard caches immediately
      queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

      setOrderQueue((prev) => {
        // Prevent duplicate entries of the same order
        if (prev.some((o) => o._id === order._id)) return prev;
        return [...prev, order];
      });
    };

    channel.bind(PUSHER_EVENTS.ORDER_CREATED, handleNewOrder);

    return () => {
      channel.unbind(PUSHER_EVENTS.ORDER_CREATED, handleNewOrder);
    };
  }, [restaurantId, queryClient]);

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

  // Accept current order
  const handleAcceptCurrent = async () => {
    if (!currentOrder || !restaurantId) return;
    try {
      setIsProcessing(true);
      const targetOrder = currentOrder;

      await OrderService.update(restaurantId, targetOrder._id, {
        action: "advance",
      });

      const remainingCount = orderQueue.length - 1;
      notification.success(
        `Order #${targetOrder.orderNumber} accepted! Moved to Preparing.${
          remainingCount > 0 ? ` (${remainingCount} more waiting)` : ""
        }`,
        { duration: 4000 }
      );

      await queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      await queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

      setShowRejectReason(false);
      setRejectReason("");

      // Remove accepted order from queue; ringer keeps ringing if more remain
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

  // Reject current order
  const handleRejectCurrent = async (reason) => {
    if (!currentOrder || !restaurantId) return;
    try {
      setIsProcessing(true);
      const targetOrder = currentOrder;
      const finalReason = reason || rejectReason || "Restaurant unable to accept order at this time";

      await OrderService.update(restaurantId, targetOrder._id, {
        action: "reject",
        reason: finalReason,
      });

      notification.success(
        `Order #${targetOrder.orderNumber} has been rejected.`,
        { duration: 4000 }
      );

      await queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      await queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

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

  // Accept all pending orders in queue
  const handleAcceptAll = async () => {
    if (orderQueue.length === 0 || !restaurantId) return;
    try {
      setIsProcessing(true);
      const ordersToProcess = [...orderQueue];

      await Promise.all(
        ordersToProcess.map((ord) =>
          OrderService.update(restaurantId, ord._id, { action: "advance" })
        )
      );

      notification.success(
        `All ${ordersToProcess.length} orders accepted! Moved to Preparing.`,
        { duration: 4500 }
      );

      await queryClient.invalidateQueries({ queryKey: ["live-orders", restaurantId] });
      await queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

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

  if (!currentOrder || orderQueue.length === 0) return null;

  const totalAmount = currentOrder.totalAmount || 0;
  const items = currentOrder.items || [];
  const orderType = currentOrder.orderType || "DINE_IN";
  const table = currentOrder.table;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          key="new-order-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 360 }}
          className="relative w-full max-w-lg bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5"
        >
          {/* Top Ringing Alert Banner - Solid Primary Color */}
          <div className="bg-primary px-5 py-4 text-primary-foreground flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3.5">
              <motion.div
                animate={{
                  rotate: isMuted ? 0 : [-12, 12, -12, 12, 0],
                  scale: isMuted ? 1 : [1, 1.08, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeInOut",
                }}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-xs"
              >
                <Bell className="w-5 h-5 text-white fill-white/25" />
              </motion.div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white">
                    {orderQueue.length > 1
                      ? `${orderQueue.length} New Orders Waiting!`
                      : "New Order Received!"}
                  </h3>
                  {orderQueue.length > 1 && (
                    <span className="bg-white text-primary text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {currentIndex + 1} of {orderQueue.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/85 font-medium tracking-wide mt-0.5">
                  Order #{currentOrder.orderNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="h-8.5 w-8.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title={isMuted ? "Unmute Ring" : "Mute Ring"}
              >
                {isMuted ? (
                  <VolumeX className="w-4.5 h-4.5 text-white/70" />
                ) : (
                  <Volume2 className="w-4.5 h-4.5 text-white" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissAll}
                className="h-8.5 w-8.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Dismiss All"
              >
                <X className="w-4.5 h-4.5 text-white" />
              </Button>
            </div>
          </div>

          {/* Multi-Order Concurrent Queue Strip (when >1 order is waiting) */}
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

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-foreground">
            {/* Order Type & Meta Info Header */}
            <div className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
                  {orderType.replace(/_/g, " ")}
                </span>
                {table?.tableNumber && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border">
                    Table {table.tableNumber} {table.zone ? `• ${table.zone}` : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Placed just now</span>
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
                </div>
              </div>
              {currentOrder.customer?.phone && (
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
              )}
            </div>

            {/* Delivery Address (if Delivery) */}
            {orderType === "DELIVERY" && currentOrder.deliveryAddress && (
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5 text-xs">
                    Delivery Address
                  </span>
                  <span className="text-blue-800/90 dark:text-blue-300 leading-relaxed block text-xs">
                    {currentOrder.deliveryAddress.street},{" "}
                    {currentOrder.deliveryAddress.city}{" "}
                    {currentOrder.deliveryAddress.zipCode}
                  </span>
                </div>
              </div>
            )}

            {/* Ordered Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                <span>Items Ordered ({items.length})</span>
                <span>Subtotal</span>
              </div>
              <div className="divide-y divide-border/50 rounded-xl border border-border/70 bg-muted/20 max-h-48 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs shrink-0">
                        {item.quantity}x
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-foreground block truncate">
                          {item.menuItem?.name || item.name || "Item"}
                        </span>
                        {item.selectedVariant && (
                          <span className="text-[11px] text-muted-foreground block">
                            {item.selectedVariant.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold shrink-0 text-foreground">
                      ₹{((item.price || item.menuItem?.base_price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions (if any) */}
            {currentOrder.specialInstructions && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5 text-amber-900 dark:text-amber-300">Special Note:</span>
                  <span className="italic leading-relaxed">
                    "{currentOrder.specialInstructions}"
                  </span>
                </div>
              </div>
            )}

            {/* Payment & Amount Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-xs">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="font-semibold text-muted-foreground uppercase text-[11px]">
                  Payment:
                </span>
                <span className="font-bold px-2 py-0.5 rounded-md bg-card text-foreground border border-border text-[11px]">
                  {currentOrder.paymentMethod || "CASH"} ({currentOrder.paymentStatus || "PENDING"})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                  Total Bill
                </span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  ₹{Number(totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Reject Reason Selector Drawer/Panel */}
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
                      onClick={() => handleRejectCurrent(r)}
                      disabled={isProcessing}
                      className="px-2.5 py-1.5 rounded-md text-left text-[11px] font-medium bg-card border border-border hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
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

          {/* Action Buttons Footer */}
          <div className="p-4 bg-muted/30 border-t border-border/60 flex flex-col gap-2 shrink-0">
            {!showRejectReason ? (
              <>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectReason(true)}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 font-bold gap-2 transition-all cursor-pointer text-sm"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                    <span>Reject</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleAcceptCurrent}
                    disabled={isProcessing}
                    className="flex-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 gap-2 transition-all cursor-pointer text-sm"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Accepting...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Accept & Prepare</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Accept All Shortcut when multiple orders are waiting */}
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
    </AnimatePresence>
  );
}
