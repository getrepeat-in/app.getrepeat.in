"use client";
import React from "react";
import { Phone } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { USER_STATUS_CONFIG } from "./constants";

export const UserProfileCell = ({ user }) => (
    <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-100 dark:border-zinc-800 shadow-2xs">
            <img 
                src={getImageUrl(user.image, true, "thumbnail") || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.phone || user.name}&backgroundColor=f1f5f9`} 
                alt={user.name} 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate">{user.name || "Unnamed Customer"}</span>
            {user.phone && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
                    <Phone size={10} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{user.phone}</span>
                </div>
            )}
        </div>
    </div>
);

export const UserStatusBadge = ({ status }) => {
    const s = status || "ACTIVE";
    const cfg = USER_STATUS_CONFIG[s] || {
        label: s,
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
    };
    const isActive = s === "ACTIVE";

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
