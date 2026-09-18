import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { NestedItemSelection } from "@/components/global/nested-item-selector";
import { CategoryFormPopover } from "../../../category-sidebar/fragments/category-form-popover";

export function SelectSources({ categories, items, selectedSources, setSelectedSources, addCategory, deleteCategory, deleteItem }) {
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, type: null, id: null, name: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteAlert.type === 'items') {
                await deleteItem(deleteAlert.id);
            } else {
                await deleteCategory(deleteAlert.id);
            }
            setDeleteAlert({ isOpen: false, type: null, id: null, name: null });
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const allItemIds = useMemo(() => items.map(i => String(i._id || i.id)), [items]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(i => i.name?.toLowerCase().includes(q));
    }, [items, searchQuery]);

    const flatSelectedItemIds = selectedSources.items.map(String);

    const handleToggleItem = (itemId) => {
        const id = String(itemId);
        setSelectedSources(prev => {
            const isSelected = prev.items.map(String).includes(id);
            return {
                ...prev,
                items: isSelected ? prev.items.filter(x => String(x) !== id) : [...prev.items, id]
            };
        });
    };

    const categoryItemMap = useMemo(() => {
        const map = {};
        const rootCats = categories.filter(c => !c.parentCategory);
        const subCats = categories.filter(c => !!c.parentCategory);

        rootCats.forEach(cat => {
            const catId = String(cat._id || cat.id);
            const catItems = items
                .filter(i => {
                    const iCat = String(i.category?._id || i.category?.id || i.category);
                    return iCat === catId && !i.subCategory;
                })
                .map(i => String(i._id || i.id));
            map[catId] = { type: 'categories', ids: catItems };
        });

        subCats.forEach(sub => {
            const subId = String(sub._id || sub.id);
            const subItems = items
                .filter(i => {
                    const iSub = String(i.subCategory?._id || i.subCategory?.id || i.subCategory);
                    return iSub === subId;
                })
                .map(i => String(i._id || i.id));
            map[subId] = { type: 'subcategories', ids: subItems };
        });

        return map;
    }, [categories, items]);

    const handleToggleCategory = (itemIds, isFullySelected) => {
        const key = itemIds.join(",");
        const matchedEntry = Object.entries(categoryItemMap).find(
            ([, v]) => v.ids.join(",") === key || 
            (itemIds.length > 0 && itemIds.every(id => v.ids.includes(String(id))))
        );

        if (matchedEntry) {
            const [catOrSubId, { type }] = matchedEntry;
            setSelectedSources(prev => {
                const arr = prev[type] || [];
                const isAlreadySelected = arr.map(String).includes(catOrSubId);
                return {
                    ...prev,
                    [type]: isAlreadySelected
                        ? arr.filter(x => String(x) !== catOrSubId)
                        : [...arr, catOrSubId]
                };
            });
        }

        setSelectedSources(prev => {
            const current = new Set(prev.items.map(String));
            if (isFullySelected) {
                itemIds.forEach(id => current.delete(String(id)));
            } else {
                itemIds.forEach(id => current.add(String(id)));
            }
            return { ...prev, items: Array.from(current) };
        });
    };

    const handleSelectAll = () => {
        setSelectedSources({
            categories: categories.filter(c => !c.parentCategory).map(c => String(c._id || c.id)),
            subcategories: categories.filter(c => !!c.parentCategory).map(c => String(c._id || c.id)),
            items: allItemIds,
        });
    };

    const handleClearAll = () => {
        setSelectedSources({ categories: [], subcategories: [], items: [] });
    };

    const totalSelectedCount = selectedSources.categories.length + selectedSources.subcategories.length + selectedSources.items.length;
    const isAllSelected = totalSelectedCount > 0 && flatSelectedItemIds.length === allItemIds.length;

    const getAlertTitle = () => deleteAlert.name ? `Delete ${deleteAlert.name}?` : "";
    const getAlertDescription = () => {
        if (deleteAlert.type === 'categories') return `This will permanently delete the category "${deleteAlert.name}" and all of its subcategories and items. This action cannot be undone.`;
        if (deleteAlert.type === 'subcategories') return `This will permanently delete the subcategory "${deleteAlert.name}" and all items inside it. This action cannot be undone.`;
        return `This will permanently delete the item "${deleteAlert.name}". This action cannot be undone.`;
    };

    return (
        <div className="w-1/2 h-full flex flex-col bg-white">
            <div className="flex flex-col border-b border-border/60">
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <h3 className="font-bold text-[15px] text-foreground">1. Select Sources</h3>
                    <div className="flex items-center gap-2">
                        <CategoryFormPopover onSubmit={addCategory}>
                            <Button variant="outline" size="sm" className="h-7 px-2.5 rounded-md text-[12px] font-semibold gap-1 border-border/70">
                                <Plus className="w-3 h-3" /> Add Category
                            </Button>
                        </CategoryFormPopover>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {totalSelectedCount} selected
                        </span>
                        <button
                            type="button"
                            onClick={isAllSelected ? handleClearAll : handleSelectAll}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                        >
                            {isAllSelected ? "Clear all" : "Select all"}
                        </button>
                    </div>
                </div>

                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-border/70 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 select-none">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        {searchQuery ? `No items match "${searchQuery}"` : "No categories found."}
                    </div>
                ) : (
                    <NestedItemSelection
                        items={filteredItems}
                        categories={categories}
                        selectedItems={flatSelectedItemIds}
                        onToggleItem={handleToggleItem}
                        onToggleCategory={handleToggleCategory}
                    />
                )}
            </div>

            <ConfirmDeleteAlert
                isOpen={deleteAlert.isOpen}
                onClose={() => !isDeleting && setDeleteAlert({ isOpen: false, type: null, id: null, name: null })}
                onConfirm={confirmDelete}
                title={getAlertTitle()}
                description={getAlertDescription()}
                isDeleting={isDeleting}
            />
        </div>
    );
}
