import { Trash2, Plus, X } from "lucide-react";
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
        <div className="mt-2.5 pt-2.5 border-t border-dashed">
            {variants.length > 0 ? (
                <div className="space-y-3">
                    {variants.map((group, gIdx) => (
                        <div key={gIdx} className="bg-slate-50 border rounded-lg p-2.5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <input
                                    type="text"
                                    value={group.property_name || ""}
                                    onChange={(e) => updateVariantGroup(gIdx, "property_name", e.target.value)}
                                    placeholder="Property (e.g. Size)"
                                    className="text-[11px] font-bold bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary w-[140px] shadow-sm"
                                />
                                <button
                                    onClick={() => addVariantOption(gIdx)}
                                    className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={10} strokeWidth={3} /> Add Option
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={() => deleteVariantGroup(gIdx)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete Group"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(group.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-stretch bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                        <input
                                            type="text"
                                            value={opt.name || ""}
                                            onChange={(e) => updateVariantOption(gIdx, oIdx, "name", e.target.value)}
                                            placeholder="Option"
                                            className="text-[11px] font-semibold bg-transparent outline-none w-20 px-2 py-1"
                                        />
                                        <div className="flex items-center bg-gray-50 border-l border-r border-gray-100">
                                            <span className="text-gray-400 text-[10px] font-medium pl-1.5">₹</span>
                                            <input
                                                type="number"
                                                value={opt.price || ""}
                                                onChange={(e) => updateVariantOption(gIdx, oIdx, "price", Number(e.target.value))}
                                                placeholder="0"
                                                className="text-[11px] font-semibold w-12 bg-transparent outline-none py-1 px-1"
                                            />
                                        </div>
                                        <button
                                            onClick={() => deleteVariantOption(gIdx, oIdx)}
                                            className="bg-gray-50 px-1.5 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                                            title="Remove Option"
                                        >
                                            <X size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ))}
                                {(!group.options || group.options.length === 0) && (
                                    <span className="text-[10px] text-gray-400 italic py-1 px-1">No options yet</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {variants.length < 1 && (
                        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
                            <button
                                onClick={addVariantGroup}
                                className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                            >
                                <Plus size={12} strokeWidth={3} /> Add Custom
                            </button>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-2">Quick Add:</span>
                                {SUGGESTED_VARIANTS.map(sug => (
                                    <button
                                        key={sug.property_name}
                                        onClick={() => addSuggestedVariant(sug)}
                                        className="text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={10} /> {sug.property_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                        onClick={addVariantGroup}
                        className="text-[11px] font-bold text-gray-500 hover:text-primary hover:border-primary flex items-center gap-1.5 border border-dashed border-gray-300 rounded-md px-3 py-1.5 transition-colors"
                    >
                        <Plus size={12} strokeWidth={3} /> Add Variants
                    </button>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1">Suggestions:</span>
                        {SUGGESTED_VARIANTS.map(sug => (
                            <button
                                key={sug.property_name}
                                onClick={() => addSuggestedVariant(sug)}
                                className="text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                            >
                                <Plus size={10} /> {sug.property_name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
