"use client";
import React, { useState, useMemo } from "react";
import { Award, Flame, ShoppingBag, TrendingUp, Crown, Tag } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { ItemImage } from "@/components/global/item-image";
import { Skeleton } from "@/components/ui/skeleton";
import { DIETARY_CONFIG, formatCurrency } from "../helpers";

const DietaryBadge = ({ dietaryType, className = "" }) => {
  const type = dietaryType?.toLowerCase();
  const config = DIETARY_CONFIG[type] || DIETARY_CONFIG.veg;

  return (
    <div
      className={`w-4 h-4 rounded-xs border-2 ${config.borderColor} bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-xs ${className}`}
      title={config.label}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
    </div>
  );
};

export function TopItemsCard({ topItems = [], isLoading = false }) {
  const [sortBy, setSortBy] = useState("volume"); // 'volume' | 'revenue'

  const sortedItems = useMemo(() => {
    if (!topItems || topItems.length === 0) return [];
    const list = [...topItems];
    if (sortBy === "revenue") {
      return list.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    }
    return list.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
  }, [topItems, sortBy]);

  // Show top 5 items
  const displayItems = useMemo(() => {
    return sortedItems.slice(0, 5);
  }, [sortedItems]);

  const totalVolume = useMemo(() => {
    return (topItems || []).reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [topItems]);

  const totalRevenue = useMemo(() => {
    return (topItems || []).reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  }, [topItems]);

  const maxVal = useMemo(() => {
    if (displayItems.length === 0) return 1;
    if (sortBy === "revenue") {
      return Math.max(...displayItems.map((i) => i.revenue || 0), 1);
    }
    return Math.max(...displayItems.map((i) => i.quantity || 0), 1);
  }, [displayItems, sortBy]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-32 rounded-lg self-start sm:self-auto" />
        </div>

        {/* 5 Item Rows Skeleton */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-2 sm:p-2.5 rounded-xl border border-border/40 flex items-center justify-between gap-3 bg-muted/20"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 rounded-xs shrink-0" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                  <Skeleton className="h-2 w-20 rounded" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 shrink-0">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-2.5 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topItems || topItems.length === 0) {
    return (
      <div className="h-full rounded-xl bg-card border border-border/70 p-8 flex flex-col items-center justify-center text-center text-muted-foreground shadow-xs">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Award className="w-6 h-6 text-muted-foreground/60" />
        </div>
        <p className="font-semibold text-base text-foreground">No dishes sold yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Top dishes will automatically rank here with item images, prices, and revenue as incoming orders are fulfilled.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Flame className="w-5 h-5 fill-primary/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground">
                Top Selling Dishes
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Top {displayItems.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by {sortBy === "volume" ? "volume (quantity sold)" : "total revenue"} in selected period
            </p>
          </div>
        </div>

        {/* Action / Sort Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setSortBy("volume")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                sortBy === "volume"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Volume
            </button>
            <button
              type="button"
              onClick={() => setSortBy("revenue")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                sortBy === "revenue"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Revenue
            </button>
          </div>
        </div>
      </div>

      {/* Summary Highlight Pills */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-muted/30 p-2 rounded-xl border border-border/40 text-xs">
        <div className="flex items-center gap-2 px-1">
          <ShoppingBag className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Total Units:</span>
          <span className="font-bold text-foreground">{totalVolume} sold</span>
        </div>
        <div className="flex items-center justify-end gap-2 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-muted-foreground">Top Sales:</span>
          <span className="font-bold text-foreground">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Dish List (Top 5 items) */}
      <div className="divide-y divide-border/40 space-y-1.5 flex-1 flex flex-col justify-between">
        {displayItems.map((item, idx) => {
          const currentVal = sortBy === "revenue" ? item.revenue || 0 : item.quantity || 0;
          const percent = Math.min(100, Math.max(8, (currentVal / maxVal) * 100));
          const dishName = item.name || item._id || "Unknown Dish";
          const unitPrice = item.unitPrice || item.base_price || (item.quantity > 0 ? item.revenue / item.quantity : 0);
          const revenueShare = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(0) : 0;

          // Format image source safely
          const rawImage = item.image;
          const imageSrc = rawImage ? getImageUrl(rawImage, true, "thumbnail") : "";

          // Rank badge styling
          const isGold = idx === 0;
          const isSilver = idx === 1;
          const isBronze = idx === 2;

          return (
            <div
              key={item._id || idx}
              className="pt-2 pb-1.5 first:pt-0 group hover:bg-muted/30 rounded-xl px-2 py-1 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left side: Rank + Image + Name & Metadata */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                      isGold
                        ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-400/30"
                        : isSilver
                        ? "bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                        : isBronze
                        ? "bg-gradient-to-b from-amber-700/20 to-amber-800/30 text-amber-800 dark:text-amber-300 font-bold"
                        : "bg-muted text-muted-foreground font-semibold"
                    }`}
                  >
                    {isGold ? <Crown className="w-3 h-3 text-amber-950" /> : idx + 1}
                  </div>

                  {/* Item Image with corner dietary indicator */}
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-border/70 bg-muted/40 shadow-xs">
                    <ItemImage
                      src={imageSrc}
                      alt={dishName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-0.5 left-0.5 pointer-events-none scale-90">
                      <DietaryBadge dietaryType={item.dietaryType} />
                    </div>
                  </div>

                  {/* Name, Category & Unit Price */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4
                        className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-full"
                        title={dishName}
                      >
                        {dishName}
                      </h4>
                      {item.categoryName && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border/50 shrink-0">
                          <Tag className="w-2.5 h-2.5" />
                          {item.categoryName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] sm:text-xs font-medium text-foreground/80">
                        {formatCurrency(unitPrice)}
                        <span className="text-[10px] text-muted-foreground ml-0.5">/ item</span>
                      </span>
                      <span className="text-muted-foreground/40 text-[10px]">•</span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {revenueShare}% of revenue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Volume Sold badge & Total Revenue */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(item.revenue)}
                  </div>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-primary/10 text-primary border border-primary/20">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      {item.quantity} sold
                    </span>
                  </div>
                </div>
              </div>

              {/* Volume / Revenue Progress Track */}
              <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-1.5 relative">
                <div
                  style={{ width: `${percent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGold
                      ? "bg-primary"
                      : isSilver
                      ? "bg-primary/85"
                      : isBronze
                      ? "bg-primary/70"
                      : "bg-primary/50"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
