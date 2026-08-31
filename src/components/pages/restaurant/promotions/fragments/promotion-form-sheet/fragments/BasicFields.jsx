import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { DISCOUNT_TYPES } from "../helper/constants";
import { Tag, Percent, IndianRupee, Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FIELD_CONFIG = {
    ITEM_DISCOUNT: {
        showDiscount: true,
        showDates: true,
        showLimits: true,
    },
    BESTSELLER: {
        showDiscount: true,
        showDates: true,
        showLimits: false,
    }
};

export const BasicFields = ({ formData, handleChange, handleSelectChange }) => {
    const config = FIELD_CONFIG[formData.type] || FIELD_CONFIG.ITEM_DISCOUNT;

    return (
        <div className="space-y-6">
            <div className="relative group">
                <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                        Promotion Name <span className="text-red-500">*</span>
                    </span>
                </div>
                <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                    <div className="pl-3.5 flex items-center pointer-events-none absolute left-0 z-10">
                        <Tag className="h-5 w-5 text-orange-500" />
                    </div>
                    <Input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="e.g. 50% off on Kadhai Paneer" 
                        required
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-[15px] pl-11 pr-3 w-full font-medium"
                    />
                </div>
            </div>

            {config.showDiscount && (
                <div className="grid grid-cols-1 gap-5">
                    <div className="relative group">
                        <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                                Discount Type <span className="text-red-500">*</span>
                            </span>
                        </div>
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-zinc-900/50 p-1 mt-1">
                            {DISCOUNT_TYPES.map(type => {
                                const isActive = formData.discount_type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleSelectChange("discount_type", type.value)}
                                        className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 h-10 text-[14px] font-bold rounded-md transition-all ${
                                            isActive
                                                ? "bg-white dark:bg-zinc-800 text-orange-600 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50"
                                        }`}
                                    >
                                        {type.value === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <IndianRupee className="h-4 w-4" />}
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                                Discount Value <span className="text-red-500">*</span>
                            </span>
                        </div>
                        <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                            <div className="pl-3.5 flex items-center pointer-events-none absolute left-0 z-10">
                                {formData.discount_type === "PERCENTAGE" ? (
                                    <Percent className="h-5 w-5 text-orange-500" />
                                ) : (
                                    <IndianRupee className="h-5 w-5 text-orange-500" />
                                )}
                            </div>
                            <Input 
                                name="discount_value" 
                                type="number"
                                min="0"
                                max={formData.discount_type === "PERCENTAGE" ? "100" : undefined}
                                step="0.01"
                                value={formData.discount_value} 
                                onChange={(e) => {
                                    if (formData.discount_type === "PERCENTAGE" && Number(e.target.value) > 100) {
                                        e.target.value = "100";
                                    }
                                    handleChange(e);
                                }}
                                placeholder={formData.discount_type === "PERCENTAGE" ? "e.g. 50" : "e.g. 100"} 
                                required={formData.type !== "BESTSELLER"}
                                className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-[15px] pl-11 pr-3 w-full font-medium"
                            />
                        </div>
                    </div>
                </div>
            )}

            {config.showDates && (
                <div className="grid grid-cols-1 gap-5">
                    <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                            Starts At
                        </span>
                    </div>
                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 min-w-0 h-12 pl-11 pr-3 text-left font-medium text-[15px] bg-transparent border-0 focus:outline-none focus:ring-0 shadow-none flex items-center",
                                        !formData.starts_at && "text-muted-foreground"
                                    )}
                                >
                                    <div className="pl-3.5 flex items-center pointer-events-none absolute left-0 z-10">
                                        <Calendar className="h-5 w-5 text-orange-500 shrink-0" />
                                    </div>
                                    <span className="truncate block w-full">{formData.starts_at ? format(parseISO(formData.starts_at), "PPP") : "Pick a date"}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={formData.starts_at ? parseISO(formData.starts_at) : undefined}
                                    onSelect={(date) => handleSelectChange("starts_at", date ? format(date, "yyyy-MM-dd") : "")}
                                    initialFocus
                                    fromDate={new Date()}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    classNames={{
                                        day_today: "bg-orange-100 text-orange-700 font-bold border border-orange-500 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700",
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                            Ends At
                        </span>
                    </div>
                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 min-w-0 h-12 pl-11 pr-3 text-left font-medium text-[15px] bg-transparent border-0 focus:outline-none focus:ring-0 shadow-none flex items-center",
                                        !formData.ends_at && "text-muted-foreground"
                                    )}
                                >
                                    <div className="pl-3.5 flex items-center pointer-events-none absolute left-0 z-10">
                                        <Calendar className="h-5 w-5 text-orange-500 shrink-0" />
                                    </div>
                                    <span className="truncate block w-full">{formData.ends_at ? format(parseISO(formData.ends_at), "PPP") : "Pick a date"}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={formData.ends_at ? parseISO(formData.ends_at) : undefined}
                                    onSelect={(date) => handleSelectChange("ends_at", date ? format(date, "yyyy-MM-dd") : "")}
                                    initialFocus
                                    fromDate={formData.starts_at ? parseISO(formData.starts_at) : new Date()}
                                    disabled={(date) => {
                                        if (formData.starts_at) {
                                            const start = parseISO(formData.starts_at);
                                            start.setHours(0, 0, 0, 0);
                                            return date < start;
                                        }
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    classNames={{
                                        day_today: "bg-orange-100 text-orange-700 font-bold border border-orange-500 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700",
                                    }}
                                />
                            </PopoverContent>
                        </Popover> 
                    </div>
                </div>
            </div>
            )}

            {config.showLimits && (
                <div className="grid grid-cols-2 gap-5">
                    <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                            Global Usage Limit
                        </span>
                    </div>
                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                        <Input 
                            name="usage_limit" 
                            type="number"
                            min="1"
                            value={formData.usage_limit || ""} 
                            onChange={handleChange} 
                            placeholder="e.g. 1000"
                            className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-[15px] px-4 w-full font-medium"
                        />
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 max-w-[calc(100%-24px)]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors whitespace-nowrap block truncate">
                            Max Per User Limit
                        </span>
                    </div>
                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900/50">
                        <Input 
                            name="per_user_limit" 
                            type="number"
                            min="1"
                            value={formData.per_user_limit || ""} 
                            onChange={handleChange} 
                            placeholder="10"
                            className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-[15px] px-4 w-full font-medium"
                        />
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
