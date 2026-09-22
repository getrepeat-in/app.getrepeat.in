"use client";
import { Button } from "@/components/ui/button";
import { OrderDetailsDrawer } from "./fragments";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/global/table";
import { format, startOfDay, endOfDay } from "date-fns";
import { OrderService } from "@/services/frontend/order";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Receipt, Hash, Eye, RefreshCw, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  ORDER_TAB_FILTERS,  ORDER_TYPE_OPTIONS,  DEFAULT_PAGE_SIZE, OrderTypeBadge,  StatusBadge,  PaymentBadge } from "./helpers";

export default function OrdersManagement() {
    const { restaurantId } = useRestaurant();
    const [filter, setFilter] = useState("all");
    const [orderTypeFilter, setOrderTypeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
    });

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["orders", restaurantId, filter, orderTypeFilter, page, appliedSearch, dateRange],
        queryFn: async () => {
            if (!restaurantId) return { orders: [], total: 0 };
            const params = { page, limit: DEFAULT_PAGE_SIZE };
            const activeTab = ORDER_TAB_FILTERS.find(t => t.key === filter);
            if (activeTab && activeTab.statuses.length > 0) {
                params.status = activeTab.statuses.join(",");
            }
            if (orderTypeFilter && orderTypeFilter !== "all") {
                params.orderType = orderTypeFilter;
            }
            if (appliedSearch) {
                params.search = appliedSearch;
            }
            if (dateRange?.from) {
                params.startDate = dateRange.from.toISOString();
            }
            if (dateRange?.to) {
                params.endDate = dateRange.to.toISOString();
            }

            return OrderService.getAll(restaurantId, params);
        },
        enabled: !!restaurantId,
    });

    const filterTabs = useMemo(() => 
        ORDER_TAB_FILTERS.map(t => ({
            label: t.label,
            value: t.key
        })), []
    );

    const columns = useMemo(() => [
        {
            header: "Order ID",
            key: "orderNumber",
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-orange-950/50 flex items-center justify-center text-primary dark:text-primary/90 shrink-0 border border-orange-100 dark:border-orange-900/50">
                        <Receipt size={14} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            <Hash size={12} className="text-gray-400" />
                            {row.orderNumber}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                            {row.items?.length || 0} items
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Date",
            key: "createdAt",
            sortable: true,
            render: (row) => (
                <div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "-"}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                        {row.createdAt ? format(new Date(row.createdAt), "hh:mm a") : "-"}
                    </div>
                </div>
            ),
        },
        {
            header: "Source",
            key: "orderType",
            render: (row) => (
                <OrderTypeBadge 
                    orderType={row.orderType} 
                    table={row.table} 
                    onClick={(e) => {
                        e.stopPropagation();
                        setOrderTypeFilter(row.orderType);
                        setPage(1);
                    }}
                />
            ),
        },
        {
            header: "Customer",
            key: "customer.name",
            render: (row) => row.customer ? (
                <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {row.customer.name || "Guest"}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {row.customer.phone || "-"}
                    </div>
                </div>
            ) : (
                <span className="text-xs text-gray-400 italic">Walk-in</span>
            ),
        },
        {
            header: "Order Status",
            key: "orderStatus",
            align: "center",
            render: (row) => <StatusBadge status={row.orderStatus} />,
        },

        {
            header: "Payment",
            key: "paymentStatus",
            align: "center",
            render: (row) => row.paymentStatus ? <PaymentBadge status={row.paymentStatus} /> : <span className="text-xs text-gray-400">—</span>,
        },
        {
            header: "Amount",
            key: "totalAmount",
            align: "right",
            sortable: true,
            render: (row) => (
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        ₹{(row.totalAmount || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-semibold">
                        {row.paymentMethod || "CASH"}
                    </span>
                </div>
            ),
        }
    ], []);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
            <DataTable
                title="Orders Management"
                subtitle="Track and manage live customer orders in real-time"
                columns={columns}
                rows={data?.data?.orders || []}
                isLoading={isLoading}
                
                searchable
                searchPlaceholder="Search by ID, name, or phone..."
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                    setSearchQuery(q);
                    setAppliedSearch(q);
                    setPage(1);
                }}

                filterTabs={filterTabs}
                activeFilterTab={filter}
                onFilterTabChange={(f) => {
                    setFilter(f);
                    setPage(1);
                }}

                actions={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <Select
                            value={orderTypeFilter}
                            onValueChange={(val) => {
                                setOrderTypeFilter(val);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8.5 w-auto shrink-0 px-2.5 gap-1.5 text-xs font-medium rounded-md border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800/60">
                                <div className="flex items-center gap-1.5">
                                    <Filter size={13} className="text-gray-400 shrink-0" />
                                    <SelectValue placeholder="All" />
                                </div>
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-md min-w-[120px] border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
                                {ORDER_TYPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                                        {opt.iconEmoji ? `${opt.iconEmoji} ${opt.label}` : opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DatePickerWithRange 
                            date={dateRange} 
                            setDate={(range) => {
                                setDateRange(range);
                                setPage(1);
                            }} 
                        />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                            title="Refresh orders"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline text-xs">Refresh</span>
                        </Button>
                    </div>
                }

                pagination
                page={page}
                pageSize={DEFAULT_PAGE_SIZE}
                totalCount={data?.data?.total || 0}
                onPageChange={setPage}
                onRowClick={setSelectedOrder}
                emptyState={{
                    title: "No orders found",
                    description: "There are no orders matching your current search or filter criteria."
                }}
            />

            <OrderDetailsDrawer
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div>
    );
}
