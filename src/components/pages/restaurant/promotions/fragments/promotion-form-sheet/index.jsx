"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import { BasicFields } from "./fragments/BasicFields";
import { Tag, Loader2, RefreshCcw } from "lucide-react";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { StatusSelection } from "./fragments/StatusSelection";
import { getInitialFormData, preparePayload } from "./helper";
import { NestedItemSelection } from "./fragments/NestedItemSelection";
import { PromotionTypeSelection } from "./fragments/PromotionTypeSelection";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function PromotionFormSheet({ isOpen, onClose, promotion, onSubmit, isSubmitting }) {
    const isEditMode = !!promotion;
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState("SELECT_TYPE");

    const { restaurantId } = useRestaurant();
    const { items, isLoading: itemsLoading } = useItem(restaurantId);
    const { rawCategories: categories, isLoading: categoriesLoading } = useCategory(restaurantId);

    const [formData, setFormData] = useState({
        type: "ITEM_DISCOUNT",
        name: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        items: [],
        status: "ACTIVE",
        starts_at: "",
        ends_at: "",
        usage_limit: "",
        per_user_limit: ""
    });

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        setFormData(getInitialFormData(promotion));
        if (isOpen) {
            setCurrentStep(promotion ? "FORM" : "SELECT_TYPE");
        }
    }, [promotion, isOpen]);

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, type: typeId }));
        setCurrentStep("FORM");
    };

    const handleBackToSelect = () => {
        setCurrentStep("SELECT_TYPE");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemToggle = (itemId) => {
        setFormData(prev => {
            const currentItems = prev.items || [];
            const newItems = currentItems.includes(itemId)
                ? currentItems.filter(id => id !== itemId)
                : [...currentItems, itemId];
            return { ...prev, items: newItems };
        });
    };

    const handleCategoryToggleList = (itemIds, isFullySelected) => {
        setFormData(prev => {
            const currentItems = new Set(prev.items || []);
            
            if (isFullySelected) {
                itemIds.forEach(id => currentItems.delete(id));
            } else {
                itemIds.forEach(id => currentItems.add(id));
            }
            
            return { ...prev, items: Array.from(currentItems) };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = preparePayload(formData);
        onSubmit(payload);
    };

    if (!isVisible && !isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md bg-[#f8fafc] dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-0 flex flex-col h-full shadow-2xl">
                <div className="flex-1 overflow-y-auto">
                    <SheetHeader className="px-6 py-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                        <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {!isEditMode && currentStep === "FORM" && (
                                <button 
                                    onClick={handleBackToSelect}
                                    className="p-1.5 -ml-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors mr-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                            )}
                            {isEditMode ? (
                                <>
                                    <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <RefreshCcw size={18} />
                                    </div>
                                    Update Promotion
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                        <Tag size={18} />
                                    </div>
                                    {currentStep === "SELECT_TYPE" ? "Select Promotion Type" : "Create Promotion"}
                                </>
                            )}
                        </SheetTitle>
                        <SheetDescription className="text-gray-500 mt-1">
                            {isEditMode 
                                ? "Modify details for this promotion." 
                                : currentStep === "SELECT_TYPE" 
                                    ? "Choose the type of promotion you want to offer." 
                                    : "Configure your discount rules and criteria."
                            }
                        </SheetDescription>
                    </SheetHeader>

                    <div className="p-6">
                        {currentStep === "SELECT_TYPE" ? (
                            <PromotionTypeSelection onSelect={handleTypeSelect} />
                        ) : (
                            <form id="promotion-form" onSubmit={handleSubmit} className="space-y-6">
                                <BasicFields 
                                    formData={formData} 
                                    handleChange={handleChange} 
                                    handleSelectChange={handleSelectChange} 
                                />

                                {(formData.type === "ITEM_DISCOUNT" || formData.type === "BESTSELLER") && (
                                    <div className="space-y-3">
                                        {itemsLoading || categoriesLoading ? (
                                            <div className="flex items-center justify-center py-10 text-gray-500">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            </div>
                                        ) : (
                                            <NestedItemSelection 
                                                items={items} 
                                                categories={categories} 
                                                selectedItems={formData.items || []}
                                                onToggleItem={handleItemToggle}
                                                onToggleCategory={handleCategoryToggleList}
                                            />
                                        )}
                                    </div>
                                )}

                                <StatusSelection 
                                    formData={formData} 
                                    handleSelectChange={handleSelectChange} 
                                />
                            </form>
                        )}
                    </div>
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 h-11 font-medium border-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button 
                            form={currentStep === "FORM" ? "promotion-form" : undefined}
                            onClick={currentStep === "SELECT_TYPE" ? () => document.querySelector('button[disabled=""]')?.focus() : undefined}
                            type={currentStep === "FORM" ? "submit" : "button"}
                            disabled={isSubmitting || currentStep === "SELECT_TYPE"}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? "Updating..." : "Creating..."}</>
                            ) : currentStep === "SELECT_TYPE" ? (
                                "Continue"
                            ) : (
                                <>{isEditMode ? "Save Changes" : "Create Promotion"}</>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
