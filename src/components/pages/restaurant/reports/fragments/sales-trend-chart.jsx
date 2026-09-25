"use client";
import { motion } from "framer-motion";
import React, { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, BarChart3, Flame } from "lucide-react";
import { INTERVAL_HOURS, formatHourRangeShort, formatHourRangeFull, formatDateLabel, formatCurrency } from "../helpers";

export function SalesTrendChart({
  timeline = [],
  isHourly = true,
  isLoading = false,
}) {
  const [activeMetric, setActiveMetric] = useState("revenue"); 
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const processedTimeline = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    if (!isHourly) {
      return timeline.map((point) => ({
        ...point,
        displayLabel: formatDateLabel(point._id),
        fullLabel: point._id,
      }));
    }

    const buckets = {};

    for (let h = 0; h < 24; h += INTERVAL_HOURS) {
      buckets[h] = {
        _id: `${String(h).padStart(2, "0")}:00`,
        startHour: h,
        orders: 0,
        revenue: 0,
        cancelled: 0,
        displayLabel: formatHourRangeShort(h, INTERVAL_HOURS),
        fullLabel: formatHourRangeFull(h, INTERVAL_HOURS),
      };
    }

    timeline.forEach((pt) => {
      const rawHour = parseInt(String(pt._id).split(":")[0], 10);
      if (!isNaN(rawHour) && rawHour >= 0 && rawHour < 24) {
        const bucketHour = Math.floor(rawHour / INTERVAL_HOURS) * INTERVAL_HOURS;
        if (buckets[bucketHour]) {
          buckets[bucketHour].orders += pt.orders || 0;
          buckets[bucketHour].revenue += pt.revenue || 0;
          buckets[bucketHour].cancelled += pt.cancelled || 0;
        }
      }
    });

    const list = Object.values(buckets);

    if (showActiveOnly) {
      const active = list.filter((b) => b.orders > 0 || b.revenue > 0);
      return active.length > 0 ? active : list;
    }

    return list;
  }, [timeline, isHourly, showActiveOnly]);

  const maxRevenue = useMemo(() => {
    return Math.max(...processedTimeline.map((t) => t.revenue || 0), 100);
  }, [processedTimeline]);

  const maxOrders = useMemo(() => {
    return Math.max(...processedTimeline.map((t) => t.orders || 0), 1);
  }, [processedTimeline]);

  const totalRevenue = useMemo(() => {
    return processedTimeline.reduce((s, t) => s + (t.revenue || 0), 0);
  }, [processedTimeline]);

  const totalOrders = useMemo(() => {
    return processedTimeline.reduce((s, t) => s + (t.orders || 0), 0);
  }, [processedTimeline]);

  const peakPoint = useMemo(() => {
    if (processedTimeline.length === 0) return null;
    const candidates = processedTimeline.filter((p) => p.orders > 0 || p.revenue > 0);
    if (candidates.length === 0) return null;

    return candidates.reduce((prev, curr) => {
      const prevVal = activeMetric === "revenue" ? prev.revenue : prev.orders;
      const currVal = activeMetric === "revenue" ? curr.revenue : curr.orders;
      return currVal > prevVal ? curr : prev;
    }, candidates[0]);
  }, [processedTimeline, activeMetric]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-3 w-56 rounded" />
          </div>
          <Skeleton className="h-8 w-44 rounded-lg self-start sm:self-auto" />
        </div>

        <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-border/40 pb-2">
          {[40, 65, 30, 85, 45, 90, 60, 75, 35, 50, 70, 25].map((heightPct, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full rounded-t-sm"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-2.5 w-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-72 rounded-xl bg-card border border-border/70 p-6 flex flex-col items-center justify-center text-center text-muted-foreground shadow-xs">
        <BarChart3 className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <p className="font-semibold text-sm text-foreground">No sales data for this period</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Orders placed in this time range will plot dynamically by 2-hour intervals in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary shrink-0" />
              {isHourly ? "Hourly Sales Velocity" : "Daily Sales Trend"}
            </h3>
            {peakPoint && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Flame className="w-3 h-3 fill-primary/30" />
                Peak: {peakPoint.displayLabel} ({formatCurrency(peakPoint.revenue)})
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isHourly
              ? "Grouped into 2-hour time intervals (e.g. 12 – 2 PM)"
              : "Day-by-day sales & order frequency"}
          </p>
        </div>

        <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeMetric === "revenue"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Revenue (₹)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("orders")}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeMetric === "orders"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders Count
          </button>
        </div>
      </div>

      <div className="relative pt-6 pb-1">
        {hoveredPoint && (
          <div className="absolute top-0 right-2 sm:left-1/2 sm:-translate-x-1/2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-foreground text-xs shadow-lg border border-border/80 pointer-events-none flex items-center gap-2.5 z-20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{hoveredPoint.fullLabel || hoveredPoint.displayLabel}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
              {formatCurrency(hoveredPoint.revenue)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-medium text-muted-foreground">
              {hoveredPoint.orders} {hoveredPoint.orders === 1 ? "order" : "orders"}
            </span>
            {peakPoint && peakPoint.displayLabel === hoveredPoint.displayLabel && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                Peak
              </span>
            )}
          </div>
        )}

        <div className="h-56 flex items-end gap-1 sm:gap-2 px-1 border-b border-border/60">
          {processedTimeline.map((point, idx) => {
            const isHovered = hoveredPoint?.displayLabel === point.displayLabel;
            const isPeak = peakPoint?.displayLabel === point.displayLabel && (point.orders > 0 || point.revenue > 0);
            const currentVal = activeMetric === "revenue" ? point.revenue : point.orders;
            const maxVal = activeMetric === "revenue" ? maxRevenue : maxOrders;
            const hasData = currentVal > 0;
            const heightPercent = hasData
              ? Math.max(6, Math.min(100, (currentVal / maxVal) * 100))
              : 0;

            return (
              <div
                key={point.displayLabel || idx}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {hasData ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.35, delay: idx * 0.015 }}
                    className={`w-full max-w-[34px] rounded-t-lg transition-all ${
                      isHovered
                        ? "bg-primary shadow-lg shadow-primary/40 ring-2 ring-primary/40"
                        : isPeak
                        ? "bg-primary shadow-md shadow-primary/20"
                        : "bg-primary/75 hover:bg-primary"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full max-w-[28px] h-1 rounded-full transition-all ${
                      isHovered
                        ? "bg-primary/50 h-2"
                        : "bg-muted hover:bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-1 mt-2.5 px-0.5 overflow-hidden">
          {processedTimeline.map((point, idx) => {
            const isHovered = hoveredPoint?.displayLabel === point.displayLabel;
            const isPeak = peakPoint?.displayLabel === point.displayLabel && (point.orders > 0 || point.revenue > 0);

            const total = processedTimeline.length;
            const isDense = total > 12;
            const shouldHideOnMobile = isDense && idx % 2 !== 0;

            return (
              <div
                key={point.displayLabel || idx}
                style={{ width: `${100 / total}%` }}
                className={`text-center shrink-0 ${
                  shouldHideOnMobile ? "hidden sm:block" : "block"
                }`}
                title={point.fullLabel}
              >
                <span
                  className={`block text-[9.5px] sm:text-[11px] leading-tight transition-colors truncate font-semibold ${
                    isHovered
                      ? "text-primary font-bold"
                      : isPeak
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {point.displayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Recorded:</span>
            <span className="font-bold text-foreground">{totalOrders} Orders</span>
          </div>
          <span className="text-border">•</span>
          <div>
            <span>Sales: </span>
            <span className="font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>

        {isHourly && (
          <button
            type="button"
            onClick={() => setShowActiveOnly((prev) => !prev)}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto cursor-pointer"
          >
            {showActiveOnly ? "← View Full 24 Hours" : "Show Active Hours Only →"}
          </button>
        )}
      </div>
    </div>
  );
}
