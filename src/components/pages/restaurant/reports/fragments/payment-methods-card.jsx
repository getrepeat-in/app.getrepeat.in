"use client";
import React from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PAYMENT_METHOD_CONFIG, formatCurrency } from "../helpers";

export function PaymentMethodsCard({
  paymentMethods = [],
  paymentStatuses = [],
  totalRevenue = 0,
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
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        {/* 4 Method Bento Grid Skeleton */}
        <div className="grid grid-cols-2 gap-0 border border-border/40 rounded-lg overflow-hidden bg-muted/10">
          {[1, 2, 3, 4].map((i, idx) => {
            const isRightCol = idx % 2 !== 0;
            const isBottomRow = idx >= 2;
            return (
              <div
                key={i}
                className={`p-3 space-y-3 ${
                  !isRightCol ? "border-r border-border/40" : ""
                } ${!isBottomRow ? "border-b border-border/40" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-md shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-2 w-10 rounded" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-2 w-6 rounded" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlement Footer Skeleton */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  // Ensure default methods exist even if 0
  const normalizedMethods = ["CASH", "UPI", "CARD", "ONLINE"].map((key) => {
    const found = paymentMethods.find(
      (pm) => pm.method?.toUpperCase() === key
    );
    const revenue = found?.revenue || 0;
    const count = found?.count || 0;
    const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    return {
      method: key,
      revenue,
      count,
      percentage,
      ...(PAYMENT_METHOD_CONFIG[key] || PAYMENT_METHOD_CONFIG.CASH),
    };
  });

  const maxRevenue = Math.max(...normalizedMethods.map((m) => m.revenue));

  return (
    <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header: Title & Total Badge (No description, responsive) */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
        <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2 min-w-0">
          <Wallet className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Payment Modes</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground/80 shrink-0 whitespace-nowrap">
          Total: {formatCurrency(totalRevenue)}
        </span>
      </div>

      {/* Payment Methods Bento Grid */}
      <div className="grid grid-cols-2 gap-0 border border-border/40 rounded-lg overflow-hidden bg-muted/10">
        {normalizedMethods.map((pm, idx) => {
          const Icon = pm.icon;
          const barWidth = maxRevenue > 0 ? (pm.revenue / maxRevenue) * 100 : 0;
          const isRightCol = idx % 2 !== 0;
          const isBottomRow = idx >= 2;

          return (
            <div
              key={pm.method}
              className={`p-3 relative flex flex-col justify-between gap-3 hover:bg-muted/30 transition-colors ${
                !isRightCol ? "border-r border-border/40" : ""
              } ${!isBottomRow ? "border-b border-border/40" : ""}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`p-1.5 rounded-md border shrink-0 ${pm.bgLight} ${pm.textColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs text-foreground leading-tight truncate">
                    {pm.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {pm.count} {pm.count === 1 ? "order" : "orders"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-end justify-between">
                  <span className="font-bold text-sm text-foreground tabular-nums leading-none">
                    {formatCurrency(pm.revenue)}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground leading-none">
                    {pm.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden relative">
                  <div
                    className={`absolute left-0 top-0 h-full ${pm.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settlement Status Strip */}
      <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          Settlement Status
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {paymentStatuses.map((ps) => {
            const isPaid = ps._id === "PAID" || ps._id === "COMPLETED";
            return (
              <span
                key={ps._id}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border flex items-center gap-1 shrink-0 ${
                  isPaid
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {ps._id}: {ps.count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
