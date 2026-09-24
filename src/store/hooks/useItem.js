import useNotification from "./useNotification";
import { MenuService } from "@/services/frontend/menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useItem = (resId, filters = {}) => {
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { data: itemData, isLoading, error } = useQuery({
        queryKey: ["items", resId, filters],
        queryFn: () => MenuService.item.getAll(resId, filters),
        enabled: !!resId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => MenuService.item.create(resId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["items", resId] });
            notification.success(data?.message || "Item created successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to create item");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ itemId, data }) => MenuService.item.update(resId, itemId, data),
        onSuccess: (data) => {
            const updatedItem = data?.data;
            if (updatedItem?._id) {
                queryClient.setQueriesData({ queryKey: ["items", resId] }, (old) => {
                    if (!old) return old;
                    if (Array.isArray(old)) {
                        return old.map(d => (d._id === updatedItem._id ? updatedItem : d));
                    }
                    if (Array.isArray(old.data)) {
                        return {
                            ...old,
                            data: old.data.map(d => (d._id === updatedItem._id ? updatedItem : d))
                        };
                    }
                    return old;
                });
            }
            queryClient.invalidateQueries({ queryKey: ["items", resId] });
            notification.success(data?.message || "Item updated successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to update item");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (itemId) => MenuService.item.delete(resId, itemId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["items", resId] });
            notification.success(data?.message || "Item deleted successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to delete item");
        },
    });

    return {
        items: itemData?.data || [],
        isLoading,
        error,
        addItem: createMutation.mutateAsync,
        isAdding: createMutation.isPending,
        updateItem: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteItem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};
