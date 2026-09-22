import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { NestedItemSelection } from "@/components/global/nested-item-selector";

export function AssignAddons({ categories, items, targetItems, setTargetItems, addonGroups, onUnmapSingle, removingMappings }) {
    const [searchQuery, setSearchQuery] = useState("");

    const allItemIds = useMemo(() => items.map(i => String(i._id || i.id)), [items]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(i => i.name?.toLowerCase().includes(q));
    }, [items, searchQuery]);

    const handleToggleItem = (itemId) => {
        setTargetItems(prev =>
            prev.includes(itemId) ? prev.filter(x => x !== itemId) : [...prev, itemId]
        );
    };

    const handleToggleCategory = (itemIds, isFullySelected) => {
        setTargetItems(prev => {
            const next = new Set(prev);
            if (isFullySelected) {
                itemIds.forEach(id => next.delete(id));
            } else {
                itemIds.forEach(id => next.add(id));
            }
            return Array.from(next);
        });
    };

    const handleSelectAll = () => setTargetItems(allItemIds);
    const handleClearAll = () => setTargetItems([]);

    return (
        <div className="w-full lg:w-1/2 min-h-[500px] lg:min-h-0 h-auto lg:h-full flex flex-col bg-slate-50/60 border-t lg:border-t-0 lg:border-l border-border/60 shrink-0 lg:shrink">
            <div className="flex flex-col border-b border-border/60 bg-white">
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <h3 className="font-bold text-[15px] text-foreground">2. Select Target Items</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {targetItems.length} / {allItemIds.length}
                        </span>
                        <button
                            type="button"
                            onClick={targetItems.length === allItemIds.length ? handleClearAll : handleSelectAll}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                        >
                            {targetItems.length === allItemIds.length ? "Clear all" : "Select all"}
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
                        {searchQuery ? `No items match "${searchQuery}"` : "No menu items found."}
                    </div>
                ) : (
                    <NestedItemSelection
                        items={filteredItems}
                        categories={categories}
                        selectedItems={targetItems}
                        onToggleItem={handleToggleItem}
                        onToggleCategory={handleToggleCategory}
                        addonGroups={addonGroups}
                        onUnmapSingle={onUnmapSingle}
                        removingMappings={removingMappings}
                    />
                )}
            </div>
        </div>
    );
}
