import useNotification from "./useNotification";
import { UserService } from "@/services/frontend/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUsers = (resId) => {
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { data: usersData, isLoading, error, refetch } = useQuery({
        queryKey: ["users", resId],
        queryFn: () => UserService.getAll(resId),
        enabled: !!resId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => UserService.create(resId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["users", resId] });
            notification.success(data?.message || "User created successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to create user", { duration: 3000 });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ userId, data }) => UserService.update(resId, userId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["users", resId] });
            notification.success(data?.message || "User updated successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to update user", { duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (userId) => UserService.delete(resId, userId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["users", resId] });
            notification.success(data?.message || "User deleted successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to delete user", { duration: 3000 });
        },
    });

    const rawUsers = usersData?.data || [];

    return {
        userList: rawUsers,
        isLoading,
        error,
        refetch,
        addUser: createMutation.mutate,
        isAdding: createMutation.isPending,
        updateUser: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteUser: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
