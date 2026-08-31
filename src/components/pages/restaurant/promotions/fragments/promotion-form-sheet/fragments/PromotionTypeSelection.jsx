import { cn } from "@/lib/utils";
import { Percent, ShoppingCart, Gift, Star } from "lucide-react";

export const PromotionTypeSelection = ({ onSelect }) => {
    const promotionTypes = [
        {
            id: "ITEM_DISCOUNT",
            title: "Item Discount",
            description: "Apply a percentage or flat discount to specific menu items or categories.",
            icon: Percent,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            border: "border-blue-200 dark:border-blue-500/20",
            enabled: true,
        },
        {
            id: "BESTSELLER",
            title: "Bestseller",
            description: "Highlight your most popular items on the menu.",
            icon: Star,
            color: "text-amber-500 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-amber-200 dark:border-amber-500/20",
            enabled: true,
        },
        {
            id: "CART_DISCOUNT",
            title: "Cart Discount",
            description: "Apply a discount to the entire order when a minimum amount is reached.",
            icon: ShoppingCart,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-500/10",
            border: "border-purple-200 dark:border-purple-500/20",
            enabled: false,
        },
        {
            id: "BOGO",
            title: "Buy One Get One",
            description: "Offer a free item when a customer purchases another item.",
            icon: Gift,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            border: "border-emerald-200 dark:border-emerald-500/20",
            enabled: false,
        },
    ];

    return (
        <div className="space-y-4">
            {promotionTypes.map((type) => {
                const Icon = type.icon;
                return (
                    <button
                        key={type.id}
                        onClick={() => type.enabled && onSelect(type.id)}
                        disabled={!type.enabled}
                        type="button"
                        className={cn(
                            "w-full text-left flex items-start gap-4 p-4 rounded-xl border bg-white dark:bg-zinc-950 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            type.enabled 
                                ? "border-gray-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md cursor-pointer group" 
                                : "border-gray-100 dark:border-zinc-900 opacity-60 cursor-not-allowed"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                            type.bg, type.color, type.border,
                            type.enabled && "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                        )}>
                            <Icon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "font-bold text-[15px]",
                                    type.enabled ? "text-slate-900 dark:text-gray-100" : "text-slate-500 dark:text-gray-400"
                                )}>
                                    {type.title}
                                </span>
                                {!type.enabled && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500">Coming Soon</span>
                                )}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400 leading-snug">
                                {type.description}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
