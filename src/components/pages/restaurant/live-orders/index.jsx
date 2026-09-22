"use client";
import { OrderCard } from "./fragments";
import { RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/global/table";
import { OrderDetailsDrawer } from "../orders/fragments";
import { OrderService } from "@/services/frontend/order";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { LIVE_ORDER_TABS } from "./fragments/helpers/constants";

export default function LiveOrders() {
    const { restaurantId } = useRestaurant();
    const notify = useNotification();
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const PAGE_SIZE = 24; 

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["live-orders", restaurantId, filter, page, appliedSearch],
        queryFn: async () => {
            if (!restaurantId) return { orders: [], total: 0 };
            
            const params = { page, limit: PAGE_SIZE };
            
            const activeTab = LIVE_ORDER_TABS.find((t) => t.key === filter);
            if (activeTab && activeTab.statuses.length > 0) {
                params.status = activeTab.statuses.join(",");
            } else if (filter === "all") {
                params.status = "PLACED,ACCEPTED,PREPARING,READY_FOR_PICKUP,OUT_FOR_DELIVERY";
            }

            if (appliedSearch) {
                params.search = appliedSearch;
            }

            return OrderService.getAll(restaurantId, params);
        },
        enabled: !!restaurantId,
        refetchInterval: 10000,
    });

    const filterTabs = useMemo(
        () =>
            LIVE_ORDER_TABS.map((t) => ({
                label: t.label,
                value: t.key,
            })),
        []
    );

    const advanceOrderStatus = async (orderId) => {
        try {
            const res = await OrderService.update(restaurantId, orderId, { action: "advance" });
            await refetch();
            notify.success(res?.message || res?.data?.message || "Order status updated successfully!");
        } catch (err) {
            console.error("Failed to advance status", err);
            notify.error(err?.response?.data?.message || err?.message || "Failed to update order status. Please try again.");
        }
    };

    const rejectOrderStatus = async (orderId, reason) => {
        try {
            const res = await OrderService.update(restaurantId, orderId, { action: "reject", reason });
            await refetch();
            notify.success(res?.message || res?.data?.message || "Order rejected successfully.");
        } catch (err) {
            console.error("Failed to reject order", err);
            notify.error(err?.response?.data?.message || err?.message || "Failed to reject order. Please try again.");
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
            <DataTable
                title="Orders Management"
                subtitle="Track and manage live customer orders in real-time"
                columns={[]} 
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
                pageSize={PAGE_SIZE}
                totalCount={data?.data?.total || 0}
                onPageChange={setPage}
                emptyState={{
                    title: "No live orders",
                    description: "There are no live orders matching your criteria.",
                }}
                
                renderGrid={(rows) => (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                        {rows.map((order) => (
                            <div 
                                key={order._id} 
                                onClick={() => setSelectedOrder(order)} 
                                className="cursor-pointer"
                            >
                                <OrderCard 
                                    order={order} 
                                    onUpdateStatus={advanceOrderStatus} 
                                    onRejectStatus={rejectOrderStatus}
                                />
                            </div>
                        ))}
                    </div>
                )}
            />

            <OrderDetailsDrawer
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div>
    );
}