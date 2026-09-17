"use client";
import { UserFormSheet } from "./fragments";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/global/table";
import { useUsers } from "@/store/hooks/useUsers";
import { useState, useMemo, useCallback } from "react";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { USER_STATUS_FILTERS, DEFAULT_PAGE_SIZE, USER_EMPTY_STATE, getUserColumns } from "./helpers";

export default function UserManagement() {
  const { restaurantId } = useRestaurant();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const { userList, isLoading, error, deleteUser, isDeleting, refetch } = useUsers(restaurantId, {
    status: statusFilter,
    search: searchQuery,
  });

  const handleAddUser = useCallback(() => {
    setEditingUser(null);
    setIsSheetOpen(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!userToDelete?._id) return;
    await deleteUser(userToDelete._id);
    setUserToDelete(null);
  }, [userToDelete, deleteUser]);

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: handleEditUser,
        onDelete: setUserToDelete,
      }),
    [handleEditUser]
  );

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
      <DataTable
        title="Customer Management"
        subtitle="Track and manage your restaurant's registered customers"
        columns={columns}
        data={userList}
        isLoading={isLoading}
        error={error}
        searchable
        searchPlaceholder="Search customers by name, phone..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={USER_STATUS_FILTERS}
        activeFilterTab={statusFilter}
        onFilterTabChange={setStatusFilter}
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <Button
              onClick={handleAddUser}
              size="sm"
              className="h-8.5 rounded-md bg-green-600 hover:bg-green-700 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0 cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Customer</span>
            </Button>

            {refetch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0 cursor-pointer"
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
        emptyState={USER_EMPTY_STATE}
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
