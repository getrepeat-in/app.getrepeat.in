"use client";
import { OrderCard } from "./fragments";
import { useState, useMemo } from "react";
import { RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/global/table";
import { OrderDetailsDrawer } from "../orders/fragments";
import { OrderService } from "@/services/frontend/order";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { LIVE_ORDER_TABS } from "./fragments/helpers/constants";

export default function LiveOrders() {
    const { restaurantId: activeRestaurantId, restaurants } = useRestaurant();
    const notify = useNotification();
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { isConnected: isRealtimeConnected } = useRealtimeOrders({
        restaurantId: activeRestaurantId,
        playChimeOnNewOrder: false,
        showNotificationOnNewOrder: false,
    });

    const PAGE_SIZE = 24; 

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["live-orders", "all", filter, page, appliedSearch, restaurants?.map(r => r._id).join(",")],
        queryFn: async () => {
            if (!restaurants || restaurants.length === 0) return { data: { orders: [], total: 0 } };
            
            const params = { page, limit: PAGE_SIZE }; 
            
            const activeTab = LIVE_ORDER_TABS.find((t) => t.key === filter);
            if (activeTab && activeTab.statuses.length > 0) {
                params.status = activeTab.statuses.join(",");
            } else if (filter === "all") {
                params.status = "PLACED,ACCEPTED,PREPARING,READY,IN_TRANSIT,PICKED_UP,SERVED";
            }

            if (appliedSearch) {
                params.search = appliedSearch;
            }

            params.restaurantIds = restaurants.map(r => r._id).join(",");
            const response = await OrderService.getBulk(params).catch(() => null);
            
            return response || { data: { orders: [], total: 0 } };
        },
        enabled: !!restaurants && restaurants.length > 0,
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
            const order = data?.data?.orders?.find(o => o._id === orderId);
            const rId = order?.restaurantId || order?.restaurant?._id || order?.restaurant || activeRestaurantId;
            const res = await OrderService.update(rId, orderId, { action: "advance" });
            await refetch();
            const updated = res?.data || res;
            const rawStatus = updated?.orderStatus || "";
            const status = rawStatus ? rawStatus.replace(/_/g, " ") : "";
            const fallbackMsg = status
                ? `Order updated successfully: ${status}`
                : "Order updated successfully";
            notify.success(res?.message || res?.data?.message || fallbackMsg);
        } catch (err) {
            console.error("Failed to advance status", err);
            notify.error(err?.response?.data?.message || err?.message || "Failed to update order status. Please try again.");
        }
    };

    const rejectOrderStatus = async (orderId, reason) => {
        try {
            const order = data?.data?.orders?.find(o => o._id === orderId);
            const rId = order?.restaurantId || order?.restaurant?._id || order?.restaurant || activeRestaurantId;
            const res = await OrderService.update(rId, orderId, { action: "reject", reason });
            await refetch();
            notify.success(res?.message || res?.data?.message || "Order updated successfully: REJECTED");
        } catch (err) {
            console.error("Failed to reject order", err);
            notify.error(err?.response?.data?.message || err?.message || "Failed to reject order. Please try again.");
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 sm:m-4 px-3 py-3 pb-24 sm:p-4 md:p-5 space-y-3 sm:space-y-6 sm:rounded-md sm:border sm:border-border/40 sm:shadow-xs min-w-0 h-full">
            <DataTable
                title={
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                            <Radio className="w-4 h-4" />
                        </div>
                        <span>Orders Management</span>
                    </div>
                }
                subtitle="Track and manage live customer orders in real-time"
                hideTitleOnMobile={true}
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

                searchActions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0 px-3"
                        title="Refresh orders"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline text-xs">Refresh</span>
                    </Button>
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