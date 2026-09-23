import { useMemo } from "react";
import useNotification from "./useNotification";
import { MenuService } from "@/services/frontend/menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategory = (resId) => {
    const queryClient = useQueryClient();
    const notification = useNotification();

    const { data: categoryData , isLoading, error } = useQuery({
        queryKey: ["categories", resId],
        queryFn: () => MenuService.category.getAll(resId),
        enabled: !!resId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => MenuService.category.create(resId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", resId] });
            notification.success(data?.message || "Category created successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to create category");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ categoryId, data }) => MenuService.category.update(resId, categoryId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", resId] });
            notification.success(data?.message || "Category updated successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to update category");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (categoryId) => MenuService.category.delete(resId, categoryId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories", resId] });
            queryClient.invalidateQueries({ queryKey: ["items", resId] });
            notification.success(data?.message || "Category deleted successfully");
        },
        onError: (err) => {
            notification.error(err.response?.data?.message || err.message || "Failed to delete category");
        },
    });

    const rawCategories = categoryData?.data || [];

    const nestedCategories = useMemo(() => {
        if (!Array.isArray(rawCategories)) return [];
        
        const parentCats = rawCategories.filter(cat => !cat.parentCategory);
        const childCats = rawCategories.filter(cat => cat.parentCategory);
        
        return parentCats.map((cat) => ({
            id: cat._id,
            name: cat.name,
            image: cat.image,
            displayOrder: cat.displayOrder,
            raw: cat,
            subcategories: childCats
                .filter(sub => sub.parentCategory === cat._id)
                .map((sub) => ({
                    id: sub._id,
                    name: sub.name,
                    image: sub.image,
                    displayOrder: sub.displayOrder,
                    raw: sub,
                }))
        })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [rawCategories]);

    return {
        categories: nestedCategories,
        rawCategories,
        isLoading,
        error,
        addCategory: createMutation.mutateAsync,
        isAdding: createMutation.isPending,
        updateCategory: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteCategory: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    }; 
};