"use client";
import { format } from "date-fns";
import { StaffFormSheet } from "./fragments";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import DataTable from "@/components/global/table";
import { useStaff } from "@/store/hooks/useStaff";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Plus, Edit2, Trash2, Users, RefreshCw } from "lucide-react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { STAFF_STATUS_FILTERS, DEFAULT_PAGE_SIZE, StaffProfileCell, StaffRoleBadge, StaffStatusBadge } from "./helpers";

export default function StaffManagement() {
    const { restaurantId } = useRestaurant();
    const { staffList, isLoading, error, deleteStaff, isDeleting, refetch } = useStaff(restaurantId);

    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsSheetOpen(true);
    };

    const handleEditStaff = (staff) => {
        setEditingStaff(staff);
        setIsSheetOpen(true);
    };

    const handleDelete = async () => {
        if (!staffToDelete) return;
        await deleteStaff(staffToDelete._id);
        setStaffToDelete(null);
    };

    const filterTabs = useMemo(() => 
        STAFF_STATUS_FILTERS.map(t => ({
            label: t.label,
            value: t.value
        })), []
    );

    const filteredStaff = useMemo(() => {
        if (!staffList) return [];
        let data = staffList;
        if (statusFilter && statusFilter !== "all") {
            data = data.filter((s) => s.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((s) => 
                s.name?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q) ||
                s.phone?.includes(q) ||
                s.role?.name?.toLowerCase().includes(q)
            );
        }
        return data;
    }, [staffList, statusFilter, searchQuery]);

    const columns = useMemo(() => [
        {
            header: "Profile",
            key: "name",
            sortable: true,
            render: (staff) => <StaffProfileCell staff={staff} />
        },
        {
            header: "Role & Permissions",
            key: "role.name",
            render: (staff) => <StaffRoleBadge role={staff.role} />
        },
        {
            header: "Account Status",
            key: "status",
            align: "center",
            render: (staff) => <StaffStatusBadge status={staff.status} />
        },
        {
            header: "Joined",
            key: "createdAt",
            sortable: true,
            render: (staff) => (
                <div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {staff.createdAt ? format(new Date(staff.createdAt), "MMM dd, yyyy") : "-"}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                        {staff.createdAt ? format(new Date(staff.createdAt), "hh:mm a") : "-"}
                    </div>
                </div>
            )
        },
        {
            header: "Actions",
            key: "actions",
            align: "right",
            width: "80px",
            render: (staff) => (
                <div className="flex justify-end items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditStaff(staff);
                        }}
                        className="rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                        title="Edit Staff"
                    >
                        <Edit2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            setStaffToDelete(staff);
                        }}
                        className="rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-red-500"
                        title="Delete Staff"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
            <DataTable
                title="Staff Management"
                subtitle="Track user staff's activity, permissions and roles"
                columns={columns}
                data={filteredStaff}
                isLoading={isLoading}
                error={error}
                
                searchable
                searchPlaceholder="Search staff by name, email, phone..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}

                filterTabs={filterTabs}
                activeFilterTab={statusFilter}
                onFilterTabChange={setStatusFilter}

                actions={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <Button
                            onClick={handleAddStaff}
                            size="sm"
                            className="h-8.5 rounded-md bg-green-600 hover:bg-green-700 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add Staff</span>
                        </Button>

                        {refetch && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                                title="Refresh staff list"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline text-xs">Refresh</span>
                            </Button>
                        )}
                    </div>
                }

                pagination
                pageSize={DEFAULT_PAGE_SIZE}
                emptyState={{
                    title: "No Staff Found",
                    description: "You haven't added any staff members yet. Add them to manage their roles and access.",
                    icon: <Users size={28} className="text-gray-400 dark:text-zinc-600" />
                }}
            />

            <StaffFormSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setEditingStaff(null);
                }}
                staff={editingStaff}
            />

            <ConfirmDeleteAlert
                isOpen={!!staffToDelete}
                onClose={() => setStaffToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete Staff Member?"
                description={`Are you sure you want to permanently remove ${staffToDelete?.name}?`}
            />
        </div>
    );
}