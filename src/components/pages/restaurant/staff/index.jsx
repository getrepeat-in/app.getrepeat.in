"use client";
import { StaffFormSheet } from "./fragments";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/global/table";
import { useStaff } from "@/store/hooks/useStaff";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import React, { useState, useMemo, useCallback } from "react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { STAFF_STATUS_FILTERS, DEFAULT_PAGE_SIZE, STAFF_EMPTY_STATE, getStaffColumns } from "./helpers";

export default function StaffManagement() {
  const { restaurantId } = useRestaurant();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const { staffList, isLoading, error, deleteStaff, isDeleting, refetch } = useStaff(restaurantId, {
    status: statusFilter,
    search: searchQuery,
  });

  const handleAddStaff = useCallback(() => {
    setEditingStaff(null);
    setIsSheetOpen(true);
  }, []);

  const handleEditStaff = useCallback((staff) => {
    setEditingStaff(staff);
    setIsSheetOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!staffToDelete?._id) return;
    await deleteStaff(staffToDelete._id);
    setStaffToDelete(null);
  }, [staffToDelete, deleteStaff]);

  const columns = useMemo(
    () =>
      getStaffColumns({
        onEdit: handleEditStaff,
        onDelete: setStaffToDelete,
      }),
    [handleEditStaff]
  );

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
      <DataTable
        title="Staff Management"
        subtitle="Track staff activity, permissions and roles"
        columns={columns}
        data={staffList}
        isLoading={isLoading}
        error={error}
        searchable
        searchPlaceholder="Search staff by name, email, phone..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={STAFF_STATUS_FILTERS}
        activeFilterTab={statusFilter}
        onFilterTabChange={setStatusFilter}
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <Button
              onClick={handleAddStaff}
              size="sm"
              className="h-8.5 rounded-md bg-green-600 hover:bg-green-700 text-white shadow-2xs gap-1.5 font-semibold text-xs shrink-0 cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Staff</span>
            </Button>

            {refetch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0 cursor-pointer"
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
        emptyState={STAFF_EMPTY_STATE}
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