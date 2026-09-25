"use client";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Receipt,
  User,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Utensils,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDetailsDrawer } from "../../orders/fragments";
import { DEFAULT_PAGE_SIZE, formatCurrency } from "../helpers";

export function RecentOrdersTable({ recentOrders = [], isLoading = false }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return recentOrders;
    const q = searchQuery.toLowerCase().trim();
    return recentOrders.filter(
      (ord) =>
        ord.orderNumber?.toLowerCase().includes(q) ||
        ord.customer?.name?.toLowerCase().includes(q) ||
        ord.customer?.phone?.includes(q) ||
        ord.paymentMethod?.toLowerCase().includes(q) ||
        ord.orderType?.toLowerCase().includes(q)
    );
  }, [recentOrders, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / DEFAULT_PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * DEFAULT_PAGE_SIZE;
  const endIndex = Math.min(startIndex + DEFAULT_PAGE_SIZE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 rounded-xl bg-muted/30 border border-border/60 animate-pulse" />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "SERVED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "PLACED":
      case "ACCEPTED":
      case "PREPARING":
      case "READY":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border/70 overflow-hidden shadow-xs flex flex-col">
      {/* Table Header with Search & Count */}
      <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Orders Journal
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit trail of orders processed in this reporting period
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, customer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-1.5 bg-muted/50 border border-border/60 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all placeholder:text-muted-foreground"
            />
          </div>

          <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {paginatedOrders.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">
          <Receipt className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-semibold text-sm">
            {searchQuery ? "No matching orders found" : "No orders recorded in this period"}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {searchQuery ? "Try searching for a different keyword or order number." : "When orders are received, they will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              {paginatedOrders.map((ord) => {
                const orderType = ord.orderType || "DINE_IN";
                const isPaid =
                  ord.paymentStatus === "PAID" || ord.paymentStatus === "COMPLETED";

                return (
                  <tr
                    key={ord._id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(ord)}
                  >
                    {/* Order ID */}
                    <td className="py-3 px-4 font-bold text-foreground truncate">
                      #{ord.orderNumber}
                    </td>

                    {/* Placed Time */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {ord.createdAt
                        ? format(new Date(ord.createdAt), "hh:mm a")
                        : "-"}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">
                          {ord.customer?.name || "Guest Customer"}
                        </span>
                        {ord.customer?.phone && (
                          <span className="text-[10.5px] text-muted-foreground block truncate">
                            {ord.customer.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Order Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-foreground/80 border border-border/60">
                        {orderType === "DINE_IN" ? (
                          <Utensils className="w-3 h-3 text-purple-500" />
                        ) : orderType === "DELIVERY" ? (
                          <Truck className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ShoppingBag className="w-3 h-3 text-blue-500" />
                        )}
                        <span>{orderType.replace(/_/g, " ")}</span>
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground text-[11px]">
                          {ord.paymentMethod || "CASH"}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isPaid ? "PAID" : "DUE"}
                        </span>
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${getStatusBadge(
                          ord.orderStatus
                        )}`}
                      >
                        {ord.orderStatus?.replace(/_/g, " ") || "PLACED"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-black tabular-nums text-foreground">
                      ₹{Number(ord.totalAmount || 0).toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredOrders.length > 0 && (
        <div className="p-3.5 sm:px-5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-muted-foreground text-[11.5px]">
            Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-foreground">{endIndex}</span> of{" "}
            <span className="font-bold text-foreground">{filteredOrders.length}</span> orders
            {DEFAULT_PAGE_SIZE < filteredOrders.length && ` (${DEFAULT_PAGE_SIZE} per page)`}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage <= 1}
                className="h-7 px-2 text-xs rounded-md border-border cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev</span>
              </Button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Only show current, first, last, and immediate neighbours if many pages
                  const isCurrent = page === validCurrentPage;
                  const isNear = Math.abs(page - validCurrentPage) <= 1 || page === 1 || page === totalPages;

                  if (!isNear) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-1 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-7 min-w-[28px] px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-card text-foreground hover:bg-muted border border-border"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage >= totalPages}
                className="h-7 px-2 text-xs rounded-md border-border cursor-pointer disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Slide-over details drawer */}
      <OrderDetailsDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
