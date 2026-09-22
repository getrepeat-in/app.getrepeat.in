"use client";
import { useState } from "react";
import { format } from "date-fns";
import { OrderTimeline } from "./order-timeline";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatusBadge, PaymentBadge } from "../helpers/badges";
import { Printer, Receipt as ReceiptIcon, User, Phone, Mail, MapPin } from "lucide-react";

export const OrderDetailsDrawer = ({ isOpen, onClose, order }) => {
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    
    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md p-3 flex flex-col bg-gray-100 dark:bg-zinc-950/50 border-l border-gray-200 dark:border-zinc-800 shadow-md">
                <div className="flex justify-between rounded-md items-center bg-white dark:bg-zinc-900 px-6 py-5 border-b border-gray-200 dark:border-zinc-800 shrink-0">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Order Details</span>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 shadow-sm border-b border-gray-200 dark:border-zinc-800">
                        <div className="flex justify-between items-start">
                            <div className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                                ID: {order.orderNumber}
                            </div>
                            <div className="text-[13px] text-gray-500 font-medium">
                                {order.createdAt ? format(new Date(order.createdAt), "hh:mm a | dd MMMM") : "-"}
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                                <User size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {order.customer ? order.customer.name : "Guest Customer"}
                                </span>
                            </div>
                            {order.customer?.phone && (
                                <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                                    <Phone size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                    <span>{order.customer.phone}</span>
                                </div>
                            )}
                            {order.customer?.email && (
                                <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                                    <Mail size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                    <span>{order.customer.email}</span>
                                </div>
                            )}
                            {order.orderType === "DELIVERY" && order.deliveryAddress && (
                                <div className="flex items-start gap-2 text-[13px] text-gray-600 dark:text-gray-400 mt-1 p-2.5 bg-gray-50 dark:bg-zinc-800/40 rounded-lg border border-gray-100 dark:border-zinc-700/50 flex-col">
                                    <div className="flex items-start gap-2 w-full">
                                        <MapPin size={14} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                                        <span className={`leading-relaxed break-words w-full ${!isAddressExpanded ? 'line-clamp-2' : ''}`}>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-0.5">Delivery Address</span>
                                            {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsAddressExpanded(!isAddressExpanded); }}
                                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider self-start ml-5"
                                    >
                                        {isAddressExpanded ? 'Show less' : 'View more...'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 flex items-center gap-3 border-t border-gray-100 dark:border-zinc-800">
                            <StatusBadge status={order.orderStatus} />

                            <span className="text-[13px] text-gray-500 font-medium capitalize flex items-center gap-1.5">
                                {order.orderType} 
                                {order.table && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" /> 
                                        Table {order.table.tableNumber} {order.table.zone ? `(${order.table.zone})` : ''}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 shadow-sm border-y border-gray-200 dark:border-zinc-800">
                        <h3 className="text-[11px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">Order Timeline</h3>
                        <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.orderStatus} createdAt={order.createdAt} />
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 shadow-sm border-y border-gray-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                            <h3 className="text-[11px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">Order Details</h3>
                            <div className="flex gap-2">
                                <button className="text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-2.5 py-1 text-[11px] font-bold tracking-wide flex items-center gap-1.5 transition-colors">
                                    <Printer size={12} strokeWidth={2.5} /> KOT
                                </button>
                                <button className="text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-2.5 py-1 text-[11px] font-bold tracking-wide flex items-center gap-1.5 transition-colors">
                                    <ReceiptIcon size={12} strokeWidth={2.5} /> BILL
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[14px] font-medium text-gray-900 dark:text-gray-100 leading-snug">
                                            {item.quantity} x <span className="border-b border-dashed border-gray-400 dark:border-gray-600">{item.name}</span>
                                        </div>
                                        {item.variant?.name && (
                                            <div className="text-[12px] text-gray-500 mt-0.5">Variant: {item.variant.name}</div>
                                        )}
                                        {item.addons?.length > 0 && (
                                            <div className="text-[12px] text-gray-500 mt-0.5">Add-ons: {item.addons.map(a => a.name).join(", ")}</div>
                                        )}
                                        {item.specialInstructions && (
                                            <div className="text-[12px] text-primary dark:text-orange-400 mt-1 italic">
                                                Note: {item.specialInstructions}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[14px] font-medium text-gray-900 dark:text-gray-100 shrink-0">
                                        ₹{item.totalPrice?.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 dark:border-zinc-800 mt-5 pt-4 space-y-2.5 text-[13px] text-gray-500 dark:text-gray-400">
                            <div className="flex justify-between items-center">
                                <span>{order.items?.length || 0} items (Subtotal)</span>
                                <span>₹{order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
                                <span className="border-b border-dashed border-gray-300 dark:border-zinc-600">Taxes & Fees</span>
                                <span>₹{((order.totalAmount || 0) - (order.subtotal || 0))?.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100">Total Bill</span>
                                    {order.paymentStatus && <PaymentBadge status={order.paymentStatus} />}
                                </div>
                                <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
                                    ₹{order.totalAmount?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
};

export default OrderDetailsDrawer;
