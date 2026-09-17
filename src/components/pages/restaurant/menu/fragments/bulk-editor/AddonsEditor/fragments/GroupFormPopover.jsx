import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function GroupFormPopover({ children, initialData, onSubmit, items = [], open: controlledOpen, onOpenChange: setControlledOpen }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen || setInternalOpen;

    const [name, setName] = useState(initialData?.name || "");
    const [selectionType, setSelectionType] = useState(initialData?.selectionType || "multiple");
    const [minSelection, setMinSelection] = useState(initialData?.minSelection || 0);
    const [maxSelection, setMaxSelection] = useState(initialData?.maxSelection || "");
    
    // items is [{ item: ID, priceOverride: X }]
    const [selectedItems, setSelectedItems] = useState(() => {
        if (!initialData?.items || !Array.isArray(initialData.items)) return new Set();
        const ids = initialData.items
            .filter(i => i && i.item)
            .map(i => (typeof i.item === 'object' ? i.item._id : i.item))
            .filter(Boolean);
        return new Set(ids);
    });
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(i => i.name.toLowerCase().includes(q));
    }, [items, searchQuery]);

    const toggleItem = (itemId) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed && onSubmit) {
            setIsSubmitting(true);
            try {
                const itemsPayload = Array.from(selectedItems).map(id => {
                    const existing = initialData?.items?.find(i => {
                        if (!i || !i.item) return false;
                        const itemId = typeof i.item === 'object' ? i.item._id : i.item;
                        return itemId?.toString() === id?.toString();
                    });
                    return { item: id, priceOverride: existing?.priceOverride ?? null };
                });

                await onSubmit({ 
                    name: trimmed, 
                    selectionType,
                    minSelection: parseInt(minSelection) || 0,
                    maxSelection: maxSelection === "" ? null : parseInt(maxSelection),
                    items: itemsPayload
                });
                
                setOpen(false);
                if (!initialData) {
                    setName("");
                    setSelectionType("multiple");
                    setMinSelection(0);
                    setMaxSelection("");
                    setSelectedItems(new Set());
                }
            } catch (error) {
                console.error("Submit error", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={children || (
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-md text-[13px] font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Group
                </Button>
            )} />
            <PopoverContent align="start" className="w-[360px] p-4 flex flex-col gap-4 shadow-xl border-slate-200" sideOffset={8}>
                <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900 text-[15px]">
                        {initialData ? "Edit Addon Group" : "Create Addon Group"}
                    </h4>
                    <p className="text-[12px] text-slate-500">
                        {initialData ? "Update group name and items." : "Create a group (e.g. Toppings) and map items to it."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <Input
                            placeholder="Group Name (e.g. Sauces)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-9"
                            autoFocus
                            required
                        />

                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectionType('multiple')}
                                className={cn("flex-1 text-[12px] font-semibold py-1.5 rounded-sm transition-all", selectionType === 'multiple' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            >
                                Multiple Select
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectionType('single')}
                                className={cn("flex-1 text-[12px] font-semibold py-1.5 rounded-sm transition-all", selectionType === 'single' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                            >
                                Single Select
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Min Select</label>
                                <Input type="number" min="0" value={minSelection} onChange={e => setMinSelection(e.target.value)} className="h-8 text-[13px]" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Max Select</label>
                                <Input type="number" min="0" placeholder="Unlimited" value={maxSelection} onChange={e => setMaxSelection(e.target.value)} className="h-8 text-[13px]" disabled={selectionType === 'single'} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden">
                        <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-slate-50">
                            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                            <input 
                                type="text"
                                placeholder="Search items to add..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
                            />
                            <div className="text-[11px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full ml-2">
                                {selectedItems.size} Selected
                            </div>
                        </div>
                        <div className="h-[160px] overflow-y-auto p-1.5 flex flex-col gap-0.5">
                            {filteredItems.map(item => {
                                const isSelected = selectedItems.has(item._id || item.id);
                                return (
                                    <div 
                                        key={item._id || item.id}
                                        onClick={() => toggleItem(item._id || item.id)}
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
                                        <div className="text-[12px] text-slate-400 ml-2">₹{item.base_price}</div>
                                    </div>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-[12px]">No items found.</div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
