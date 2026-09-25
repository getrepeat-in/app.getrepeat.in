"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import {
  BarChart3,
  RefreshCw,
  Download,
  Printer,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import Loader from "@/components/global/loader";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { ReportService } from "@/services/frontend/reports";
import { KpiCards } from "./fragments/kpi-cards";
import { SalesTrendChart } from "./fragments/sales-trend-chart";
import { PaymentMethodsCard } from "./fragments/payment-methods-card";
import { OrderTypesCard } from "./fragments/order-types-card";
import { TopItemsCard } from "./fragments/top-items-card";
import { DayCloseModal } from "./fragments/day-close-modal";
import { exportReportsToCsv, PRESET_TABS } from "./helpers";

export default function ReportsManagement() {
  const { restaurantId, restaurants } = useRestaurant();
  const activeRestaurant = restaurants?.find((r) => r._id === restaurantId);
  const restaurantName = activeRestaurant?.name || "Restaurant";

  const [activePreset, setActivePreset] = useState("today");
  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [isDayCloseOpen, setIsDayCloseOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: responseData, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "restaurant-reports",
      restaurantId,
      activePreset,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: async () => {
      if (!restaurantId) return null;
      const params = { preset: activePreset };
      if (activePreset === "custom" && dateRange?.from) {
        params.startDate = dateRange.from.toISOString();
        params.endDate = dateRange.to
          ? dateRange.to.toISOString()
          : endOfDay(dateRange.from).toISOString();
      }
      return ReportService.getAnalytics(restaurantId, params);
    },
    enabled: !!restaurantId,
    refetchInterval: 30000, // Background poll every 30 seconds
  });

  const reportData = responseData?.data || {};
  const summary = reportData.summary || {};
  const today = reportData.today || {};
  const paymentMethods = reportData.paymentMethods || [];
  const paymentStatuses = reportData.paymentStatuses || [];
  const orderTypes = reportData.orderTypes || [];
  const timeline = reportData.timeline || [];
  const topItems = reportData.topItems || [];
  const recentOrders = reportData.recentOrders || [];

  const handlePresetSelect = (presetKey) => {
    setActivePreset(presetKey);
    const now = new Date();
    if (presetKey === "today") {
      setDateRange({ from: startOfDay(now), to: endOfDay(now) });
    } else if (presetKey === "yesterday") {
      const y = subDays(now, 1);
      setDateRange({ from: startOfDay(y), to: endOfDay(y) });
    } else if (presetKey === "week") {
      setDateRange({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
    } else if (presetKey === "month") {
      setDateRange({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) });
    }
  };

  const handleCustomDateChange = (newRange) => {
    if (newRange?.from) {
      setActivePreset("custom");
      setDateRange(newRange);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await exportReportsToCsv({ data: reportData, restaurantName });
    } finally {
      setIsExporting(false);
    }
  };

  if (!restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] w-full p-8 bg-white dark:bg-zinc-900 rounded-xl border border-border/40 m-2 sm:m-4 shadow-xs">
        <Loader />
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Loading restaurant analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col m-2 sm:m-4 p-3 sm:p-5 md:p-6 space-y-6 bg-white dark:bg-zinc-900 rounded-xl border border-border/40 shadow-xs min-w-0 text-foreground">
      {/* Page Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Sales & Performance Reports
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time metrics, payment mode settlement, and revenue velocity for{" "}
                <span className="font-medium text-foreground">{restaurantName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Sync Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 select-none shadow-2xs"
            title={isFetching ? "Syncing latest data..." : "Auto-refreshing active"}
          >
            {isFetching ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className="text-[11px] uppercase tracking-wide">
              {isFetching ? "Syncing" : "Live"}
            </span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 rounded-lg border-border cursor-pointer shadow-xs gap-1.5"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            <span className="text-xs hidden sm:inline">
              {isFetching ? "Refreshing..." : "Refresh"}
            </span>
          </Button>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
            className="h-9 px-3 rounded-lg border-border cursor-pointer shadow-xs gap-1.5"
            title="Download CSV report"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="text-xs hidden sm:inline">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
          </Button>

          {/* Day Close / Print Report */}
          <Button
            size="sm"
            onClick={() => setIsDayCloseOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 cursor-pointer shadow-sm shadow-primary/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Day-End Report</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {PRESET_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handlePresetSelect(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activePreset === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-foreground/80 hover:bg-muted border border-border/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        <div className="shrink-0 flex items-center gap-2">
          <DatePickerWithRange
            date={dateRange}
            setDate={handleCustomDateChange}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* When viewing past dates: Quick Today Flash Banner */}
      {activePreset !== "today" && (
        <div className="flex items-center justify-between gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>
              Currently viewing past period.{" "}
              <strong className="text-foreground">Today's Live Sales:</strong>{" "}
              <span className="text-primary font-bold">
                ₹{(today.todayRevenue || 0).toFixed(2)}
              </span>{" "}
              ({today.todayOrders || 0} orders today)
            </span>
          </div>
          <button
            onClick={() => handlePresetSelect("today")}
            className="font-bold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            Switch to Today <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <KpiCards summary={summary} today={today} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Main Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SalesTrendChart
            timeline={timeline}
            isHourly={reportData.range?.isHourly}
            isLoading={isLoading}
          />
          <TopItemsCard topItems={topItems} isLoading={isLoading} />
        </div>

        {/* Right Column: Breakdown Cards */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <PaymentMethodsCard
            paymentMethods={paymentMethods}
            paymentStatuses={paymentStatuses}
            totalRevenue={summary.totalRevenue || 0}
            isLoading={isLoading}
          />
          <OrderTypesCard
            orderTypes={orderTypes}
            totalOrders={summary.totalOrders || 0}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Day Close Modal */}
      <DayCloseModal
        isOpen={isDayCloseOpen}
        onClose={() => setIsDayCloseOpen(false)}
        data={reportData}
        restaurantName={restaurantName}
        isLoading={isLoading}
      />
    </div>
  );
}
