export const PROMOTION_STATUS_CONFIG = {
    ACTIVE: {
        label: "Active",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    },
    INACTIVE: {
        label: "Inactive",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
    },
    EXPIRED: {
        label: "Expired",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
    },
};

export const PROMOTION_STATUS_FILTERS = [
    { label: "All Promotions", value: "all" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
];

export const DEFAULT_PAGE_SIZE = 10;
