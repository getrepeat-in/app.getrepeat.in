import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GroupFormPopover } from "./GroupFormPopover";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { Check, Edit2, Plus, Trash2, Layers, Search, X } from "lucide-react";

export function ManageGroups({ addonGroups, items, selectedGroups, setSelectedGroups, addGroup, updateGroup, deleteGroup }) {
    const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, id: null, name: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleSelection = (id, e) => {
        e.stopPropagation();
        setSelectedGroups(prev => {
            const isSelected = prev.includes(id);
            return isSelected ? prev.filter(x => x !== id) : [...prev, id];
        });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteGroup(deleteAlert.id);
            setDeleteAlert({ isOpen: false, id: null, name: null });
            setSelectedGroups(prev => prev.filter(x => x !== deleteAlert.id));
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredGroups = addonGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="w-1/2 h-full flex flex-col bg-white">
            <div className="flex flex-col border-b border-border/60">
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <h3 className="font-bold text-[15px] text-foreground">1. Select Addon Groups</h3>
                    <div className="flex items-center gap-2">
                        <GroupFormPopover onSubmit={addGroup} items={items}>
                            <Button variant="outline" size="sm" className="h-7 px-2.5 rounded-md text-[12px] font-semibold gap-1 border-border/70">
                                <Plus className="w-3 h-3" /> Add Group
                            </Button>
                        </GroupFormPopover>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {selectedGroups.length} selected
                        </span>
                    </div>
                </div>

                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search addon groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-border/70 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 select-none space-y-2">
                {filteredGroups.map(group => {
                    const isSelected = selectedGroups.includes(group._id);
                    return (
                        <div
                            key={group._id}
                            onClick={(e) => toggleSelection(group._id, e)}
                            className={cn(
                                "group flex flex-col rounded-xl border transition-all cursor-pointer overflow-hidden",
                                isSelected
                                    ? "border-primary/40 bg-primary/[0.03] shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                                    : "border-border/60 bg-white hover:border-border hover:shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-3 px-3.5 py-3">
                                <div className={cn(
                                    "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                                    isSelected
                                        ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                                        : "border-border/70 bg-background"
                                )}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                                </div>

                                <div className={cn(
                                    "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                    isSelected ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                                )}>
                                    <Layers className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={cn("font-semibold text-[13px] truncate", isSelected ? "text-primary" : "text-foreground")}>
                                        {group.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-medium mt-0.5 capitalize">
                                        {group.selectionType} · Min {group.minSelection} · Max {group.maxSelection || '∞'}
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <GroupFormPopover
                                        initialData={group}
                                        onSubmit={(data) => updateGroup({ groupId: group._id, data })}
                                        items={items}
                                    >
                                        <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-slate-100 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </GroupFormPopover>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteAlert({ isOpen: true, id: group._id, name: group.name });
                                        }}
                                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {group.items?.some(m => m?.item) && (
                                <div className={cn(
                                    "flex flex-wrap gap-1.5 px-3.5 py-2.5 border-t",
                                    isSelected ? "border-primary/20 bg-primary/[0.04]" : "border-border/40 bg-slate-50/60"
                                )}>
                                    {group.items.filter(m => m?.item).map((mapped, idx) => (
                                        <div key={idx} className="bg-white border border-border/50 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                                            {mapped.item?.name || 'Unknown'}
                                            {mapped.priceOverride != null
                                                ? <span className="text-primary font-bold">+₹{mapped.priceOverride}</span>
                                                : mapped.item?.base_price != null
                                                    ? <span className="text-slate-400">+₹{mapped.item.base_price}</span>
                                                    : null
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredGroups.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        {searchQuery ? `No groups match "${searchQuery}"` : "No addon groups found."}
                    </div>
                )}
            </div>

            <ConfirmDeleteAlert
                isOpen={deleteAlert.isOpen}
                onClose={() => !isDeleting && setDeleteAlert({ isOpen: false, id: null, name: null })}
                onConfirm={confirmDelete}
                title={deleteAlert.name ? `Delete ${deleteAlert.name}?` : ""}
                description={`This will permanently delete the addon group "${deleteAlert.name}" and remove it from any mapped items. This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </div>
    );
}
