import { UtensilsCrossed, ShoppingBag, Globe } from "lucide-react";

export const ORDER_STATUS_CONFIG = {
    PLACED:     { label: "Placed",     badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",     dot: "bg-blue-500" },
    ACCEPTED:   { label: "Accepted",   badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400", dot: "bg-indigo-500" },
    PREPARING:  { label: "Preparing",  badge: "bg-primary/10 text-primary border-orange-200 dark:bg-orange-950 dark:text-orange-400", dot: "bg-primary/90" },
    READY:      { label: "Ready",      badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",   dot: "bg-amber-500" },
    SERVED:     { label: "Served",     badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",       dot: "bg-blue-500" },
    PICKED_UP:  { label: "Picked Up",  badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400",       dot: "bg-teal-500" },
    IN_TRANSIT: { label: "In Transit", badge: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400",       dot: "bg-cyan-500" },
    DELIVERED:  { label: "Delivered",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
    COMPLETED:  { label: "Completed",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400", dot: "bg-emerald-500" },
    CANCELLED:  { label: "Cancelled",  badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",           dot: "bg-red-500" },
    REJECTED:   { label: "Rejected",   badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400",       dot: "bg-rose-500" }
};

export const ORDER_TAB_FILTERS = [
    { key: "all", label: "All Orders", statuses: [] },
    { key: "active", label: "Active", statuses: ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"] },
    { key: "completed", label: "Completed", statuses: ["COMPLETED"] },
    { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REJECTED"] }
];

export const PAYMENT_STATUS_CONFIG = {
    PENDING: { label: "Pending", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400" },
    AUTHORIZED: { label: "Authorized", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400" },
    PAID: { label: "Paid", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400" },
    FAILED: { label: "Failed", badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400" },
    REFUNDED: { label: "Refunded", badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300" },
    PARTIALLY_REFUNDED: { label: "Partial Refund", badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300" }
};


export const ORDER_TYPE_CONFIG = {
    "DINE_IN": {
        label: "Dine-in",
        icon: UtensilsCrossed,
        emoji: "🍽️",
        badge: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
        dot: "bg-blue-500",
    },
    "TAKEAWAY": {
        label: "Takeaway",
        icon: ShoppingBag,
        emoji: "🛍️",
        badge: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40",
        dot: "bg-purple-500",
    },
    "DELIVERY": {
        label: "Delivery",
        icon: Globe,
        emoji: "🛵",
        badge: "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800/40",
        dot: "bg-cyan-500",
    },
};

export const ORDER_TYPE_OPTIONS = [
    { value: "all", label: "All Types", iconEmoji: "" },
    { value: "DINE_IN", label: "Dine-in", iconEmoji: "🍽️" },
    { value: "TAKEAWAY", label: "Takeaway", iconEmoji: "🛍️" },
    { value: "DELIVERY", label: "Delivery", iconEmoji: "🛵" },
];

export const DEFAULT_PAGE_SIZE = 10;
