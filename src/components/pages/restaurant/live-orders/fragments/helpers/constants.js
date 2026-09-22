import { UtensilsCrossed, ShoppingBag, Globe } from "lucide-react";

export const PAGE_SIZE = 24;

export const ORDER_TYPE_MAP = {
    "DINE_IN": { label: "DINE_IN", color: "bg-orange-50 text-orange-600 border-b border-orange-100", icon: UtensilsCrossed },
    "TAKEAWAY": { label: "TAKEAWAY", color: "bg-purple-50 text-purple-600 border-b border-purple-100", icon: ShoppingBag },
    "DELIVERY": { label: "DELIVERY", color: "bg-cyan-50 text-cyan-600 border-b border-cyan-100", icon: Globe },
};

export const ORDER_TAB_FILTERS = [
    { key: "all", label: "All Orders", statuses: [] },
    { key: "placed", label: "Placed", statuses: ["PLACED"] },
    { key: "accepted", label: "Accepted", statuses: ["ACCEPTED"] },
    { key: "preparing", label: "Preparing", statuses: ["PREPARING"] },
    { key: "ready", label: "Ready", statuses: ["READY"] },
];

export const STATUS_CONFIG = {
    PLACED: { label: "Placed", color: "bg-indigo-500", actionLabel: "Accept Order", actionColor: "bg-blue-600 hover:bg-blue-700" },
    ACCEPTED: { label: "Accepted", color: "bg-indigo-500", actionLabel: "Start Preparing", actionColor: "bg-blue-600 hover:bg-blue-700" },
    PREPARING: { label: "Preparing", color: "bg-blue-500", actionLabel: "Order Ready", actionColor: "bg-emerald-600 hover:bg-emerald-700" },
    READY: { label: "Ready", color: "bg-emerald-500", actionLabel: "Complete Order", actionColor: "bg-gray-900 hover:bg-gray-800" },
    COMPLETED: { label: "Completed", color: "bg-gray-500" },
    CANCELLED: { label: "Cancelled", color: "bg-red-500" },
    REJECTED: { label: "Rejected", color: "bg-red-500" },
};

export const DIETARY_CONFIG = {
    "veg": { borderColor: "border-green-600", fillColor: "bg-green-600" },
    "non-veg": { borderColor: "border-red-500", fillColor: "bg-red-500" },
    "egg": { borderColor: "border-yellow-500", fillColor: "bg-yellow-500" },
};

export const LIVE_ORDER_TABS = ORDER_TAB_FILTERS.filter(
    (tab) => tab.key !== "completed" && tab.key !== "cancelled"
);

export const LIVE_ORDER_STATUSES = "PLACED,ACCEPTED,PREPARING,READY";
