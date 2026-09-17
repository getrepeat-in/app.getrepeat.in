import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GroupFormPopover } from "./GroupFormPopover";
import { Check, Edit2, Plus, Trash2, Layers, Search } from "lucide-react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";

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
            <div className="flex flex-col border-b border-gray-100">
                <div className="flex items-center justify-between px-6 py-4">
                    <h3 className="font-bold text-[16px] text-slate-900">1. Select Addon Groups</h3>
                    <div className="flex items-center gap-3">
                        <GroupFormPopover onSubmit={addGroup} items={items}>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-md text-[13px] font-semibold text-slate-700 border-gray-200">
                                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Group
                            </Button>
                        </GroupFormPopover>
                        <div className="bg-slate-100 text-slate-700 text-[12px] font-bold px-3 py-1.5 rounded-md">
                            {selectedGroups.length} Selected
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search addon groups..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 select-none space-y-2">
                {filteredGroups.map(group => {
                    const isSelected = selectedGroups.includes(group._id);
                    return (
                        <div key={group._id} className="flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                            <div className={cn("flex items-center group py-3 px-4 transition-colors", isSelected && "bg-slate-50")}>
                                <div className="flex items-center cursor-pointer" onClick={(e) => toggleSelection(group._id, e)}>
                                    <div className={cn(
                                        "w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center mr-3 shrink-0 transition-colors",
                                        isSelected ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 bg-white"
                                    )}>
                                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                </div>
                                
                                <Layers className="w-4 h-4 text-slate-500 mr-2 shrink-0" strokeWidth={2.5} />
                                <div className="flex-1">
                                    <div className="font-bold text-[14px] text-slate-900 truncate">{group.name}</div>
                                    <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">
                                        {group.selectionType} • Min: {group.minSelection} • Max: {group.maxSelection || 'Any'}
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                    <GroupFormPopover 
                                        initialData={group} 
                                        onSubmit={(data) => updateGroup({ groupId: group._id, data })}
                                        items={items}
                                    >
                                        <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </GroupFormPopover>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteAlert({ isOpen: true, id: group._id, name: group.name });
                                        }}
                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                                        title="Delete Group"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-50 border-t border-gray-100 px-4 py-2.5">
                                <div className="flex flex-wrap gap-1.5">
                                    {group.items?.filter(mapped => mapped?.item).map((mapped, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 text-slate-700 text-[11px] font-medium px-2 py-1 rounded-sm shadow-sm">
                                            {mapped.item?.name || 'Unknown'} {mapped.priceOverride !== null && mapped.priceOverride !== undefined ? <span className="text-primary font-bold ml-1">+₹{mapped.priceOverride}</span> : mapped.item?.base_price !== undefined ? <span className="text-slate-400 font-bold ml-1">+₹{mapped.item?.base_price}</span> : null}
                                        </div>
                                    ))}
                                    {(!group.items || group.items.length === 0 || group.items.every(m => !m?.item)) && (
                                        <span className="text-[12px] text-slate-400 italic">No items in this group.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredGroups.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-[14px]">No addon groups found.</div>
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
