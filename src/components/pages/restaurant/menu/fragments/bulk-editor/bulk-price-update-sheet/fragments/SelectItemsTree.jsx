import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { TreeCheckbox } from "./TreeCheckbox";
import { groupItemsByCategory, getCategoryName } from "../../helpers/utils";
import { ChevronRight, ChevronDown, Search, UtensilsCrossed } from "lucide-react";

export function SelectItemsTree({ 
  items = [], 
  categories = [],
  selectedCats = {},
  setSelectedCats,
  selectedItems = {},
  setSelectedItems
}) {
  const [expandedCats, setExpandedCats] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const itemsByCategory = useMemo(() => groupItemsByCategory(items), [items]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return itemsByCategory;

    const result = {};
    Object.entries(itemsByCategory).forEach(([catId, catItems]) => {
      const catName = getCategoryName(catId, categories).toLowerCase();
      const matchingItems = catItems.filter(item => 
        item.name?.toLowerCase().includes(q) || catName.includes(q)
      );

      if (matchingItems.length > 0) {
        result[catId] = matchingItems;
      }
    });
    return result;
  }, [itemsByCategory, searchQuery, categories]);

  const toggleCatSelect = (catId) => {
    const isSelected = !selectedCats[catId];
    setSelectedCats(prev => ({ ...prev, [catId]: isSelected }));
    
    const catItems = itemsByCategory[catId] || [];
    setSelectedItems(prev => {
      const updated = { ...prev };
      catItems.forEach(item => {
        updated[item.id] = isSelected;
      });
      return updated;
    });
  };

  const toggleItemSelect = (itemId) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <UtensilsCrossed className="size-3.5 text-primary" />
          <span>Select Items to Update</span>
        </label>
        {selectedCount > 0 && (
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {selectedCount} Selected
          </span>
        )}
      </div>

      <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
        <div className="p-2 border-b border-border/60 bg-muted/20">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter items by name..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-border/60 rounded-md placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="p-2 max-h-[260px] overflow-y-auto space-y-1">
          {Object.entries(filteredCategories).length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No matching items found
            </div>
          ) : (
            Object.entries(filteredCategories).map(([catId, catItems]) => {
              const isExpanded = expandedCats[catId] || Boolean(searchQuery.trim());
              const isCatSelected = selectedCats[catId];
              const catName = getCategoryName(catId, categories);
              const selectedInCat = catItems.filter(i => isCatSelected || selectedItems[i.id]).length;

              return (
                <div key={catId} className="flex flex-col rounded-lg border border-border/40 overflow-hidden bg-background/50">
                  <div 
                    className="flex items-center justify-between p-2 hover:bg-muted/40 transition-colors cursor-pointer select-none"
                    onClick={() => toggleCategory(catId)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button 
                        type="button"
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 size-5 rounded hover:bg-muted"
                      >
                        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      </button>
                      <TreeCheckbox checked={isCatSelected} onChange={() => toggleCatSelect(catId)} />
                      <span className="font-semibold text-xs text-foreground truncate">{catName}</span>
                    </div>

                    <span className="text-[10px] font-medium text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
                      {selectedInCat}/{catItems.length}
                    </span>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 pl-3 pr-2 py-1.5 border-l border-border/60 flex flex-col gap-1 bg-muted/10">
                      {catItems.map((item) => {
                        const isItemSelected = isCatSelected || selectedItems[item.id];
                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between p-1.5 rounded-md transition-all cursor-pointer select-none text-xs",
                              isItemSelected ? "bg-primary/10 text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => toggleItemSelect(item.id)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <TreeCheckbox checked={isItemSelected} onChange={() => toggleItemSelect(item.id)} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="text-[11px] font-bold text-foreground/80 shrink-0">
                              ₹{item.base_price || 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
