"use client";

import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "../helpers/constants";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const STATUS_ORDER = {
    PLACED: 1, ACCEPTED: 2, PREPARING: 3, READY: 4,
    SERVED: 5, PICKED_UP: 5, IN_TRANSIT: 5,
    DELIVERED: 6, COMPLETED: 7, CANCELLED: 8, REJECTED: 8,
};

const getTimelineStepState = (status, isLast) => {
    if (status === "REJECTED" || status === "CANCELLED") {
        return { Icon: XCircle, iconColor: "text-red-500", lineColor: "bg-red-500" };
    }
    if (status === "COMPLETED" || !isLast) {
        return { Icon: CheckCircle2, iconColor: "text-emerald-500", lineColor: "bg-emerald-500" };
    }
    return { Icon: Clock, iconColor: "text-blue-500", lineColor: "bg-emerald-500" };
};

const resolveUpdatedBy = (historyItem) => {
    const staff    = historyItem.updatedByStaff;
    const customer = historyItem.updatedByCustomer;

    if (staff)    return { label: staff.name || staff.email, sub: staff.email, type: "Staff" };
    if (customer) return { label: customer.name || customer.phone || customer.email, sub: customer.phone || customer.email, type: "Customer" };
    return { label: "System", sub: null, type: "System" };
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
        .filter(item => item.statusType === "ORDER")
        .sort((a, b) => {
            const timeDiff = new Date(a.timestamp) - new Date(b.timestamp);
            if (timeDiff === 0) {
                return (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99);
            }
            return timeDiff;
        });

    return (
        <div className="flex relative mt-4 overflow-x-auto no-scrollbar pb-2">
            <TooltipProvider>
                {sortedHistory.map((historyItem, index) => {
                    const isLast = index === sortedHistory.length - 1;
                    const { Icon, iconColor, lineColor } = getTimelineStepState(historyItem.status, isLast);
                    const label = ORDER_STATUS_CONFIG[historyItem.status]?.label || historyItem.status;
                    const { label: updaterName, sub, type } = resolveUpdatedBy(historyItem);

                    return (
                        <div key={index} className="flex flex-col items-center relative flex-1 min-w-[72px] shrink-0">
                            {!isLast && (
                                <div className={cn("absolute top-3 left-1/2 w-full h-[2px] z-0", lineColor)} />
                            )}

                            <Tooltip delay={100}>
                                <TooltipTrigger asChild>
                                    <div className="bg-white dark:bg-zinc-900 px-1 relative z-10 cursor-help">
                                        <Icon size={24} className={cn("rounded-full bg-white dark:bg-zinc-900", iconColor)} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="flex flex-col gap-0.5">
                                    <div>
                                        <span className="font-semibold text-gray-300">{type}: </span>
                                        <span className="font-bold text-white">{updaterName}</span>
                                    </div>
                                    {sub && <div className="text-gray-400 text-xs">{sub}</div>}
                                </TooltipContent>
                            </Tooltip>

                            <div className="text-center mt-2 px-1">
                                <div className="text-[11px] font-medium text-gray-500 leading-tight">{label}</div>
                                <div className="text-[10px] font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                    {format(new Date(historyItem.timestamp), "hh:mm a")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </TooltipProvider>
        </div>
    );
};

export default OrderTimeline;
