"use client";
import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "../helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee , ShoppingBag , TrendingUp , Wallet } from "lucide-react";

export function KpiCards({ summary = {}, today = {}, isLoading = false }) {
  const totalRevenue = summary.totalRevenue || 0;
  const totalOrders = summary.totalOrders || 0;
  const completedOrders = summary.completedOrders || 0;
  const activeOrders = summary.activeOrders || 0;
  const aov = summary.averageOrderValue || 0;
  const paidRevenue = summary.paidRevenue || 0;
  const pendingRevenue = summary.pendingRevenue || 0;

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtitle: `${completedOrders} completed • ${activeOrders} active`,
      badge: `${totalOrders} Orders`,
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: IndianRupee,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(aov),
      subtitle: "Revenue per order",
      badge: "AOV",
      badgeColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    },
    {
      title: "Today's Live Sales",
      value: formatCurrency(today.todayRevenue),
      subtitle: `${today.todayOrders || 0} placed today (${today.todayActive || 0} live)`,
      badge: "Today",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      icon: ShoppingBag,
      iconBg: "bg-primary/10 text-primary",
      gradient: "from-primary/10 via-primary/5 to-transparent",
    },
    {
      title: "Payment Collections",
      value: formatCurrency(paidRevenue),
      subtitle: pendingRevenue > 0 ? `${formatCurrency(pendingRevenue)} pending collection` : "All payments settled",
      badge: pendingRevenue > 0 ? "Pending Due" : "Settled",
      badgeColor: pendingRevenue > 0
        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: Wallet,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              </div>
              <Skeleton className="h-7 w-32 rounded mt-1" />
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-4 w-14 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all hover:border-primary/30 flex flex-col justify-between group"
          >
            {/* Top decorative gradient sheen */}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="text-2xl sm:text-2xl font-bold text-foreground tracking-tight tabular-nums mt-1">
                {card.value}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground truncate font-medium text-[11.5px]">
                {card.subtitle}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
