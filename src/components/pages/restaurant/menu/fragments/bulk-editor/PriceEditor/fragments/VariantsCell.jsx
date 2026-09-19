import { Trash2, Copy, X, Plus } from "lucide-react";

export function VariantsCell({ item, editor }) {
    const itemId = String(item.id || item._id);
    const currentVariants = editor.editedItems[itemId]?.variants || item.variants || [];
    const hasVariants = currentVariants.length > 0;
    const { copiedVariants } = editor;

    if (!hasVariants) {
        return (
            <div className="flex items-center gap-3 pt-1">
                <span className="text-[13px] font-medium font-sans text-gray-400 italic">No variants</span>
                <button 
                    onClick={() => editor.handleAddVariant(itemId, item.variants)}
                    className="h-7 text-[12px] font-semibold font-sans px-3 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-md transition-all flex items-center"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
                </button>
                {copiedVariants && (
                    <button 
                        onClick={() => editor.handlePasteVariants(itemId)}
                        className="h-7 text-[12px] font-semibold font-sans px-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-md transition-all flex items-center"
                    >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Paste Variants
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="pt-1 relative group transition-colors font-sans">
            <div className="absolute top-3 right-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => editor.handleCopyVariants(currentVariants)}
                    className="flex items-center text-[11px] font-medium font-sans text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Variants
                </button>
                {copiedVariants && (
                    <button 
                        onClick={() => editor.handlePasteVariants(itemId)}
                        className="flex items-center text-[11px] font-medium font-sans text-primary hover:text-primary/80 transition-colors"
                    >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Paste
                    </button>
                )}
                <button 
                    onClick={() => editor.handleRemoveAllVariants(itemId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            {currentVariants.map((variant, vIndex) => (
                <div key={vIndex} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-3 mb-2.5">
                        <input
                            type="text"
                            value={variant.property_name || ''}
                            placeholder="Group (e.g. Size)"
                            onChange={(e) => editor.handleVariantGroupNameChange(itemId, item.variants, vIndex, e.target.value)}
                            className="text-[14px] font-medium font-sans text-slate-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none min-w-[50px] [field-sizing:content] pb-0.5 transition-colors placeholder:text-gray-400 placeholder:font-medium"
                        />
                        <button 
                            onClick={() => editor.handleAddOption(itemId, item.variants, vIndex)}
                            className="flex items-center text-[12px] font-medium font-sans text-slate-800 hover:text-slate-600 transition-colors"
                        >
                            <Plus className="w-3 h-3 mr-0.5" /> Option
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {variant.options?.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 h-[34px]">
                                <input
                                    type="text"
                                    value={opt.name || ''}
                                    placeholder="Option name"
                                    onChange={(e) => editor.handleVariantOptionNameChange(itemId, item.variants, vIndex, oIndex, e.target.value)}
                                    className="px-3 h-full bg-transparent border-r border-gray-200 text-[13px] font-medium font-sans text-slate-600 outline-none min-w-[50px] [field-sizing:content]"
                                />
                                <div className="relative h-full">
                                    <input 
                                        type="number"
                                        value={editor.editedItems[itemId]?.variants?.[vIndex]?.options?.[oIndex]?.price ?? opt.price}
                                        onChange={(e) => editor.handleVariantPriceChange(itemId, item.variants, vIndex, oIndex, e.target.value)}
                                        className="text-[13px] font-semibold font-sans h-full px-3 outline-none bg-transparent text-slate-900 min-w-[50px] [field-sizing:content]"
                                    />
                                </div>
                                <button 
                                    onClick={() => editor.handleRemoveOption(itemId, item.variants, vIndex, oIndex)}
                                    className="px-2.5 h-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 border-l border-gray-200 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}