import { cn } from "@/lib/utils";
import { useState } from "react";
import { Layers, ChevronDown, ChevronRight, CornerDownRight } from "lucide-react";

export function SelectDestination({ categories, targetDestination, setTargetDestination, selectedSources, standaloneItems = [] }) {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleExpand = (id, e) => {
        e.stopPropagation();
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const rootCategories = categories.filter(c => !c.parentCategory).sort((a,b) => a.displayOrder - b.displayOrder);
    
    const subCategoriesByParent = categories.reduce((acc, cat) => {
        if (cat.parentCategory) {
            if (!acc[cat.parentCategory]) acc[cat.parentCategory] = [];
            acc[cat.parentCategory].push(cat);
        }
        return acc;
    }, {});

    const renderSubCategoryNode = (sub) => {
        const isSelected = targetDestination?.id === sub._id && targetDestination?.type === 'subcategory';
        if (selectedSources.subcategories.includes(sub._id)) return null;

        return (
            <div 
                key={sub._id} 
                onClick={() => setTargetDestination({ id: sub._id, type: 'subcategory' })}
                className={cn(
                    "flex items-center group cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md ml-7 mr-4 transition-colors",
                    isSelected ? "bg-primary/5 ring-1 ring-primary/30" : ""
                )}
            >
                <CornerDownRight className={cn("w-4 h-4 mr-2", isSelected ? "text-primary" : "text-slate-400")} />
                <div className={cn("flex-1 font-medium text-[14px]", isSelected ? "text-primary font-bold" : "text-slate-600")}>{sub.name}</div>
            </div>
        );
    };

    const renderCategoryNode = (cat) => {
        const isSelected = targetDestination?.id === cat._id && targetDestination?.type === 'category';
        const isExpanded = expandedNodes.has(cat._id);
        const subs = subCategoriesByParent[cat._id] || [];
        
        // If this category is selected as a source to MOVE/MERGE, we don't allow it as a destination for itself
        const isSourceCategory = selectedSources.categories.includes(cat._id);
        if (isSourceCategory) return null;

        // If items are selected, main categories cannot be chosen as destinations.
        const hasItemsSelected = selectedSources.items.length > 0;
        const isDisabled = hasItemsSelected;

        return (
            <div key={cat._id} className="flex flex-col mb-1">
                <div 
                    onClick={() => {
                        if (!isDisabled) setTargetDestination({ id: cat._id, type: 'category' });
                    }}
                    className={cn(
                        "flex items-center group py-2.5 px-4 rounded-md transition-colors",
                        isDisabled ? "cursor-not-allowed opacity-60 bg-gray-50/50" : "cursor-pointer hover:bg-slate-50",
                        isSelected && !isDisabled ? "bg-primary/5 ring-1 ring-primary/30" : ""
                    )}
                >
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (subs.length > 0) toggleExpand(cat._id, e);
                        }} 
                        className={cn(
                            "w-6 h-6 flex items-center justify-center shrink-0 mr-1 transition-colors z-10 relative cursor-pointer",
                            isDisabled ? "text-slate-500 hover:text-slate-800 bg-white shadow-sm rounded border border-gray-200" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {subs.length > 0 ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4 h-4" />}
                    </button>
                    
                    <Layers className={cn("w-4 h-4 mr-2 shrink-0", isSelected && !isDisabled ? "text-primary" : "text-slate-400")} />
                    <div className={cn("flex-1 font-bold text-[15px] truncate", isSelected && !isDisabled ? "text-primary" : "text-slate-800")}>
                        {cat.name}
                        {isDisabled && <span className="ml-2 text-[11px] font-medium text-red-400 italic font-normal tracking-wide hidden group-hover:inline-block">(Select a subcategory below)</span>}
                    </div>
                </div>

                {isExpanded && subs.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                        {subs.map(renderSubCategoryNode)}
                    </div>
                )}
            </div>
        );
    };

    const totalItems = selectedSources.items.length;
    const standaloneCount = standaloneItems.length;
    const totalSub = selectedSources.subcategories.length;
    const totalCat = selectedSources.categories.length;
    let titleStr = "SELECT DESTINATION";
    if (totalItems > 0 || totalSub > 0 || totalCat > 0) {
        const parts = [];
        if (totalItems > 0) parts.push(`${totalItems} ITEMS`);
        if (totalSub > 0) parts.push(`${totalSub} SUBCATEGORIES`);
        if (totalCat > 0) parts.push(`${totalCat} CATEGORIES`);
        titleStr = `MOVE ${parts.join(', ')} TO:`;
    }

    return (
        <div className="w-1/2 h-full flex flex-col bg-white">
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[16px] text-slate-900">2. Select Destination</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 select-none">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
                    {titleStr}
                </h4>
            
                {(totalSub > 0 && standaloneCount === 0 && totalCat === 0) && (
                    <div 
                        onClick={() => setTargetDestination({ id: 'root', type: 'main' })}
                        className={cn(
                            "flex items-center cursor-pointer hover:bg-slate-50 py-3 px-4 rounded-md transition-colors border-2 border-dashed mb-4",
                            targetDestination?.type === 'main' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600"
                        )}
                    >
                        <Layers className="w-5 h-5 mr-3 shrink-0" />
                        <div className="flex-1 font-bold text-[14px]">Promote to Main Categories (Root)</div>
                    </div>
                )}

                {rootCategories.map(renderCategoryNode)}
            </div>
        </div>
    );
}
