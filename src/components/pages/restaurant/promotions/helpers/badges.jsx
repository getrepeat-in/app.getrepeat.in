import { PROMOTION_STATUS_CONFIG } from "./constants";
import { Edit2, Trash2, Tag, Percent, UtensilsCrossed, Calendar, Gift, Star } from "lucide-react";

export const formatDate = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
};

export const PromotionNameCell = ({ promotion }) => (
    <div className="flex flex-col min-w-0 max-w-full">
        <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm truncate" title={promotion.name}>
            {promotion.name}
        </span>
        {promotion.code && (
            <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                CODE: {promotion.code}
            </span>
        )}
    </div>
);

export const PromotionTypeBadge = ({ promotion }) => {
    if (promotion.type === "FREEBIE") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/40 rounded-md uppercase tracking-wider w-fit whitespace-nowrap">
                <Gift size={11} strokeWidth={2.5} />
                Freebie
            </span>
        );
    }
    
    if (promotion.type === "BESTSELLER") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40 rounded-md uppercase tracking-wider w-fit whitespace-nowrap">
                <Star size={11} strokeWidth={2.5} />
                Bestseller
            </span>
        );
    }

    const isPercent = promotion.discount_type === "PERCENTAGE";
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 rounded-md uppercase tracking-wider w-fit whitespace-nowrap">
            {isPercent ? <Percent size={11} strokeWidth={2.5} /> : <Tag size={11} strokeWidth={2.5} />}
            {isPercent ? "Percentage" : "Flat Amount"}
        </span>
    );
};

export const PromotionDiscountCell = ({ promotion }) => {
    const isFreebie = promotion.type === "FREEBIE";
    return (
        <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-zinc-100 text-sm">
                {isFreebie 
                    ? "FREE ITEMS" 
                    : promotion.discount_type === "PERCENTAGE" 
                        ? `${promotion.discount_value}% OFF` 
                        : `₹${promotion.discount_value} OFF`}
            </span>
            {promotion.min_order_value > 0 && (
                <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Min. order ₹{promotion.min_order_value}
                </span>
            )}
        </div>
    );
};

export const PromotionTargetCell = ({ promotion }) => {
    const count = promotion.items?.length || 0;
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
            <UtensilsCrossed size={12} className="text-gray-400 dark:text-zinc-500 shrink-0" />
            <span>{count > 0 ? `${count} Selected Items` : "All Menu Items"}</span>
        </div>
    );
};

export const PromotionDateCell = ({ promotion }) => {
    if (!promotion.starts_at && !promotion.ends_at) {
        return <span className="text-gray-400 dark:text-zinc-500 text-xs font-medium">Always Active</span>;
    }
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
            <Calendar size={12} className="text-gray-400 dark:text-zinc-500 shrink-0" />
            <span>
                {promotion.starts_at ? formatDate(promotion.starts_at).date : "Now"} - {promotion.ends_at ? formatDate(promotion.ends_at).date : "Forever"}
            </span>
        </div>
    );
};

export const PromotionStatusBadge = ({ status }) => {
    const config = PROMOTION_STATUS_CONFIG[status] || {
        label: status || "Unknown",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${config.badge} shadow-2xs uppercase tracking-wider`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export const PromotionActionsCell = ({ promotion, onEdit, onDelete }) => (
    <div className="flex justify-end items-center gap-1">
        <button
            onClick={() => onEdit(promotion)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
            title="Edit Promotion"
        >
            <Edit2 size={15} strokeWidth={2} />
        </button>
        <button
            onClick={() => onDelete(promotion)}
            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
            title="Delete Promotion"
        >
            <Trash2 size={15} strokeWidth={2} />
        </button>
    </div>
);
