import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Check, Layers } from "lucide-react";

export const NestedItemSelection = ({ items, categories, selectedItems, onToggleItem, onToggleCategory }) => {
    const [expandedCats, setExpandedCats] = useState({});
    const [expandedSubCats, setExpandedSubCats] = useState({});

    const hierarchy = useMemo(() => {
        if (!categories || !items) return [];
        
        const catMap = {};
        categories.forEach(c => {
            if (!c.parentCategory) {
                const id = String(c._id);
                catMap[id] = { ...c, _id: id, subCategories: {}, items: [] };
            }
        });

        categories.forEach(c => {
            if (c.parentCategory) {
                const id = String(c._id);
                const parentId = String(typeof c.parentCategory === 'object' ? c.parentCategory._id || c.parentCategory : c.parentCategory);
                if (catMap[parentId]) {
                    catMap[parentId].subCategories[id] = { ...c, _id: id, items: [] };
                }
            }
        });

        let hasUncategorized = false;
        
        items.forEach(item => {
            const rawCatId = item.category?._id || item.category;
            const catId = rawCatId ? String(rawCatId) : null;
            
            const rawSubCatId = item.subCategory?._id || item.subCategory;
            const subCatId = rawSubCatId ? String(rawSubCatId) : null;

            if (catId && catMap[catId]) {
                if (subCatId && catMap[catId].subCategories[subCatId]) {
                    catMap[catId].subCategories[subCatId].items.push(item);
                } else if (subCatId) {
                    if (!catMap[catId].subCategories[subCatId]) {
                        catMap[catId].subCategories[subCatId] = { _id: subCatId, name: item.subCategory?.name || "Subcategory", items: [] };
                    }
                    catMap[catId].subCategories[subCatId].items.push(item);
                } else {
                    catMap[catId].items.push(item);
                }
            } else {
                if (!catMap['uncategorized']) {
                    catMap['uncategorized'] = { _id: 'uncategorized', name: 'Uncategorized Items', subCategories: {}, items: [] };
                }
                catMap['uncategorized'].items.push(item);
                hasUncategorized = true;
            }
        });

        return Object.values(catMap).filter(c => Object.keys(c.subCategories).length > 0 || c.items.length > 0);
    }, [categories, items]);

    const toggleCat = (id) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleSubCat = (id) => setExpandedSubCats(prev => ({ ...prev, [id]: !prev[id] }));

    const renderCheckbox = (isSelected, isIndeterminate) => (
        <div className={cn(
            "w-[16px] h-[16px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            isSelected ? "border-white bg-green-600 text-white dark:border-gray-200 dark:text-gray-200" : 
            isIndeterminate ? "border-slate-800 bg-transparent text-slate-800 dark:border-gray-200 dark:text-gray-200" : "border-slate-300 bg-transparent dark:border-zinc-700"
        )}>
            {isSelected && !isIndeterminate && <Check className="w-3 h-3" strokeWidth={3} />}
            {isIndeterminate && <div className="w-2 h-[2px] bg-slate-800 dark:bg-gray-200 rounded-full" />}
        </div>
    );

    return (
        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
            {hierarchy.map(cat => {
                const isCatExpanded = expandedCats[cat._id];
                const subCats = Object.values(cat.subCategories);
                
                const allItemsUnderCat = [
                    ...cat.items.map(i => i._id),
                    ...subCats.flatMap(sc => sc.items.map(i => i._id))
                ];
                const isCatFullySelected = allItemsUnderCat.length > 0 && allItemsUnderCat.every(id => selectedItems.includes(id));
                const isCatPartiallySelected = !isCatFullySelected && allItemsUnderCat.some(id => selectedItems.includes(id));

                return (
                    <div key={cat._id} className="border-b border-slate-200 dark:border-zinc-800 last:border-0 bg-white dark:bg-zinc-950 transition-all">
                        <div className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                            <div onClick={() => onToggleCategory(allItemsUnderCat, isCatFullySelected)}>
                                {renderCheckbox(isCatFullySelected, isCatPartiallySelected)}
                            </div>
                            <button type="button" onClick={() => toggleCat(cat._id)} className="flex items-center gap-2 flex-1 text-left focus:outline-none group">
                                <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                    {isCatExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                                <Layers className="w-4 h-4 text-slate-600 dark:text-gray-400" />
                                <span className="text-[15px] font-medium text-slate-900 dark:text-gray-100">{cat.name}</span>
                            </button>
                        </div>

                        {isCatExpanded && (
                            <div className="bg-white dark:bg-zinc-950">
                                {subCats.map(subCat => {
                                    const isSubCatExpanded = expandedSubCats[subCat._id];
                                    const subCatItems = subCat.items.map(i => i._id);
                                    const isSubCatFullySelected = subCatItems.length > 0 && subCatItems.every(id => selectedItems.includes(id));
                                    const isSubCatPartiallySelected = !isSubCatFullySelected && subCatItems.some(id => selectedItems.includes(id));

                                    return (
                                        <div key={subCat._id} className="border-t border-slate-100 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-3 py-3 pl-10 pr-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                                                <div onClick={() => onToggleCategory(subCatItems, isSubCatFullySelected)}>
                                                    {renderCheckbox(isSubCatFullySelected, isSubCatPartiallySelected)}
                                                </div>
                                                <button type="button" onClick={() => toggleSubCat(subCat._id)} className="flex items-center gap-2 flex-1 text-left focus:outline-none group">
                                                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        {isSubCatExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </div>
                                                    <span className={cn("text-[14px] font-medium", isSubCatFullySelected ? "text-primary" : "text-slate-700 dark:text-gray-200")}>{subCat.name}</span>
                                                </button>
                                            </div>

                                            {isSubCatExpanded && (
                                                <div className="pb-2 pt-1">
                                                    {subCat.items.map(item => {
                                                        const isSelected = selectedItems.includes(item._id);
                                                        return (
                                                            <div className="pl-14 pr-4 py-1.5" key={item._id}>
                                                                <div 
                                                                    onClick={() => onToggleItem(item._id)}
                                                                    className={cn(
                                                                        "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors group",
                                                                        isSelected ? "bg-slate-100 dark:bg-zinc-800" : "hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                                                                    )}
                                                                >
                                                                    {renderCheckbox(isSelected, false)}
                                                                    <span className={cn("text-[14px] truncate transition-colors", isSelected ? "text-slate-900 font-medium dark:text-white" : "text-slate-600 font-medium group-hover:text-slate-900 dark:text-gray-300 dark:group-hover:text-white")}>{item.name}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {cat.items.length > 0 && (
                                    <div className="pb-2 pt-1 border-t border-slate-100 dark:border-zinc-800/50">
                                        {cat.items.map(item => {
                                            const isSelected = selectedItems.includes(item._id);
                                            return (
                                                <div className="pl-14 pr-4 py-1.5" key={item._id}>
                                                    <div 
                                                        onClick={() => onToggleItem(item._id)}
                                                        className={cn(
                                                            "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors group",
                                                            isSelected ? "bg-slate-100 dark:bg-zinc-800" : "hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                                                        )}
                                                    >
                                                        {renderCheckbox(isSelected, false)}
                                                        <span className={cn("text-[14px] truncate transition-colors", isSelected ? "text-slate-900 font-medium dark:text-white" : "text-slate-600 font-medium group-hover:text-slate-900 dark:text-gray-300 dark:group-hover:text-white")}>{item.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            
            {hierarchy.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                    No items available to display.
                </div>
            )}
        </div>
    );
};
