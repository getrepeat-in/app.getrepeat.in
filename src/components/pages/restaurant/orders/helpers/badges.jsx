"use client";
import React from "react";
import { MapPin, ShoppingBag } from "lucide-react";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, ORDER_TYPE_CONFIG, FULFILLMENT_STATUS_CONFIG } from "./constants";

export const OrderTypeBadge = ({ orderType, table, onClick }) => {
    const typeKey = (orderType || "").toLowerCase();
    const cfg = ORDER_TYPE_CONFIG[typeKey] || {
        label: orderType || "Unknown",
        icon: ShoppingBag,
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
        dot: "bg-gray-400",
    };
    const Icon = cfg.icon;

    return (
        <div className="flex flex-col gap-1 items-start">
            <button
                type="button"
                onClick={onClick}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border transition-all ${cfg.badge} ${
                    onClick ? "cursor-pointer hover:shadow-2xs hover:brightness-95 active:scale-95" : ""
                }`}
                title={onClick ? `Filter by ${cfg.label}` : cfg.label}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <Icon size={12} className="opacity-75" />
                <span>{cfg.label}</span>
            </button>
            {table && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400 pl-0.5">
                    <MapPin size={10} className="text-gray-400" />
                    Table {table.tableNumber || table.label || "-"}
                </span>
            )}
        </div>
    );
};

export const StatusBadge = ({ status }) => {
    const cfg = ORDER_STATUS_CONFIG[status] || { label: status, badge: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" };
    const isLive = ["PLACED", "ACCEPTED", "PREPARING"].includes((status || "").toUpperCase());

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border ${cfg.badge} shadow-2xs transition-all`}>
            <span className="relative flex h-1.5 w-1.5">
                {isLive && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
            </span>
            <span>{cfg.label}</span>
        </span>
    );
};

export const FulfillmentBadge = ({ status }) => {
    const cfg = FULFILLMENT_STATUS_CONFIG[status?.toUpperCase()] || FULFILLMENT_STATUS_CONFIG.PENDING;
    const isLive = ["IN_TRANSIT"].includes((status || "").toUpperCase());

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border ${cfg.badge} shadow-2xs transition-all`}>
            <span className="relative flex h-1.5 w-1.5">
                {isLive && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
            </span>
            <span>{cfg.label}</span>
        </span>
    );
};

export const PaymentBadge = ({ status }) => {
    const cfg = PAYMENT_STATUS_CONFIG[status?.toUpperCase()] || PAYMENT_STATUS_CONFIG.PENDING;
    return (
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide border border-transparent shadow-2xs ${cfg.badge}`}>
            {cfg.label}
        </span>
    );
};
