 import { useInfiniteQuery } from "@tanstack/react-query";
import { FoodsnapService } from "@/services/frontend/foodsnap";

export function useFoodsnapImageSearch(query, { enabled = true, limit = 20 } = {}) {
  return useInfiniteQuery({
    queryKey: ["foodsnap", "images", query],
    queryFn: async ({ pageParam = 1 }) => {
      if (!query) return { data: [], nextCursor: undefined };
      const response = await FoodsnapService.searchImages({ query, page: pageParam, limit });
      
      const imagesArray = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);

      return {
        data: imagesArray,
        nextCursor: response.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!query,
    staleTime: 5 * 60 * 1000, 
  });
}
