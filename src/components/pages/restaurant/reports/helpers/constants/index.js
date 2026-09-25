import {
  CreditCard,
  Banknote,
  QrCode,
  Globe,
  Utensils,
  ShoppingBag,
  Truck,
} from "lucide-react";

/**
 * Standard date range preset tabs for reports header
 */
export const PRESET_TABS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
];

/**
 * Standard timeline interval for hourly velocity charts (2-hour ranges)
 */
export const INTERVAL_HOURS = 2;

/**
 * Standard table pagination page size
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Visual styling and metadata for Order Channels
 */
export const ORDER_TYPE_CONFIG = {
  DINE_IN: {
    label: "Dine-In Tables",
    icon: Utensils,
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40",
  },
  TAKEAWAY: {
    label: "Takeaway / Pickup",
    icon: ShoppingBag,
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
  },
  DELIVERY: {
    label: "Doorstep Delivery",
    icon: Truck,
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
  },
};

/**
 * Visual styling and metadata for Payment Methods
 */
export const PAYMENT_METHOD_CONFIG = {
  CASH: {
    label: "Cash at Counter",
    icon: Banknote,
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
  },
  UPI: {
    label: "UPI Direct",
    icon: QrCode,
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40",
  },
  CARD: {
    label: "Debit / Credit Card",
    icon: CreditCard,
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
  },
  ONLINE: {
    label: "Online Payment",
    icon: Globe,
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
  },
};

/**
 * Dietary badge configuration
 */
export const DIETARY_CONFIG = {
  "non-veg": {
    label: "Non-Veg",
    borderColor: "border-red-600",
    dotColor: "bg-red-600",
  },
  egg: {
    label: "Egg",
    borderColor: "border-amber-500",
    dotColor: "bg-amber-500",
  },
  veg: {
    label: "Pure Veg",
    borderColor: "border-emerald-600",
    dotColor: "bg-emerald-600",
  },
};
