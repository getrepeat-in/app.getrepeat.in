import useNotification from "./useNotification";
import { TableService } from "@/services/frontend/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTable = (resId) => {
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { data: tableData, isLoading, error, refetch } = useQuery({
        queryKey: ["tables", resId],
        queryFn: () => TableService.getAll(resId),
        enabled: !!resId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => TableService.create(resId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tables", resId] });
            notification.success(data?.message || "Table created successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to create table", { duration: 3000 });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ tableId, data }) => TableService.update(resId, tableId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tables", resId] });
            notification.success(data?.message || "Table updated successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to update table", { duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (tableId) => TableService.delete(resId, tableId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tables", resId] });
            notification.success(data?.message || "Table deleted successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to delete table", { duration: 3000 });
        },
    });

    const tables = tableData?.data?.tables || tableData?.data || [];

    return {
        tables,
        isLoading,
        error,
        refetch,
        addTable: createMutation.mutate,
        isAdding: createMutation.isPending,
        updateTable: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteTable: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
