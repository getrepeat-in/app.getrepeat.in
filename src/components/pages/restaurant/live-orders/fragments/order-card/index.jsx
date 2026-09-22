"use client";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ORDER_TYPE_MAP } from "../helpers/constants";
import { ItemImage } from "@/components/global/item-image";
import { getStatusConfig, getDietaryConfig, getElapsedTime, formatTime } from "../helpers"
import { Clock, Phone, Printer, FileText, ChevronDown, ChevronUp, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const OrderCard = ({ order, onUpdateStatus, onRejectStatus }) => {
    if (!order) return null;

    const { _id, orderNumber, orderStatus, customer, restaurant, items = [], totalAmount, createdAt, paymentStatus, orderType = "DINE_IN", table, specialInstructions } = order;
    const displayId = orderNumber || _id?.slice(-4);
    
    let statusConfig = getStatusConfig(orderStatus);
    const ACTION_LABELS = {
        DINE_IN: {
            PLACED:     { actionLabel: "Accept & Prepare", actionColor: "bg-emerald-600 hover:bg-emerald-700" },
            PREPARING:  { actionLabel: "Mark Ready", actionColor: "bg-amber-600 hover:bg-amber-700" },
            READY:      { actionLabel: "Serve to Table", actionColor: "bg-blue-600 hover:bg-blue-700" },
            SERVED:     { actionLabel: "Complete Order", actionColor: "bg-gray-900 hover:bg-gray-800" },
        },
        TAKEAWAY: {
            PLACED:     { actionLabel: "Accept & Prepare", actionColor: "bg-emerald-600 hover:bg-emerald-700" },
            PREPARING:  { actionLabel: "Mark Ready", actionColor: "bg-amber-600 hover:bg-amber-700" },
            READY:      { actionLabel: "Customer Picked Up", actionColor: "bg-purple-600 hover:bg-purple-700" },
            PICKED_UP:  { actionLabel: "Complete Order", actionColor: "bg-gray-900 hover:bg-gray-800" },
        },
        DELIVERY: {
            PLACED:     { actionLabel: "Accept & Prepare", actionColor: "bg-emerald-600 hover:bg-emerald-700" },
            PREPARING:  { actionLabel: "Mark Ready", actionColor: "bg-amber-600 hover:bg-amber-700" },
            READY:      { actionLabel: "Out for Delivery", actionColor: "bg-amber-600 hover:bg-amber-700" },
            IN_TRANSIT: { actionLabel: "Mark Delivered", actionColor: "bg-cyan-600 hover:bg-cyan-700" },
            DELIVERED:  { actionLabel: "Complete Order", actionColor: "bg-gray-900 hover:bg-gray-800" },
        },
    };

    const actionOverride = ACTION_LABELS[orderType]?.[orderStatus];
    if (actionOverride) {
        statusConfig = { ...statusConfig, ...actionOverride };
    }

    const typeConfig = ORDER_TYPE_MAP[orderType] || ORDER_TYPE_MAP["DINE_IN"];
    const timeStr = formatTime(createdAt);
    const elapsed = getElapsedTime(createdAt);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const displayedItems = isExpanded ? items : items.slice(0, 2);
    const hasMoreItems = items.length > 2;

    const customerImage = getImageUrl(customer?.image, true, "thumbnail") || customer?.profileImageUrl;
    const restaurantLogo = getImageUrl(restaurant?.logo, true, "thumbnail");

    const [isUpdating, setIsUpdating] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleUpdate = async (e) => {
        e.stopPropagation();
        if (isUpdating || isRejecting) return;
        setIsUpdating(true);
        try {
            await onUpdateStatus(_id);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRejectClick = (e) => {
        e.stopPropagation();
        setIsRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (!onRejectStatus || isUpdating || isRejecting) return;
        setIsRejecting(true);
        try {
            await onRejectStatus(_id, rejectionReason);
            setIsRejectDialogOpen(false);
            setRejectionReason("");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 overflow-hidden text-left font-sans shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {restaurant && (
                <div className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-700 bg-white shadow-sm">
                            <ItemImage 
                                src={restaurantLogo} 
                                alt={restaurant.name} 
                                className="w-full h-full" 
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{restaurant.name}</span>
                            {(restaurant.address?.city || restaurant.address?.state) && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5">
                                    {[restaurant.address.city, restaurant.address.state].filter(Boolean).join(", ")}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Direct Order</span>
                </div>
            )}
            <div className={`${typeConfig.color} px-4 py-1.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <typeConfig.icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{typeConfig.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {table && (
                        <span className="text-[11px] font-bold bg-current/10 px-2 py-0.5 rounded border border-current/10">Table {table.tableNumber || table.name || table}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig.color} text-white shrink-0 shadow-sm`}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-zinc-800 flex-1">
                    <div className="w-full md:w-[48%] flex flex-col">
                        <div className="p-4 pb-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex flex-col gap-0.5 min-w-0 max-w-full">
                                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase">ID</span>
                                    <span className="text-gray-900 dark:text-gray-100 text-[14px] font-extrabold tracking-tight leading-none truncate">{displayId}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={(e) => e.stopPropagation()} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1">
                                        <Printer className="w-3 h-3" /> KOT
                                    </button>
                                    <button onClick={(e) => e.stopPropagation()} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> ORDER
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 pt-3 mt-auto">
                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
                                            <ItemImage 
                                                src={customerImage} 
                                                alt={customer?.name || "Customer"} 
                                                className="w-full h-full" 
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[14px] font-bold text-blue-600 dark:text-blue-400 truncate leading-tight">
                                                {customer?.name || "Walk-in Guest"} ▸
                                            </div>
                                            {customer?.phone && (
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums font-medium">{customer.phone}</div>
                                            )}
                                        </div>
                                    </div>
                                    {customer?.phone && (
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1 shrink-0 mt-0.5"
                                        >
                                            <Phone className="w-3 h-3" /> Call
                                        </button>
                                    )}
                                </div>
                                {order.orderType === "DELIVERY" && order.deliveryAddress && (
                                    <div className="mt-2.5 flex flex-col items-start bg-gray-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-700/50 w-full">
                                        <div className={`text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed break-words w-full ${!isAddressExpanded ? 'line-clamp-2' : ''}`}>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">Delivery Address: </span>
                                            {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsAddressExpanded(!isAddressExpanded); }}
                                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1.5 hover:underline uppercase tracking-wider inline-flex items-center"
                                        >
                                            {isAddressExpanded ? 'Show less' : 'View more...'}
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 mt-4 text-gray-400 dark:text-gray-500 text-[11px]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-medium">Placed: {elapsed}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="p-4 pb-0 flex-1 min-w-0">
                            <div className="space-y-4">
                                {displayedItems.map((item, idx) => {
                                    const dietary = getDietaryConfig(item.dietaryType);
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex gap-2.5 items-start min-w-0">
                                                    <div className={`w-[14px] h-[14px] mt-[3px] rounded-sm border-[1.5px] ${dietary.borderColor} flex items-center justify-center shrink-0`}>
                                                        <div className={`w-[6px] h-[6px] rounded-full ${dietary.fillColor}`} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[14px] text-gray-800 dark:text-gray-200 font-bold leading-snug line-clamp-2">
                                                            <span className="text-gray-500 font-semibold mr-1">{item.quantity} x</span>
                                                            {item.name}
                                                        </span>
                                                        {item.variant?.name && item.variant.name.trim() !== "" && (
                                                            <span className="text-gray-500 dark:text-gray-400 text-[11.5px] font-medium mt-0.5">
                                                                Variant: {item.variant.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 shrink-0 tabular-nums whitespace-nowrap pl-2">
                                                    ₹{(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                            {item.addons?.length > 0 && (
                                                <div className="ml-[24px] mt-2 text-[12px] text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                                                    {item.addons.map((addon, aIdx) => (
                                                        <div key={aIdx} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-zinc-800/80">
                                                            <span className="truncate mr-2 font-medium">+ {addon.name}</span>
                                                            {addon.price > 0 && <span className="tabular-nums shrink-0 font-medium text-gray-700 dark:text-gray-300">₹{addon.price.toFixed(2)}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.specialInstructions && (
                                                <div className="ml-[24px] mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-md px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300 leading-snug">
                                                    <span className="font-bold">Note: </span>
                                                    {item.specialInstructions}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {hasMoreItems && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                        className="w-full mt-3 py-2 flex items-center justify-center gap-1.5 text-[12px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-colors border border-gray-200 dark:border-zinc-700 shadow-sm"
                                    >
                                        {isExpanded ? (
                                            <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                                        ) : (
                                            <>View {items.length - 2} More Items <ChevronDown className="w-3.5 h-3.5" /></>
                                        )}
                                    </button>
                                )}

                                {specialInstructions && (
                                    <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-md px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300 leading-snug">
                                        <span className="font-bold">Order Note: </span>
                                        {specialInstructions}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 pt-3 mt-auto">
                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                <span className="text-[14px] font-bold text-gray-600 dark:text-gray-300">Total Bill</span>
                                <span className="text-[15px] font-black text-gray-900 dark:text-gray-100 tabular-nums">₹{totalAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                            {orderStatus === 'REJECTED' && order.rejectionReason && (
                                <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2 text-xs text-red-800 dark:text-red-300 leading-snug">
                                    <span className="font-bold">Rejected: </span>
                                    {order.rejectionReason}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-4 pt-3 mt-auto border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-800/20">
                    <div className="flex flex-col gap-1 w-1/2 pr-2 border-r border-gray-200 dark:border-zinc-700/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/60' 
                                    : 'bg-amber-100 text-amber-700 border border-amber-200/60'
                            }`}>
                                {paymentStatus === 'completed' ? 'PAID' : paymentStatus || 'PENDING'}
                            </span>
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                {order.paymentMethod || "CASH"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="w-1/2 flex items-center gap-2 justify-end">
                        {orderStatus === 'PLACED' ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleRejectClick}
                                    disabled={isRejecting || isUpdating}
                                    className="flex-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:border-red-500/50 dark:hover:border-red-500/50 font-bold h-9 rounded-md text-[12px] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1"
                                >
                                    {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Reject
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    disabled={isUpdating || isRejecting}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold h-9 rounded-md text-[12px] transition-all active:scale-95 shadow-md hover:shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1 border border-emerald-600"
                                >
                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Accept
                                </Button>
                            </>
                        ) : statusConfig.actionLabel ? (
                            <Button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className={`w-full ${statusConfig.actionColor} text-white font-bold h-9 rounded-md text-[12px] transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5`}
                            >
                                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {statusConfig.actionLabel}
                            </Button>
                        ) : (
                            <div className="w-full text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-2">
                                NO ACTIONS
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Order</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this order. The customer will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <textarea
                            autoFocus
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow min-h-[100px] resize-y"
                            placeholder="E.g., Items out of stock, restaurant closing soon..."
                        />
                    </div>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmReject}
                            disabled={isRejecting || !rejectionReason.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Confirm Reject
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
