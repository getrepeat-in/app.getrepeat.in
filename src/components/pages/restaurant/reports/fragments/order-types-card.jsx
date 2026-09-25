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
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Multi-segment bar skeleton */}
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="flex items-center justify-between px-0.5">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
          </div>
        </div>

        {/* Channel Cards Skeleton */}
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-2.5 sm:p-3 rounded-xl border border-border/40 flex items-center justify-between gap-2.5 bg-muted/20"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-2.5 w-28 rounded" />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 shrink-0">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-2 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
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

  return (
    <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header: Title & Count Badge */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
        <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2 truncate">
          <PieChart className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Order Channels</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 whitespace-nowrap">
          {totalOrders} Orders
        </span>
      </div>

      {/* Visual Multi-Segment Bar */}
      {totalOrders > 0 && (
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
            {normalizedTypes.map((ot) => {
              if (ot.percentage <= 0) return null;
              return (
                <div
                  key={ot.type}
                  style={{ width: `${ot.percentage}%` }}
                  className={`h-full ${ot.color} transition-all`}
                  title={`${ot.label}: ${ot.count} orders (${ot.percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5 flex-wrap gap-1">
            {normalizedTypes
              .filter((ot) => ot.percentage > 0)
              .map((ot) => (
                <div key={ot.type} className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${ot.color}`} />
                  <span className="font-medium text-[10.5px]">
                    {ot.type.replace("_", " ")}: {ot.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Channel Cards */}
      <div className="flex flex-col gap-2">
        {normalizedTypes.map((ot) => {
          const Icon = ot.icon;
          return (
            <div
              key={ot.type}
              className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2.5 ${ot.bgLight}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${ot.color}/15 flex items-center justify-center shrink-0 ${ot.textColor}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground text-xs block truncate leading-tight">
                    {ot.label}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground block mt-0.5 truncate">
                    {ot.count} orders ({ot.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-foreground text-xs tabular-nums block leading-tight">
                  {formatCurrency(ot.revenue)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {ot.count > 0 ? `Avg ${formatCurrency(ot.revenue / ot.count, 0)}` : "₹0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Most Popular Channel Footer */}
      <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground text-center">
        <span>Most popular: </span>
        <span className="font-semibold text-foreground">
          {mostPopular.label}
        </span>
      </div>
    </div>
  );
}
