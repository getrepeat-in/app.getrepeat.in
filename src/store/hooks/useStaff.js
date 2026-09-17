import { useMemo } from "react";
import useNotification from "./useNotification";
import { StaffService } from "@/services/frontend/staff";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStaff = (resId, { status = "all", search = "", page, limit } = {}) => {
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { data: staffData, isLoading, error, refetch } = useQuery({
        queryKey: ["staff", resId, { status, search, page, limit }],
        queryFn: () => StaffService.getAll(resId, { status, search, page, limit }),
        enabled: !!resId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => StaffService.create(resId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["staff", resId] });
            notification.success(data?.message || "Staff member created successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to create staff member", { duration: 3000 });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ staffId, data }) => StaffService.update(resId, staffId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["staff", resId] });
            notification.success(data?.message || "Staff member updated successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to update staff member", { duration: 3000 });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (staffId) => StaffService.delete(resId, staffId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["staff", resId] });
            notification.success(data?.message || "Staff member deleted successfully", { duration: 3000 });
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to delete staff member", { duration: 3000 });
        },
    });

    const rawData = staffData?.data;
    const staffList = Array.isArray(rawData) ? rawData : rawData?.staffList || [];
    const totalCount = rawData?.totalCount ?? staffList.length;
    const totalPages = rawData?.totalPages ?? 1;

    return {
        staffList,
        totalCount,
        totalPages,
        page: rawData?.page,
        limit: rawData?.limit,
        isLoading,
        error,
        refetch,
        addStaff: createMutation.mutate,
        isAdding: createMutation.isPending,
        updateStaff: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteStaff: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
