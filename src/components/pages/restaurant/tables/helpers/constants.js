export const TABLE_STATUSES = ["available", "occupied", "reserved", "unavailable"];
export const ZONE_DEFAULT = "General";
export const ZONE_SUGGESTIONS = [
    "General",
    "AC",
    "Non-AC",
    "Rooftop",
    "Garden",
    "Private",
    "Bar",
    "VIP",
];

export const TABLE_STATUS_CONFIG = {
    available: {
        label: "Available",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
        color: "bg-emerald-500",
    },
    occupied: {
        label: "Occupied",
        dot: "bg-orange-500",
        badge: "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40",
        color: "bg-orange-500",
    },
    reserved: {
        label: "Reserved",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
        color: "bg-blue-500",
    },
    unavailable: {
        label: "Unavailable",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
        color: "bg-gray-400",
    },
};

export const TABLE_STATUS_OPTIONS = Object.entries(TABLE_STATUS_CONFIG).map(
    ([value, cfg]) => ({ value, label: cfg.label, color: cfg.color, dot: cfg.dot, badge: cfg.badge })
);

export const TABLE_STATUS_FILTERS = [
    { label: "All Tables", value: "all" },
    ...TABLE_STATUS_OPTIONS.map(({ value, label }) => ({ value, label })),
];

export const TABLE_CAPACITY_MIN = 1;
export const TABLE_CAPACITY_MAX = 50;
export const TABLE_CAPACITY_DEFAULT = 4;
export const DEFAULT_PAGE_SIZE = 10;

export const QR_PREVIEW_SIZE = 240;
export const QR_DOWNLOAD_SIZE = 400;
export const QR_ERROR_CORRECTION = "H";
export const QR_COLORS = { dark: "#1a1a1a", light: "#ffffff" };

export const buildQRUrl = (qrToken) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/menu?token=${qrToken}`;
};
