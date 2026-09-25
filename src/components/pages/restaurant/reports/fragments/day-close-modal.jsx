"use client";
import React from "react";
import { format } from "date-fns";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { formatCurrency } from "../helpers";

export function DayCloseModal({
  isOpen,
  onClose,
  data,
  restaurantName = "Restaurant",
  isLoading = false,
}) {
  if (!isOpen) return null;

  if (isLoading || !data || Object.keys(data).length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <Loader />
          <p className="text-sm font-semibold text-foreground mt-3">
            Preparing Day-End Report...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Reconciling payments and order channels
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const { summary = {}, paymentMethods = [], orderTypes = [], range = {}, topItems = [] } = data;

  const handlePrint = () => {
    window.print();
  };

  const cashMethod = paymentMethods.find((p) => p.method === "CASH") || { revenue: 0, count: 0 };
  const upiMethod = paymentMethods.find((p) => p.method === "UPI") || { revenue: 0, count: 0 };
  const cardMethod = paymentMethods.find((p) => p.method === "CARD") || { revenue: 0, count: 0 };
  const onlineMethod = paymentMethods.find((p) => p.method === "ONLINE") || { revenue: 0, count: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Day-End Settlement Statement</h3>
              <p className="text-xs text-muted-foreground">
                Z-Report & Reconciliation Summary
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Printable Paper Preview */}
        <div id="printable-day-close" className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Restaurant Branding Header */}
          <div className="text-center border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-4">
            <h2 className="text-lg font-black tracking-tight uppercase">
              {restaurantName}
            </h2>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Daily Sales Register & Reconciliation
            </p>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2">
              Generated: {format(new Date(), "dd-MMM-yyyy | hh:mm a")}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Period: {range.preset?.toUpperCase() || "CUSTOM"} ({range.startDate ? format(new Date(range.startDate), "dd/MM/yyyy") : ""} - {range.endDate ? format(new Date(range.endDate), "dd/MM/yyyy") : ""})
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="space-y-1.5 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-3">
            <div className="flex justify-between font-bold text-xs">
              <span>GROSS REVENUE:</span>
              <span className="tabular-nums">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Items Subtotal:</span>
              <span className="tabular-nums">{formatCurrency(summary.totalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Taxes & GST:</span>
              <span className="tabular-nums">{formatCurrency(summary.totalTax)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Discounts Applied:</span>
              <span className="tabular-nums">-{formatCurrency(summary.totalDiscount)}</span>
            </div>
          </div>

          {/* Order Counts */}
          <div className="space-y-1.5 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-3">
            <div className="flex justify-between">
              <span>Total Orders Placed:</span>
              <span className="font-bold">{summary.totalOrders}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Successfully Completed:</span>
              <span className="font-bold">{summary.completedOrders}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Cancelled / Rejected:</span>
              <span className="font-bold">{summary.cancelledOrders}</span>
            </div>
            <div className="flex justify-between text-blue-500">
              <span>Average Order Value:</span>
              <span className="font-bold">{formatCurrency(summary.averageOrderValue)}</span>
            </div>
          </div>

          {/* Cash & Payment Reconciliation */}
          <div className="space-y-2 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-3">
            <span className="font-black text-xs block uppercase">
              Settlement by Payment Mode:
            </span>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded">
              <span>[1] Cash in Drawer:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(cashMethod.revenue)} ({cashMethod.count} orders)
              </span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded">
              <span>[2] UPI Direct:</span>
              <span className="font-black text-purple-600 dark:text-purple-400 tabular-nums">
                {formatCurrency(upiMethod.revenue)} ({upiMethod.count} orders)
              </span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded">
              <span>[3] Card Swipes:</span>
              <span className="font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {formatCurrency(cardMethod.revenue)} ({cardMethod.count} orders)
              </span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded">
              <span>[4] Online Gateway:</span>
              <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {formatCurrency(onlineMethod.revenue)} ({onlineMethod.count} orders)
              </span>
            </div>
          </div>

          {/* Verification Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-[10px] text-zinc-500">
            <div className="border-t border-zinc-400 pt-1 text-center">
              <span>Cashier / Staff Signature</span>
            </div>
            <div className="border-t border-zinc-400 pt-1 text-center">
              <span>Manager / Owner Verification</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-primary text-primary-foreground gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement
          </Button>
        </div>
      </div>
    </div>
  );
}
