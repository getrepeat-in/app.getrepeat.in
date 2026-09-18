import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import Loader from "@/components/global/loader";
import { MenuService } from "@/services/frontend/menu";
import { useQueryClient } from "@tanstack/react-query";
import { useCategory } from "@/store/hooks/useCategory";
import { ManageGroups } from "./fragments/ManageGroups";
import { AssignAddons } from "./fragments/AssignAddons";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { useAddonGroup } from "@/store/hooks/useAddonGroup";

export function AddonsEditor() {
    const { restaurantId } = useRestaurant();
    const { rawCategories: categories = [], isLoading: isLoadingCats } = useCategory(restaurantId);
    const { items = [], isLoading: isLoadingItems } = useItem(restaurantId, { fetchAll: true });
    const { addonGroups, addGroup, updateGroup, deleteGroup, isLoading: isLoadingAddons } = useAddonGroup(restaurantId);
    
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [targetItems, setTargetItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    
    const notification = useNotification();
    const queryClient = useQueryClient();

    const handleClearSelection = () => {
        setSelectedGroups([]);
        setTargetItems([]);
    };

    const handleConfirmAssign = async (action) => {
        if (!restaurantId) return;
        
        if (selectedGroups.length === 0) {
            return notification.error("Please select at least one addon group to map.");
        }
        if (targetItems.length === 0) {
            return notification.error("Please select at least one target item.");
        }

        setIsSaving(true);
        try {
            await MenuService.bulkUpdateAddons(restaurantId, {
                action,
                itemIds: targetItems,
                addonGroupIds: selectedGroups
            });

            notification.success(`Addons ${action === 'remove' ? 'removed from' : 'mapped to'} items successfully!`);
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
            handleClearSelection();
            
        } catch (error) {
            console.error("Addons update error:", error);
            notification.error(error?.response?.data?.message || "Failed to update addons.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingCats || isLoadingItems || isLoadingAddons) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50/40 overflow-hidden font-sans">
            <div className="flex flex-1 overflow-hidden">
                <ManageGroups
                    addonGroups={addonGroups}
                    items={items}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                    addGroup={addGroup}
                    updateGroup={updateGroup}
                    deleteGroup={deleteGroup}
                />

                <div className="w-px bg-border/60 shrink-0 z-10" />

                <AssignAddons
                    categories={categories}
                    items={items}
                    targetItems={targetItems}
                    setTargetItems={setTargetItems}
                />
            </div>

            <div className="bg-white border-t border-border/60 px-6 py-3 shrink-0 flex items-center justify-between shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.06)] z-20">
                <div className="text-[13px] text-muted-foreground">
                    Map{" "}
                    <span className="font-bold text-foreground">{selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""}</span>
                    {" "}→{" "}
                    <span className="font-bold text-foreground">{targetItems.length} item{targetItems.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        disabled={isSaving || (selectedGroups.length === 0 && targetItems.length === 0)}
                        className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-md"
                    >
                        Clear
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmAssign('remove')}
                        disabled={isSaving || selectedGroups.length === 0 || targetItems.length === 0}
                        className="h-8 px-3 text-xs font-semibold rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 transition-all"
                    >
                        Remove from Items
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleConfirmAssign('add')}
                        disabled={isSaving || selectedGroups.length === 0 || targetItems.length === 0}
                        className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm flex items-center gap-1.5 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Map to Items
                    </Button>
                </div>
            </div>
        </div>
    );
}
