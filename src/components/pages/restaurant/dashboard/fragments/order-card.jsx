"use client";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns"; 
import { OrderService } from "@/services/frontend/order";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Clock, Utensils, Receipt, CheckCircle, ChefHat, Calendar, Info, UserCircle, Phone, Loader2 } from "lucide-react";

export default function OrderCard({ order, statusType, refetchOrders }) {
  const { restaurantId } = useRestaurant();
  const notify = useNotification();

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus) => OrderService.update(restaurantId, order._id, { status: newStatus }),
    onSuccess: () => {
      notify.success("Order status updated!");
      refetchOrders();
    },
    onError: () => {
      notify.error("Failed to update order status.");
    }
  });

  const getUrgencyColor = () => {
    const elapsedMinutes = (new Date() - new Date(order.createdAt)) / 60000;
    if (elapsedMinutes > 30) return "text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30";
    if (elapsedMinutes > 15) return "text-primary bg-primary/10 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30";
    return "text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30";
  };

  const handleNextAction = () => {
    const isOnline = order.orderType === "online";
    if (statusType === "new") {
      updateStatusMutation.mutate("PREPARING");
    } else if (statusType === "preparing") {
      updateStatusMutation.mutate("READY_FOR_PICKUP");
    } else if (statusType === "ready") {
      updateStatusMutation.mutate(isOnline ? "OUT_FOR_DELIVERY" : "DELIVERED"); 
    } else if (statusType === "dispatched") {
      updateStatusMutation.mutate("PICKED_UP");
    } else if (statusType === "pickedup") {
      updateStatusMutation.mutate("DELIVERED");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 transition-all duration-300 w-full">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-[2] flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 pb-4 md:pb-0 md:pr-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl leading-tight text-gray-900 dark:text-gray-100 mb-1">
                {order.orderNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1
                  ${order.orderType === 'dine-in' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  order.orderType === 'online' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  'bg-primary/20 text-primary border border-orange-200'}
                `}>
                  {order.orderType === "dine-in" ? <Utensils className="w-3.5 h-3.5" /> : <Receipt className="w-3.5 h-3.5" />}
                  {order.orderType}
                </span>
                {order.table && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                    Table {order.table.tableNumber}
                  </span>
                )}
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getUrgencyColor()}`}>
              <Clock className="w-4 h-4" />
              {format(new Date(order.createdAt), "hh:mm a")}
            </div>
          </div>

          {order.customer ? (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center shrink-0 border border-gray-300 dark:border-zinc-600">
                {order.customer.profileImageUrl ? (
                  <img src={order.customer.profileImageUrl} alt={order.customer.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{order.customer.name}</span>
                {order.customer.phone && (
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {order.customer.phone}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 text-gray-500 text-sm">
              <UserCircle className="w-5 h-5" />
              <span>Guest Customer</span>
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Order Placed</span>
              <span className="font-semibold">{format(new Date(order.createdAt), "MMM dd, yyyy • hh:mm a")}</span>
            </div>
          </div>

          {order.specialInstructions && order.specialInstructions.toLowerCase() !== "na" && (
            <div className="bg-primary/10 dark:bg-orange-900/20 text-primary dark:text-orange-300 p-3 rounded-lg text-sm flex items-start gap-2 border border-orange-200 dark:border-orange-900/40 mt-auto">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-[11px] uppercase tracking-wider mb-0.5 opacity-80">Order Notes</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">"{order.specialInstructions}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-[3] flex flex-col justify-between">
          <div className="flex flex-col gap-3 mb-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
              <span>Order Items ({order.items.length})</span>
            </h4>
            
            <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-2 hide-scrollbar">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-950/50 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center">
                        <span className="text-primary font-bold mr-2">{item.quantity}x</span> 
                        {item.name}
                      </p>
                      {item.variant?.name && (
                        <p className="text-xs text-gray-500 mt-0.5 ml-6">Variant: {item.variant.name}</p>
                      )}
                    </div>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">₹{(item.totalPrice || (item.unitPrice * item.quantity)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 gap-3">
            <div className="flex flex-col gap-2 text-sm px-1">
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  ₹{(order.subtotal || order.items.reduce((acc, item) => acc + (item.totalPrice || item.unitPrice * item.quantity), 0)).toFixed(2)}
                </span>
              </div>
              
              {(order.tax > 0) && (
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">₹{order.tax.toFixed(2)}</span>
                </div>
              )}
              
              {(order.discount > 0) && (
                <div className="flex justify-between items-center text-green-600 dark:text-green-500 font-medium">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200 dark:border-zinc-700">
              <div>
                <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide font-bold">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">₹{order.totalAmount?.toFixed(2) || "0.00"}</p>
              </div>
              
              <button
                onClick={handleNextAction}
                disabled={updateStatusMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-70 flex items-center justify-center gap-2 transition-all active:scale-95 min-w-[160px]"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {statusType === "new" && (
                      <>
                        <ChefHat className="w-4 h-4" />
                        Accept & Prepare
                      </>
                    )}
                    {statusType === "preparing" && (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark as Ready
                      </>
                    )}
                    {statusType === "ready" && (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {order.orderType === "online" ? "Dispatch Order" : "Serve Order"}
                      </>
                    )}
                    {statusType === "dispatched" && (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark Picked Up
                      </>
                    )}
                    {statusType === "pickedup" && (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark Delivered
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
