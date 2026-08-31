"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Loader from "@/components/global/loader";
import { usePromotions } from "./hooks/usePromotions";
import PromotionsTable from "./fragments/PromotionsTable";
import useNotification from "@/store/hooks/useNotification";
import PromotionFormSheet from "./fragments/promotion-form-sheet";

export default function Promotions() {
    const { promotions, isLoading, createPromotion, updatePromotion, deletePromotion, isCreating, isUpdating, isDeleting } = usePromotions();
    const notification = useNotification();
    
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const handleCreate = () => {
        setEditingPromotion(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setIsSheetOpen(true);
    };

    const handleDelete = async (promotionId) => {
        try {
            await deletePromotion(promotionId);
            notification.success("Promotion deleted successfully");
        } catch (err) {
            console.error("Failed to delete", err);
            notification.error(err.message || "Failed to delete promotion");
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
        } catch (error) {
            console.error("Operation failed:", error);
            notification.error(error.message || "Operation failed");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] w-full bg-[#f8fafc] dark:bg-zinc-950 overflow-y-auto">
            <div className="mx-auto w-full p-2 md:p-4 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    
                    <div className="p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                            <div className="hidden md:block">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Promotions Management</h2>
                                <p className="text-sm text-gray-500 mt-1">Create and manage discount codes, automatic offers, and flash sales.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleCreate}
                                    className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 md:py-2 rounded-md font-semibold shadow-sm transition-all active:scale-95 text-sm w-full md:w-auto"
                                >
                                    <Plus size={18} strokeWidth={2.5} className="md:w-4 md:h-4" />
                                    Create Promotion
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="md:border border-gray-200 dark:border-zinc-800 rounded-md overflow-hidden bg-transparent md:bg-white md:dark:bg-zinc-900">
                            {isLoading ? (
                                <div className="flex items-center justify-center min-h-[300px] w-full">
                                    <Loader />
                                </div>
                            ) : (
                                <PromotionsTable 
                                    promotions={promotions}
                                    isLoading={isLoading}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isDeleting={isDeleting}
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            <PromotionFormSheet 
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                promotion={editingPromotion}
                onSubmit={handleSubmit}
                isSubmitting={isCreating || isUpdating}
            />
        </div>
    );
}