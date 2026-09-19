"use client";

import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "../helpers/constants";

const getTimelineStepState = (status, isLast) => {
    const isRejected = status === "REJECTED" || status === "CANCELLED";
    const isCompleted = status === "COMPLETED";

    if (isRejected) {
        return {
            Icon: XCircle,
            iconColor: "text-red-500",
            lineColor: "bg-red-500",
        };
    }

    if (isCompleted || !isLast) {
        return {
            Icon: CheckCircle2,
            iconColor: "text-emerald-500",
            lineColor: "bg-emerald-500",
        };
    }

    return {
        Icon: Clock,
        iconColor: "text-blue-500",
        lineColor: "bg-emerald-500",
    };
};

export const OrderTimeline = ({ statusHistory = [], createdAt }) => {
    if (!statusHistory || statusHistory.length === 0) {
        return (
            <div className="flex items-center justify-between relative px-2 mt-4">
                <div className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 px-2">
                    <CheckCircle2 size={24} className="text-emerald-500 bg-white dark:bg-zinc-900 rounded-full" />
                    <div className="text-center">
                        <div className="text-[11px] font-medium text-gray-500">Placed</div>
                        <div className="text-[11px] font-semibold text-gray-900 dark:text-gray-100">
                            {createdAt ? format(new Date(createdAt), "hh:mm a") : "-"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const sortedHistory = [...statusHistory]
        .filter(item => item.statusType === "ORDER" || !item.statusType)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return (
        <div className="flex relative mt-4 overflow-x-auto no-scrollbar pb-2">
            {sortedHistory.map((historyItem, index) => {
                const isLast = index === sortedHistory.length - 1;
                const { Icon, iconColor, lineColor } = getTimelineStepState(historyItem.status, isLast);
                const label = ORDER_STATUS_CONFIG[historyItem.status]?.label || historyItem.status;

                return (
                    <div key={index} className="flex flex-col items-center relative flex-1 min-w-[72px] shrink-0">
                        {!isLast && (
                            <div className={cn("absolute top-3 left-1/2 w-full h-[2px] z-0", lineColor)} />
                        )}

                        <div className="bg-white dark:bg-zinc-900 px-1 relative z-10">
                            <Icon size={24} className={cn("rounded-full bg-white dark:bg-zinc-900", iconColor)} />
                        </div>

                        <div className="text-center mt-2 px-1">
                            <div className="text-[11px] font-medium text-gray-500 leading-tight">{label}</div>
                            <div className="text-[10px] font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                {format(new Date(historyItem.timestamp), "hh:mm a")}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderTimeline;
