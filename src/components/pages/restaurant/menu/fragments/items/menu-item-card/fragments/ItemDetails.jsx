import ItemImageUpload from "./ItemImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ItemDetails({ item, updateField }) {
    const dietaryOptions = [
        { label: "VEG", value: "veg" },
        { label: "NON-VEG", value: "non-veg" },
        { label: "EGG", value: "egg" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-center mb-4">
                <ItemImageUpload item={item} updateField={updateField} />
            </div>
            
            <div className="space-y-5">
                <div className="relative group mt-2">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">
                            Item Name <span className="text-red-500">*</span>
                        </span>
                    </div>
                    <div className={`relative flex items-center border ${!item?.name?.trim() ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50`}>
                        <Input
                            id="name"
                            value={item?.name || ""}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="e.g. Grilled Club Veg Burger"
                            className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 w-full"
                        />
                    </div>
                </div>
                
                <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">
                            Base Price (₹) <span className="text-red-500">*</span>
                        </span>
                    </div>
                    <div className={`relative flex items-center border ${item?.base_price === "" || item?.base_price === null || item?.base_price === undefined ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50`}>
                        <Input
                            id="price"
                            type="number"
                            value={item?.base_price ?? ""}
                            onChange={(e) => updateField("base_price", e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="0"
                            className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Dietary Type</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateField("dietaryType", opt.value)}
                                className={`px-4 py-2 rounded-md border text-xs sm:text-sm font-semibold transition-all ${
                                    item?.dietaryType === opt.value
                                        ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-300 dark:hover:border-gray-700"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="relative group pt-2">
                    <div className="absolute -top-1 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">
                            Description
                        </span>
                    </div>
                    <div className="relative flex border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50">
                        <Textarea
                            id="description"
                            value={item?.description || ""}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Briefly describe the item (ingredients, preparation, etc.)"
                            rows={3}
                            className="border-0 focus-visible:ring-0 shadow-none bg-transparent resize-none font-medium text-sm sm:text-base px-3 py-3 w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}