"use client";
import { getImageUrl } from "@/lib/utils";
import { Phone, ShieldCheck } from "lucide-react";
import { STAFF_STATUS_CONFIG } from "./constants";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export const StaffProfileCell = ({ staff }) => (
    <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-100 dark:border-zinc-800 shadow-2xs">
            <img 
                src={getImageUrl(staff.image, true, "thumbnail") || `https://api.dicebear.com/7.x/notionists/svg?seed=${staff.name}&backgroundColor=f1f5f9`} 
                alt={staff.name} 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate">{staff.name}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
                <span className="text-blue-600 dark:text-blue-400 font-medium truncate">{staff.email}</span>
                {staff.phone && (
                    <span className="inline-flex items-center gap-0.5 text-gray-400 dark:text-zinc-500 shrink-0">
                        <Phone size={10} className="text-emerald-500" />
                        {staff.phone}
                    </span>
                )}
            </div>
        </div>
    </div>
);

export const StaffRoleBadge = ({ role }) => {
    const roleName = role?.name || "Unassigned";
    const permissions = role?.permissions || [];

    if (!permissions.length) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-primary/10 dark:bg-orange-950/40 text-primary dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/40 rounded-md shadow-2xs w-fit">
                <ShieldCheck size={13} className="text-primary/90" strokeWidth={2.5} />
                {roleName}
            </span>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-primary/10 dark:bg-orange-950/40 text-primary dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/40 rounded-md shadow-2xs w-fit cursor-pointer hover:bg-primary/20 transition-colors"
                >
                    <ShieldCheck size={13} className="text-primary/90" strokeWidth={2.5} />
                    {roleName}
                </button>
            </PopoverTrigger>
            
            <PopoverContent 
                side="bottom" 
                align="start" 
                sideOffset={6}
                className="w-72 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl p-3 z-[100]"
            >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-zinc-800 w-full">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">
                        Active Permissions ({permissions.length})
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                        {roleName}
                    </span>
                </div>
                <div className="flex flex-col gap-1.5 w-full max-h-60 overflow-y-auto pr-1">
                    {permissions.map((perm, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-start gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900/50 p-1 rounded-sm transition-colors"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/90 shrink-0 mt-1.5" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-semibold text-gray-900 dark:text-gray-100">
                                    {perm.code || "PERMISSION"}
                                </span>
                                {perm.description && (
                                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
                                        {perm.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const StaffStatusBadge = ({ status }) => {
    const cfg = STAFF_STATUS_CONFIG[status] || {
        label: status || "Unknown",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
    };
    const isActive = status === "ACTIVE";

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border ${cfg.badge} shadow-2xs`}>
            <span className="relative flex h-1.5 w-1.5">
                {isActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
            </span>
            <span>{cfg.label}</span>
        </span>
    );
};
