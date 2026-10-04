import { Trash2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SUGGESTED_VARIANTS } from "../helper/constants";

export default function ItemVariants({ 
    variants, 
    addVariantGroup, 
    updateVariantGroup, 
    deleteVariantGroup, 
    addVariantOption, 
    updateVariantOption, 
    deleteVariantOption, 
    addSuggestedVariant 
}) {
    return (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            {variants.length > 0 ? (
                <div className="space-y-6">
                    {variants.map((group, gIdx) => (
                        <div key={gIdx} className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm relative group/variant">
                            <button
                                onClick={() => deleteVariantGroup(gIdx)}
                                className="absolute -top-3 -right-3 bg-white dark:bg-zinc-900 border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full p-1.5 shadow-sm opacity-0 group-hover/variant:opacity-100 transition-all focus:opacity-100"
                                title="Delete Variant Group"
                            >
                                <Trash2 size={14} />
                            </button>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                <div className="relative group/input flex-1 max-w-[240px]">
                                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition-colors">
                                            Variant Name
                                        </span>
                                    </div>
                                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-transparent">
                                        <Input
                                            type="text"
                                            value={group.property_name || ""}
                                            onChange={(e) => updateVariantGroup(gIdx, "property_name", e.target.value)}
                                            placeholder="e.g. Size, Customization"
                                            className="border-0 focus-visible:ring-0 shadow-none h-11 bg-transparent text-sm sm:text-base px-3 w-full font-semibold"
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => addVariantOption(gIdx)}
                                    className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 px-3 py-2 h-11 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Plus size={14} strokeWidth={3} /> Add Option
                                </button>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 pl-1">
                                    Options
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {(group.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-stretch bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all">
                                            <input
                                                type="text"
                                                value={opt.name || ""}
                                                onChange={(e) => updateVariantOption(gIdx, oIdx, "name", e.target.value)}
                                                placeholder="Name (e.g. Large)"
                                                className="text-sm font-semibold bg-transparent outline-none w-32 px-3 py-2"
                                            />
                                            <div className="flex items-center bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-gray-700 px-2">
                                                <span className="text-gray-400 text-xs font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    value={opt.price || ""}
                                                    onChange={(e) => updateVariantOption(gIdx, oIdx, "price", Number(e.target.value))}
                                                    placeholder="0"
                                                    className="text-sm font-semibold w-16 bg-transparent outline-none py-2 px-1"
                                                />
                                            </div>
                                            <button
                                                onClick={() => deleteVariantOption(gIdx, oIdx)}
                                                className="bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-gray-700 px-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
                                                title="Remove Option"
                                            >
                                                <X size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!group.options || group.options.length === 0) && (
                                        <div className="h-[42px] flex items-center px-3 text-sm text-gray-400 italic">No options added yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                        <button
                            onClick={addVariantGroup}
                            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                        >
                            <Plus size={16} strokeWidth={3} /> Add Another Variant
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Plus size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Item Variants</h4>
                            <p className="text-xs text-gray-500">Add size, customization, or add-ons</p>
                        </div>
                    </div>
                    <button
                        onClick={addVariantGroup}
                        className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md shadow-sm transition-colors whitespace-nowrap"
                    >
                        Add Variants
                    </button>
                </div>
            )}
            
            {variants.length === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick Add:</span>
                        {SUGGESTED_VARIANTS.map(sug => (
                            <button
                                key={sug.property_name}
                                onClick={() => addSuggestedVariant(sug)}
                                className="text-[11px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 hover:border-orange-300 hover:bg-orange-50 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm"
                            >
                                <Plus size={12} strokeWidth={2.5} className="text-orange-500" /> {sug.property_name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
