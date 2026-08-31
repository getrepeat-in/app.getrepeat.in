import { useRestaurant } from "@/store/hooks/useRestaurant";
import { PromotionsService } from "@/services/frontend/promotions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const usePromotions = (status = "") => {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();

  const queryKey = ["promotions", restaurantId, status];

  const { data: promotions, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => PromotionsService.getAll(restaurantId, status),
    enabled: !!restaurantId,
    select: (res) => res.data || [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => PromotionsService.create(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ promotionId, data }) => PromotionsService.update(restaurantId, promotionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (promotionId) => PromotionsService.delete(restaurantId, promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", restaurantId] });
    },
  });

  return {
    promotions,
    isLoading,
    isError,
    error,
    refetch,
    createPromotion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePromotion: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePromotion: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};