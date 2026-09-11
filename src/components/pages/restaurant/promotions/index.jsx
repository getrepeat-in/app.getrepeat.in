"use client";
import { useState, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionFormSheet } from "./fragments";
import DataTable from "@/components/global/table";
import { usePromotions } from "./hooks/usePromotions";
import useNotification from "@/store/hooks/useNotification";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { PROMOTION_STATUS_FILTERS, DEFAULT_PAGE_SIZE, PromotionNameCell, PromotionTypeBadge, PromotionTargetCell, PromotionDiscountCell, PromotionDateCell, PromotionStatusBadge, PromotionActionsCell } from "./helpers";

export default function Promotions() {
    const {
        promotions,
        isLoading,
        error,
        createPromotion,
        updatePromotion,
        deletePromotion,
        isCreating,
        isUpdating,
        isDeleting,
        refetch,
    } = usePromotions();

    const notification = useNotification();
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [promotionToDelete, setPromotionToDelete] = useState(null);

    const handleCreate = () => {
        setEditingPromotion(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setIsSheetOpen(true);
    };

    const handleDelete = async () => {
        if (!promotionToDelete) return;
        try {
            await deletePromotion(promotionToDelete._id);
            notification.success("Promotion deleted successfully");
            setPromotionToDelete(null);
        } catch (err) {
            console.error("Failed to delete", err);
            notification.error(err.message || "Failed to delete promotion");
            setPromotionToDelete(null);
        }
    };

    const handleSubmit = async (payload) => {
        try {
            if (editingPromotion) {
                await updatePromotion({ promotionId: editingPromotion._id, data: payload });
                notification.success("Promotion updated successfully");
            } else {
                await createPromotion(payload);
                notification.success("Promotion created successfully");
            }
            setIsSheetOpen(false);
            setEditingPromotion(null);
        } catch (err) {
            console.error("Operation failed:", err);
            notification.error(err.message || "Operation failed");
        }
    };

    const filterTabs = useMemo(() =>
        PROMOTION_STATUS_FILTERS.map((t) => ({
            label: t.label,
            value: t.value,
        })), []
    );

    const filteredPromotions = useMemo(() => {
        if (!promotions) return [];
        let data = promotions;
        if (statusFilter && statusFilter !== "all") {
            data = data.filter((p) => p.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((p) =>
                p.name?.toLowerCase().includes(q) ||
                p.code?.toLowerCase().includes(q) ||
                p.discount_type?.toLowerCase().includes(q)
            );
        }
        return data;
    }, [promotions, statusFilter, searchQuery]);

    const columns = useMemo(() => [
        {
            header: "Promotion",
            key: "name",
            sortable: true,
            render: (row) => <PromotionNameCell promotion={row} />,
        },
        {
            header: "Type",
            key: "type",
            sortable: true,
            render: (row) => <PromotionTypeBadge promotion={row} />,
        },
        {
            header: "Applies To",
            key: "items",
            render: (row) => <PromotionTargetCell promotion={row} />,
        },
        {
            header: "Discount",
            key: "discount_value",
            sortable: true,
            render: (row) => <PromotionDiscountCell promotion={row} />,
        },
        {
            header: "Active Dates",
            key: "dates",
            render: (row) => <PromotionDateCell promotion={row} />,
        },
        {
            header: "Status",
            key: "status",
            align: "center",
            render: (row) => <PromotionStatusBadge status={row.status} />,
        },
        {
            header: "Actions",
            key: "actions",
            align: "right",
            width: "100px",
            render: (row) => (
                <PromotionActionsCell
                    promotion={row}
                    onEdit={handleEdit}
                    onDelete={setPromotionToDelete}
                />
            ),
        },
    ], []);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
            <DataTable
                title="Promotions Management"
                subtitle="Create and manage discount codes, automatic offers, and flash sales"
                columns={columns}
                data={filteredPromotions}
                isLoading={isLoading}
                error={error}

                searchable
                searchPlaceholder="Search promotions by name or code..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}

                filterTabs={filterTabs}
                activeFilterTab={statusFilter}
                onFilterTabChange={setStatusFilter}

                actions={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <Button
                            onClick={handleCreate}
                            size="sm"
                            className="h-8.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Create Promotion</span>
                        </Button>

                        {refetch && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                                title="Refresh promotions list"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline text-xs">Refresh</span>
                            </Button>
                        )}
                    </div>
                }

                pagination
                pageSize={DEFAULT_PAGE_SIZE}
                emptyState={{
                    title: "No Promotions Found",
                    description: "You haven't created any promotions yet. Create your first promotion to get started.",
                }}
            />

            <PromotionFormSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setEditingPromotion(null);
                }}
                promotion={editingPromotion}
                onSubmit={handleSubmit}
                isSubmitting={isCreating || isUpdating}
            />

            <ConfirmDeleteAlert
                isOpen={!!promotionToDelete}
                onClose={() => setPromotionToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete Promotion?"
                description={`Are you sure you want to delete "${promotionToDelete?.name || "this promotion"}"? This action cannot be undone.`}
            />
        </div>
    );
}