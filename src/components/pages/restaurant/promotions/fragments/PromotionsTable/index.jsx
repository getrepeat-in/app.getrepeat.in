"use client";
import { Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getPromotionsTableColumns } from "./helper/index";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { PromotionNameCell, PromotionTypeCell, PromotionStatusCell, PromotionActionsCell, PromotionDiscountCell, PromotionDateCell, PromotionUsageCell } from "./fragments/TableCells";

const PromotionCard = ({ promotion, onEdit, onDelete }) => (
    <div className="flex flex-col p-4 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
        <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
                <PromotionNameCell promotion={promotion} />
            </div>
            <div className="shrink-0">
                <PromotionActionsCell promotion={promotion} onEdit={onEdit} onDelete={onDelete} />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800">
            <PromotionTypeCell promotion={promotion} />
            <div className="text-right flex justify-end">
                <PromotionStatusCell promotion={promotion} />
            </div>
            <PromotionDiscountCell promotion={promotion} />
            <div className="text-right flex justify-end">
                <PromotionDateCell promotion={promotion} />
            </div>
            <PromotionUsageCell promotion={promotion} />
        </div>
    </div>
);

export default function PromotionsTable({ promotions, isLoading, error, onEdit, onDelete, isDeleting }) {
    const [promotionToDelete, setPromotionToDelete] = useState(null);

    const handleDelete = async () => {
        if (!promotionToDelete) return;
        await onDelete(promotionToDelete._id);
        setPromotionToDelete(null);
    };

    const emptyState = {
        title: "No Promotions Found",
        description: "You haven't created any promotions yet. Create one to offer discounts to your customers.",
        icon: <Tag size={24} className="text-gray-400" />
    };

    const columns = useMemo(() => getPromotionsTableColumns(onEdit, setPromotionToDelete), [onEdit]);

    return (
        <>
            <div className="hidden md:block">
                <DataTable 
                    columns={columns}
                    data={promotions}
                    isLoading={isLoading}
                    error={error}
                    emptyState={emptyState}
                />
            </div>
            
            <div className="md:hidden flex flex-col gap-3 p-1 pb-10">
                {promotions?.length > 0 ? (
                    promotions.map(promotion => (
                        <PromotionCard 
                            key={promotion._id} 
                            promotion={promotion} 
                            onEdit={onEdit} 
                            onDelete={setPromotionToDelete} 
                        />
                    ))
                ) : !isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                        {emptyState.icon}
                        <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">{emptyState.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{emptyState.description}</p>
                    </div>
                )}
            </div>
            <ConfirmDeleteAlert 
                isOpen={!!promotionToDelete}
                onClose={() => setPromotionToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete Promotion?"
                description={`Are you sure you want to permanently delete the promotion "${promotionToDelete?.name}"?`}
            />
        </>
    );
}
