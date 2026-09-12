import { useState } from "react";
import { cn } from "@/lib/utils";
import { TreeCheckbox } from "./TreeCheckbox";
import { ChevronRight, ChevronDown } from "lucide-react";
import { groupItemsByCategory, getCategoryName } from "../helpers";

export function SelectItemsTree({ items = [], categories = [] }) {
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedCats, setSelectedCats] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

  const toggleCategory = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const itemsByCategory = groupItemsByCategory(items);

  const toggleCatSelect = (catId) => setSelectedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  const toggleItemSelect = (itemId) => setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));

  return (
    <div className="flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden p-3 py-4">
        {Object.entries(itemsByCategory).map(([catId, catItems]) => {
          const isExpanded = expandedCats[catId];
          const isCatSelected = selectedCats[catId];
          return (
            <div key={catId} className="flex flex-col">
              <div 
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer select-none" 
                onClick={() => toggleCategory(catId)}
              >
                <button className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-orange-400 text-primary/90 bg-white shrink-0">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={3} /> : <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>
                <TreeCheckbox checked={isCatSelected} onChange={() => toggleCatSelect(catId)} />
                <span className="font-extrabold text-[17px] text-[#1e293b]">{getCategoryName(catId, categories)}</span>
              </div>
              
              {isExpanded && (
                <div className="ml-5 border-l-[3px] border-slate-100 pl-4 py-2 flex flex-col gap-1">
                  {catItems.map((item) => {
                    const isItemSelected = isCatSelected || selectedItems[item.id];
                    return (
                      <div key={item.id} className="flex flex-col">
                        <div 
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer select-none",
                            isItemSelected ? "bg-slate-50" : "hover:bg-slate-50"
                          )}
                          onClick={() => toggleItemSelect(item.id)}
                        >
                          <TreeCheckbox checked={isItemSelected} onChange={() => toggleItemSelect(item.id)} />
                          <span className="font-bold text-[16px] text-[#334155]">{item.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
