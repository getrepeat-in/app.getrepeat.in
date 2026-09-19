"use client";
import { ORDER_TYPE_MAP } from "../helpers/constants";
import { Clock, Phone, Printer, FileText } from "lucide-react";
import { getStatusConfig, getDietaryConfig, getElapsedTime, formatTime } from "../helpers"

export const OrderCard = ({ order, onUpdateStatus }) => {
    if (!order) return null;

    const { _id, orderNumber, orderStatus, customer, items = [], totalAmount, createdAt, paymentStatus, orderType = "dine-in", table, specialInstructions } = order;
    const displayId = orderNumber || _id?.slice(-4);
    const statusConfig = getStatusConfig(orderStatus);
    const typeConfig = ORDER_TYPE_MAP[orderType] || ORDER_TYPE_MAP["dine-in"];
    const timeStr = formatTime(createdAt);
    const elapsed = getElapsedTime(createdAt);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 overflow-hidden text-left font-sans shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className={`${typeConfig.color} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <typeConfig.icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{typeConfig.label}</span>
                </div>
                {table && (
                    <span className="text-[11px] font-bold">Table {table.tableNumber || table.name || table}</span>
                )}
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex divide-x divide-gray-100 dark:divide-zinc-800 flex-1">
                    <div className="w-[48%] flex flex-col">
                        <div className="p-4 pb-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-0.5 mb-1 min-w-0">
                                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase">ID</span>
                                    <span className="text-gray-900 dark:text-gray-100 text-[14px] font-extrabold tracking-tight leading-none break-all sm:break-normal">{displayId}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusConfig.color} text-white shrink-0 mt-0.5`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <button onClick={(e) => e.stopPropagation()} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                                    <Printer className="w-3 h-3" /> KOT
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" /> ORDER
                                </button>
                            </div>
                        </div>

                        <div className="p-4 pt-3 mt-auto">
                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-[14px] font-bold text-blue-600 dark:text-blue-400 truncate leading-tight">
                                            {customer?.name || "Walk-in Guest"} ▸
                                        </div>
                                        {customer?.phone && (
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums font-medium">{customer.phone}</div>
                                        )}
                                    </div>
                                    {customer?.phone && (
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1 shrink-0"
                                        >
                                            <Phone className="w-3 h-3" /> Call
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-4 text-gray-400 dark:text-gray-500 text-[11px]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-medium">Placed: {elapsed}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="p-4 pb-0 flex-1">
                            <div className="space-y-4">
                                {items.map((item, idx) => {
                                    const dietary = getDietaryConfig(item.dietaryType);
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex gap-2.5 items-start min-w-0">
                                                    <div className={`w-[14px] h-[14px] mt-[3px] rounded-sm border-[1.5px] ${dietary.borderColor} flex items-center justify-center shrink-0`}>
                                                        <div className={`w-[6px] h-[6px] rounded-full ${dietary.fillColor}`} />
                                                    </div>
                                                    <span className="text-[14px] text-gray-800 dark:text-gray-200 font-medium leading-snug line-clamp-2">
                                                        {item.quantity} x {item.name}
                                                        {item.variant?.name && item.variant.name.trim() !== "" && (
                                                            <span className="text-gray-400 dark:text-gray-500 text-[12px] ml-1">({item.variant.name})</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 shrink-0 tabular-nums whitespace-nowrap">
                                                    ₹{(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                            {item.specialInstructions && (
                                                <div className="ml-[24px] mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-md px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300 leading-snug">
                                                    {item.specialInstructions}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {specialInstructions && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 rounded-md px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300 leading-snug">
                                        {specialInstructions}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 pt-3 mt-auto">
                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold text-gray-600 dark:text-gray-300">Total Bill</span>
                                    {(paymentStatus === "completed" || paymentStatus === "paid") && (
                                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/30">
                                            PAID
                                        </span>
                                    )}
                                </div>
                                <span className="text-[15px] font-black text-gray-900 dark:text-gray-100 tabular-nums">₹{totalAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {statusConfig.actionLabel && (
                    <div className="px-4 pb-4 pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(_id); }}
                            className={`w-full ${statusConfig.actionColor} text-white font-bold py-3.5 rounded-lg text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2`}
                        >
                            {statusConfig.actionLabel}
                            <span className="text-white/70 text-xs font-medium">({timeStr})</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
