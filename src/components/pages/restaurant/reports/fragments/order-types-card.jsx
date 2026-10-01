"use client";
import React from "react";
import { PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_TYPE_CONFIG, formatCurrency } from "../helpers";

export function OrderTypesCard({
  orderTypes = [],
  totalOrders = 0,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-md shrink-0" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/40 flex justify-center">
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>
    );
  }

  const normalizedTypes = ["DINE_IN", "TAKEAWAY", "DELIVERY"].map((key) => {
    const found = orderTypes.find((ot) => ot.type?.toUpperCase() === key);
    const count = found?.count || 0;
    const revenue = found?.revenue || 0;
    const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
    return {
      type: key,
      count,
      revenue,
      percentage,
      ...(ORDER_TYPE_CONFIG[key] || ORDER_TYPE_CONFIG.DINE_IN),
    };
  });

  const mostPopular = normalizedTypes.reduce(
    (prev, curr) => (curr.count > prev.count ? curr : prev),
    normalizedTypes[0]
  );

  const maxCount = Math.max(...normalizedTypes.map((t) => t.count));

  return (
    <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
        <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2 truncate">
          <PieChart className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Order Channels</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 whitespace-nowrap">
          {totalOrders} Orders
        </span>
      </div>

      <div className="space-y-4 mt-2">
        {normalizedTypes
          .sort((a, b) => b.count - a.count)
          .map((ot) => {
            const Icon = ot.icon;
            const barWidth = maxCount > 0 ? (ot.count / maxCount) * 100 : 0;

            return (
              <div key={ot.type} className="flex flex-col gap-1.5 group">
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-md border shrink-0 ${ot.bgLight} ${ot.textColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground leading-tight truncate">
                        {ot.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                        {ot.count} {ot.count === 1 ? "order" : "orders"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-sm text-foreground tabular-nums leading-none">
                      {formatCurrency(ot.revenue)}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground mt-1 leading-none">
                      {ot.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-muted/60 overflow-hidden relative">
                    <div
                      className={`absolute left-0 top-0 h-full ${ot.color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground text-center">
        <span>Most popular: </span>
        <span className="font-semibold text-foreground">
          {mostPopular.label}
        </span>
      </div>
    </div>
  );
}
