import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Gift, Loader2, Plus, Search, PenLine, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const genId = () => `custom_${Math.random().toString(36).slice(2, 9)}`;

export function GroupFormPopover({
    children,
    initialData,
    onSubmit,
    items = [],
    open: controlledOpen,
    onOpenChange: setControlledOpen
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open  = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen || setInternalOpen;

    const [name, setName]               = useState(initialData?.name || "");
    const [selectionType, setSelectionType] = useState(initialData?.selectionType || "multiple");
    const [minSelection, setMinSelection]   = useState(initialData?.minSelection ?? 0);
    const [maxSelection, setMaxSelection]   = useState(initialData?.maxSelection ?? "");

    const [tab, setTab] = useState("menu");
    const [itemsMap, setItemsMap] = useState(() => {
        const map = new Map();
        if (!initialData?.items) return map;
        for (const it of initialData.items) {
            const id = it._id || it.id || genId();
            map.set(String(id), {
                _id: String(id),
                name:        it.name        || "",
                description: it.description || "",
                price:       it.price       ?? 0,
                isFree:      it.isFree      ?? false,
                dietaryType: it.dietaryType || "veg",
                isCustom:    !it.menuItemId,
            });
        }
        return map;
    });

    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(i => i.name?.toLowerCase().includes(q));
    }, [items, searchQuery]);

    const toggleMenuItem = (menuItem) => {
        const id = String(menuItem._id || menuItem.id);
        setItemsMap(prev => {
            const next = new Map(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.set(id, {
                    _id: id,
                    name:        menuItem.name,
                    description: menuItem.description || "",
                    price:       menuItem.base_price ?? 0,
                    isFree:      false,
                    dietaryType: menuItem.dietaryType || "veg",
                    isCustom:    false,
                });
            }
            return next;
        });
    };

    // ── "Custom" tab state ──────────────────────────────────────────────────
    const [customName,  setCustomName]  = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const [customFree,  setCustomFree]  = useState(false);
    const [customDietaryType, setCustomDietaryType] = useState("veg");

    const addCustomItem = () => {
        const trimmed = customName.trim();
        if (!trimmed) return;
        const id = genId();
        setItemsMap(prev => new Map(prev).set(id, {
            _id:      id,
            name:     trimmed,
            description: "",
            price:    customFree ? 0 : (parseFloat(customPrice) || 0),
            isFree:   customFree,
            dietaryType: customDietaryType,
            isCustom: true,
        }));
        setCustomName("");
        setCustomPrice("");
        setCustomFree(false);
        setCustomDietaryType("veg");
    };

    const updateItemField = (id, field, value) => {
        setItemsMap(prev => {
            const next = new Map(prev);
            const existing = next.get(String(id));
            if (existing) next.set(String(id), { ...existing, [field]: value });
            return next;
        });
    };

    const removeItem = (id) => {
        setItemsMap(prev => {
            const next = new Map(prev);
            next.delete(String(id));
            return next;
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || !onSubmit) return;

        setIsSubmitting(true);
        try {
            const itemsPayload = Array.from(itemsMap.values()).map((snap, idx) => ({
                name:        snap.name,
                description: snap.description || "",
                price:       snap.isFree ? 0 : (parseFloat(snap.price) || 0),
                isFree:      snap.isFree,
                dietaryType: snap.dietaryType || "veg",
                displayOrder: idx,
            }));

            await onSubmit({
                name: trimmed,
                selectionType,
                minSelection: parseInt(minSelection) || 0,
                maxSelection: maxSelection === "" ? null : parseInt(maxSelection),
                items: itemsPayload,
            });

            setOpen(false);
            if (!initialData) {
                setName(""); setSelectionType("multiple");
                setMinSelection(0); setMaxSelection("");
                setItemsMap(new Map());
                setCustomName(""); setCustomPrice(""); setCustomFree(false); setCustomDietaryType("veg");
            }
        } catch (err) {
            console.error("Submit error", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedSnapshots = Array.from(itemsMap.values());

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={children || (
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-md text-[13px] font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Group
                </Button>
            )} />

            <PopoverContent align="start" className="w-[420px] p-4 flex flex-col gap-4 shadow-xl border-slate-200" sideOffset={8}>
                <div className="space-y-0.5">
                    <h4 className="font-semibold text-slate-900 text-[15px]">
                        {initialData ? "Edit Addon Group" : "Create Addon Group"}
                    </h4>
                    <p className="text-[12px] text-slate-500">
                        Add items from your menu or create custom addon options.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <Input
                            placeholder="Group Name (e.g. Sauces, Add-ons)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-9"
                            autoFocus
                            required
                        />

                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                            {["multiple", "single"].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setSelectionType(t)}
                                    className={cn(
                                        "flex-1 text-[12px] font-semibold py-1.5 rounded-sm transition-all capitalize",
                                        selectionType === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {t === "multiple" ? "Multiple Select" : "Single Select"}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Min Select</label>
                                <Input type="number" min="0" value={minSelection} onChange={e => setMinSelection(e.target.value)} className="h-8 text-[13px]" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Max Select</label>
                                <Input type="number" min="0" placeholder="Unlimited" value={maxSelection} onChange={e => setMaxSelection(e.target.value)} className="h-8 text-[13px]" disabled={selectionType === "single"} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTab("menu")}
                            className={cn(
                                "flex-1 text-[12px] font-semibold py-1.5 rounded-md transition-all",
                                tab === "menu" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            From Menu Items
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("custom")}
                            className={cn(
                                "flex-1 text-[12px] font-semibold py-1.5 rounded-md transition-all",
                                tab === "custom" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <PenLine className="w-3 h-3 inline-block mr-1" />
                            Custom Item
                        </button>
                    </div>

                    {tab === "menu" && (
                        <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden">
                            <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-slate-50">
                                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
                                />
                                <div className="text-[11px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full ml-2 shrink-0">
                                    {itemsMap.size} added
                                </div>
                            </div>
                            <div className="h-[150px] overflow-y-auto p-1.5 flex flex-col gap-0.5">
                                {filteredItems.map(item => {
                                    const id = String(item._id || item.id);
                                    const isSelected = itemsMap.has(id);
                                    return (
                                        <div
                                            key={id}
                                            onClick={() => toggleMenuItem(item)}
                                            className={cn(
                                                "flex items-center py-2 px-2.5 rounded-md cursor-pointer transition-colors text-[13px] font-medium",
                                                isSelected ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-slate-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-[4px] border flex items-center justify-center mr-3 shrink-0 transition-colors",
                                                isSelected ? "bg-primary border-primary text-white" : "border-slate-300 bg-white"
                                            )}>
                                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                            </div>
                                            <div className="flex-1 truncate">{item.name}</div>
                                            <div className="text-[12px] text-slate-400 ml-2 shrink-0">₹{item.base_price}</div>
                                        </div>
                                    );
                                })}
                                {filteredItems.length === 0 && (
                                    <div className="text-center py-6 text-slate-400 text-[12px]">No items found.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === "custom" && (
                        <div className="flex flex-col gap-2.5 border border-slate-200 rounded-md p-3 bg-slate-50/60">
                            <p className="text-[11px] text-slate-500">Add a custom addon option that doesn't exist in your menu.</p>
                            <Input
                                placeholder="Addon name (e.g. Extra Cheese)"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                className="h-8 text-[13px] bg-white"
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(); } }}
                            />
                            <div className="flex items-center gap-2">
                                <select
                                    value={customDietaryType}
                                    onChange={e => setCustomDietaryType(e.target.value)}
                                    className={cn(
                                        "h-8 px-2.5 pr-7 text-[12px] font-medium border border-slate-200 rounded-md outline-none bg-white shrink-0 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_8px_center] bg-no-repeat transition-colors",
                                        customDietaryType === "veg" ? "text-emerald-700 hover:border-emerald-200" :
                                        customDietaryType === "non-veg" ? "text-red-700 hover:border-red-200" :
                                        customDietaryType === "egg" ? "text-amber-700 hover:border-amber-200" :
                                        "text-emerald-800 hover:border-emerald-200"
                                    )}
                                >
                                    <option value="veg">Veg</option>
                                    <option value="non-veg">Non-veg</option>
                                    <option value="egg">Egg</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setCustomFree(f => !f)}
                                    className={cn(
                                        "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border transition-all shrink-0",
                                        customFree
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                                    )}
                                >
                                    <Gift className="w-3 h-3" /> Free
                                </button>
                                <div className="relative flex-1">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">₹</span>
                                    <input
                                        type="number" min="0" step="0.01"
                                        placeholder="Price"
                                        value={customPrice}
                                        disabled={customFree}
                                        onChange={e => setCustomPrice(e.target.value)}
                                        className={cn(
                                            "w-full pl-5 pr-2 py-1.5 text-[13px] border rounded-md outline-none transition-all",
                                            customFree
                                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                                : "bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                        )}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addCustomItem}
                                    disabled={!customName.trim()}
                                    className="h-8 px-3 text-[12px] shrink-0"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                            </div>
                        </div>
                    )}

                    {selectedSnapshots.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Addon Options ({selectedSnapshots.length})
                            </label>
                            <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1.5 pr-0.5">
                                {selectedSnapshots.map(snap => (
                                    <div key={snap._id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                        <span className={cn(
                                            "flex-1 text-[12px] font-medium truncate",
                                            snap.isCustom ? "text-violet-700" : "text-slate-700"
                                        )}>
                                            {snap.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => updateItemField(snap._id, "isFree", !snap.isFree)}
                                            className={cn(
                                                "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border transition-all shrink-0",
                                                snap.isFree
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                                            )}
                                        >
                                            <Gift className="w-3 h-3" />
                                        </button>
                                        <div className="relative w-20 shrink-0">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">₹</span>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={snap.price}
                                                disabled={snap.isFree}
                                                onChange={e => updateItemField(snap._id, "price", e.target.value)}
                                                className={cn(
                                                    "w-full pl-5 pr-2 py-1 text-[12px] border rounded-md outline-none transition-all",
                                                    snap.isFree
                                                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                                        : "bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                                )}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(snap._id)}
                                            className="text-slate-400 hover:text-destructive transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting} className="h-8">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting} className="h-8">
                            {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                            {initialData ? "Save Group" : "Create Group"}
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}
