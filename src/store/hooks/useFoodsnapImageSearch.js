 import { useInfiniteQuery } from "@tanstack/react-query";
import { FoodsnapService } from "@/services/frontend/foodsnap";

export function useFoodsnapImageSearch(query, { enabled = true, limit = 12 } = {}) {
  return useInfiniteQuery({
    queryKey: ["foodsnap", "images", query, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!query) return { data: [], nextCursor: undefined };
      const response = await FoodsnapService.searchImages({ query, page: pageParam, limit });
      
      const imagesArray = Array.isArray(response?.data) 
        ? response.data 
        : (response?.data?.data || []);

      const hasMore = response?.hasMore ?? (
        response?.pagination 
          ? Number(response.pagination.page) < Number(response.pagination.totalPages)
          : imagesArray.length >= Number(limit)
      );

      return {
        data: imagesArray,
        nextCursor: hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!query,
    staleTime: 5 * 60 * 1000, 
  });
}
