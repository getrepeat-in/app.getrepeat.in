"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CheckCircle2, Clock } from "lucide-react";
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
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="space-y-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
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

        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
        <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2 min-w-0">
          <Wallet className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Payment Modes</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground/80 shrink-0 whitespace-nowrap">
          Total: {formatCurrency(totalRevenue)}
        </span>
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 mt-6">
        <div className="relative shrink-0 w-44 h-44 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="16" className="stroke-muted/20" />
            
            {(() => {
              const radius = 40;
              const circumference = 2 * Math.PI * radius;
              let currentOffset = 0;
              
              return normalizedMethods
                .filter(pm => pm.revenue > 0)
                .map((pm) => {
                  const fraction = totalRevenue > 0 ? pm.revenue / totalRevenue : 0;
                  const strokeLength = fraction * circumference;
                  const offset = currentOffset;
                  currentOffset += strokeLength;
                  
                  return (
                    <circle
                      key={pm.method}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      strokeWidth="16"
                      stroke="currentColor"
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={-offset}
                      className={`${pm.textColor} transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer`}
                    >
                      <title>{`${pm.label}: ${formatCurrency(pm.revenue)} (${pm.percentage.toFixed(1)}%)`}</title>
                    </circle>
                  );
              });
            })()}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total</span>
            <span className="font-bold text-sm text-foreground truncate max-w-[80%]">{formatCurrency(totalRevenue, 0)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
          {normalizedMethods
            .filter(pm => pm.revenue > 0 || totalRevenue === 0)
            .sort((a, b) => b.revenue - a.revenue)
            .map((pm) => {
              const Icon = pm.icon;
              return (
                <div key={pm.method} className="flex items-center gap-3 min-w-0 p-2 rounded-lg bg-muted/30">
                  <div className={`p-2 rounded-lg border shrink-0 ${pm.bgLight} ${pm.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-foreground leading-none truncate">
                      {pm.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium mt-1.5 leading-none truncate">
                      {pm.count} {pm.count === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

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
