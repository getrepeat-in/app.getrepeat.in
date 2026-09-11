"use client";
import { format } from "date-fns";
import { UserFormSheet } from "./fragments";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import DataTable from "@/components/global/table";
import { useUsers } from "@/store/hooks/useUsers";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Plus, Edit2, Trash2, Users, RefreshCw } from "lucide-react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { USER_STATUS_FILTERS, DEFAULT_PAGE_SIZE, UserProfileCell, UserStatusBadge } from "./helpers";

export default function UserManagement() {
    const { restaurantId } = useRestaurant();
    const { userList, isLoading, error, deleteUser, isDeleting, refetch } = useUsers(restaurantId);

    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsSheetOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsSheetOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        await deleteUser(userToDelete._id);
        setUserToDelete(null);
    };

    const filterTabs = useMemo(() => 
        USER_STATUS_FILTERS.map(t => ({
            label: t.label,
            value: t.value
        })), []
    );

    const filteredUsers = useMemo(() => {
        if (!userList) return [];
        let data = userList;
        if (statusFilter && statusFilter !== "all") {
            data = data.filter((u) => u.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((u) => 
                u.name?.toLowerCase().includes(q) ||
                u.phone?.includes(q)
            );
        }
        return data;
    }, [userList, statusFilter, searchQuery]);

    const columns = useMemo(() => [
        {
            header: "Profile",
            key: "name",
            sortable: true,
            render: (user) => <UserProfileCell user={user} />
        },
        {
            header: "Account Status",
            key: "status",
            align: "center",
            render: (user) => <UserStatusBadge status={user.status} />
        },
        {
            header: "Joined",
            key: "createdAt",
            sortable: true,
            render: (user) => (
                <div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "-"}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                        {user.createdAt ? format(new Date(user.createdAt), "hh:mm a") : "-"}
                    </div>
                </div>
            )
        },
        {
            header: "Actions",
            key: "actions",
            align: "right",
            width: "80px",
            render: (user) => (
                <div className="flex justify-end items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                        }}
                        className="rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                        title="Edit Customer"
                    >
                        <Edit2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                        }}
                        className="rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-red-500"
                        title="Delete Customer"
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
                title="User Management"
                subtitle="Track and manage your restaurant's registered customers"
                columns={columns}
                data={filteredUsers}
                isLoading={isLoading}
                error={error}
                
                searchable
                searchPlaceholder="Search customers by name, phone..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}

                filterTabs={filterTabs}
                activeFilterTab={statusFilter}
                onFilterTabChange={setStatusFilter}

                actions={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <Button
                            onClick={handleAddUser}
                            size="sm"
                            className="h-8.5 rounded-md bg-green-600 hover:bg-green-700 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add Customer</span>
                        </Button>

                        {refetch && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                                title="Refresh customer list"
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
                    title: "No Users Found",
                    description: "You haven't got any registered customers yet.",
                    icon: <Users size={28} className="text-gray-400 dark:text-zinc-600" />
                }}
            />

            <UserFormSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setEditingUser(null);
                }}
                user={editingUser}
            />

            <ConfirmDeleteAlert
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete Customer?"
                description={`Are you sure you want to permanently remove ${userToDelete?.name}?`}
            />
        </div>
    );
}
