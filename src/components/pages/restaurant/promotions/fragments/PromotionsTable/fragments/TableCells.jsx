import { Edit2, Trash2, Tag, Percent, UtensilsCrossed } from "lucide-react";

const formatDate = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
};

const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm uppercase tracking-wider">Active</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shadow-sm uppercase tracking-wider">{status}</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20 shadow-sm uppercase tracking-wider">{status}</span>;
    }
};

export const PromotionNameCell = ({ promotion }) => (
    <div className="flex flex-col min-w-0 max-w-[200px] md:max-w-[300px]">
        <span className="font-medium text-slate-800 dark:text-gray-200 text-[14px] md:text-[15px] truncate leading-tight tracking-tight" title={promotion.name}>
            {promotion.name}
        </span>
    </div>
);

export const PromotionTypeCell = ({ promotion }) => {
    const isPercent = promotion.discount_type === "PERCENTAGE";
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md uppercase tracking-wider w-fit whitespace-nowrap">
            {isPercent ? <Percent size={13} strokeWidth={3.5} /> : <Tag size={13} strokeWidth={3.5} />}
            {isPercent ? "Percentage" : "Flat Amount"}
        </span>
    );
};

export const PromotionDiscountCell = ({ promotion }) => (
    <div className="flex flex-col">
        <span className="font-semibold text-slate-800 dark:text-gray-200 text-[15px] md:text-[16px]">
            {promotion.discount_type === "PERCENTAGE" ? `${promotion.discount_value}%` : `₹${promotion.discount_value}`}
        </span>
    </div>
);

export const PromotionDateCell = ({ promotion }) => {
    if (!promotion.starts_at && !promotion.ends_at) return <span className="text-gray-400 text-[13px] font-medium">Always Active</span>;
    return (
        <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-700 dark:text-gray-300">
                {promotion.starts_at ? formatDate(promotion.starts_at).date : "Now"} - {promotion.ends_at ? formatDate(promotion.ends_at).date : "Forever"}
            </span>
        </div>
    );
};

export const PromotionStatusCell = ({ promotion }) => getStatusBadge(promotion.status);

export const PromotionUsageCell = ({ promotion }) => (
    <div className="flex flex-col items-start">
        <span className="font-semibold text-gray-900 dark:text-gray-100">{promotion.times_used || 0}</span>
        {promotion.usage_limit && (
            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">/ {promotion.usage_limit}</span>
        )}
        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Uses</span>
    </div>
);

export const PromotionTargetCell = ({ promotion }) => {
    const count = promotion.items?.length || 0;
    return (
        <div className="flex flex-col gap-1 items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-md whitespace-nowrap">
                <UtensilsCrossed size={12} strokeWidth={2.5} /> Selected Items
            </span>
            <span className="text-[12px] text-slate-500 font-semibold px-1">{count} items</span>
        </div>
    );
};

export const PromotionActionsCell = ({ promotion, onEdit, onDelete }) => (
    <div className="flex justify-end items-center gap-2">
        <button 
            onClick={() => onEdit(promotion)}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
            title="Edit Promotion"
        >
            <Edit2 size={18} strokeWidth={2.5} />
        </button>
        <button 
            onClick={() => onDelete(promotion)}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            title="Delete Promotion"
        >
            <Trash2 size={18} strokeWidth={2.5} />
        </button>
    </div>
);
