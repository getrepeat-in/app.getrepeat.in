import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import ItemImageUpload from "./ItemImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ItemDetails({ item, updateField, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete?.(item);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-3">
            <ItemImageUpload item={item} updateField={updateField} />
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 flex items-center gap-3">
                            <Select
                                value={item?.dietaryType || "veg"}
                                onValueChange={(val) => updateField("dietaryType", val)}
                            >
                                <SelectTrigger className={`w-fit h-7 text-[11px] font-bold rounded-md ${
                                    item?.dietaryType === "veg" ? "border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100" :
                                    item?.dietaryType === "non-veg" ? "border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100" :
                                    item?.dietaryType === "egg" ? "border-yellow-300 text-yellow-700 bg-yellow-50/50 hover:bg-yellow-100" :
                                    "border-green-300 text-green-700 bg-green-50/30 hover:bg-green-50"
                                }`}>
                                    <SelectValue placeholder="Select Diet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="veg" className="text-xs font-medium">VEG</SelectItem>
                                    <SelectItem value="non-veg" className="text-xs font-medium">NON-VEG</SelectItem>
                                    <SelectItem value="egg" className="text-xs font-medium">EGG</SelectItem>
                                    <SelectItem value="vegan" className="text-xs font-medium">VEGAN</SelectItem>
                                </SelectContent>
                            </Select>
                            <input
                                type="text"
                                value={item?.name || ""}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Item name"
                                className={`flex-1 font-semibold placeholder:text-gray-400 outline-none bg-transparent ${!item?.name?.trim() ? "border-b border-red-500 text-red-500" : "text-gray-800"}`}
                            />
                            {(item?.base_price === 0 || item?.price === 0) && (
                                <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm" title="Price cannot be 0">
                                    Price Missing
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                            <span className="text-gray-500">₹</span>
                            <input
                                type="number"
                                value={item?.base_price ?? ""}
                                onChange={(e) => updateField("base_price", e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="0"
                                className={`w-20 text-right outline-none bg-transparent ${item?.base_price === "" || item?.base_price === null || item?.base_price === undefined ? "border-b border-red-500 text-red-500" : "text-gray-800"}`}
                            />
                        </div>
                    </div>

                    <input
                        type="text"
                        value={item?.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Description"
                        className={`w-full text-sm placeholder:text-gray-400 outline-none bg-transparent ${!item?.description?.trim() ? "border-b border-red-500 text-red-500" : "text-gray-500"}`}
                    />
                </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent"
                    title="Delete Item"
                >
                    {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Trash2 size={16} />
                    )}
                </button>
            </div>
        </div>
    );
}
