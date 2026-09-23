"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/global/table";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "@/services/frontend/integration";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { RefreshCw, Unlink, ExternalLink, AlertTriangle } from "lucide-react";
import { DEFAULT_SOCIAL_PAGE_SIZE, SOCIAL_EMPTY_STATE } from "./helpers/constants";
import { InstagramConnectCard, InstagramIcon, SocialPostCard, MapItemsDialog } from "./fragments";

export default function SocialPage({ restaurantId: propRestaurantId }) {
  const { restaurantId: hookRestaurantId } = useRestaurant();
  const restaurantId = propRestaurantId || hookRestaurantId;
  const notification = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("all");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const igSuccess = searchParams.get("ig_success");
    const igError = searchParams.get("ig_error");

    if (igSuccess === "true") {
      notification.success("Instagram account connected successfully!", { duration: 4000 });
      queryClient.invalidateQueries({ queryKey: ["instagram-posts-mapped", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      router.replace(pathname);
    } else if (igError) {
      notification.error(`Failed to connect Instagram: ${decodeURIComponent(igError)}`, { duration: 5000 });
      router.replace(pathname);
    }
  }, [searchParams, notification, router, pathname, queryClient, restaurantId]);

  const { data, isLoading, isRefetching, isError, error: queryError, refetch } = useQuery({
    queryKey: ["instagram-posts-mapped", restaurantId],
    queryFn: () => integrationService.getInstagramMappedPosts(restaurantId),
    enabled: Boolean(restaurantId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isConnected = Boolean(data?.isConnected);
  const isExpired = Boolean(data?.isExpired);
  const username = data?.username;
  const posts = data?.posts || [];
  const metaError = data?.error;

  const handleConnect = useCallback(async () => {
    if (!restaurantId) {
      notification.error("Restaurant information not loaded yet.");
      return;
    }

    try {
      setIsConnecting(true);
      const authData = await integrationService.connectInstagram(restaurantId, "social");

      if (!authData?.success || !authData?.data?.url) {
        throw new Error(authData?.message || "Failed to initialize Instagram authorization");
      }

      window.location.href = authData.data.url;
    } catch (err) {
      console.error("Instagram Auth Error:", err);
      notification.error(err?.response?.data?.message || err.message || "Failed to start Instagram connection");
      setIsConnecting(false);
    }
  }, [restaurantId, notification]);

  const handleDisconnect = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setIsDisconnecting(true);
      const deleteData = await integrationService.disconnectInstagram(restaurantId);

      if (!deleteData?.success) {
        throw new Error(deleteData?.message || "Failed to disconnect Instagram");
      }

      notification.success(deleteData.message || "Instagram account disconnected");
      setShowDisconnectModal(false);
      queryClient.invalidateQueries({ queryKey: ["instagram-posts-mapped", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    } catch (err) {
      console.error("Instagram Disconnect Error:", err);
      notification.error(err?.response?.data?.message || err.message || "Failed to disconnect Instagram account");
    } finally {
      setIsDisconnecting(false);
    }
  }, [restaurantId, notification, queryClient]);

  const filteredPosts = useMemo(() => {
    if (!isConnected) return [];
    return posts.filter((post) => {
      const isMapped = Array.isArray(post.mappedItems) && post.mappedItems.length > 0;
      if (statusFilter === "mapped") return isMapped;
      if (statusFilter === "unmapped") return !isMapped;
      return true;
    });
  }, [posts, statusFilter, isConnected]);

  const filterTabs = useMemo(() => {
    if (!isConnected) return [];
    const mappedCount = posts.filter((p) => Array.isArray(p.mappedItems) && p.mappedItems.length > 0).length;
    const unmappedCount = posts.length - mappedCount;

    return [
      { value: "all", label: "All Posts", count: posts.length },
      { value: "mapped", label: "Mapped", count: mappedCount },
      { value: "unmapped", label: "Unmapped", count: unmappedCount },
    ];
  }, [posts, isConnected]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
      <DataTable
        title="Social Media & Instagram Feed"
        subtitle="Tag your Instagram reels and posts with menu items to make them shoppable"
        data={filteredPosts}
        isLoading={isLoading}
        error={queryError}
        filterTabs={filterTabs}
        activeFilterTab={statusFilter}
        onFilterTabChange={setStatusFilter}
        actions={
          isConnected ? (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 dark:bg-zinc-800 border border-border/50 text-xs font-semibold shrink-0">
                <div className="h-4 w-4 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <InstagramIcon className="h-3 w-3" />
                </div>
                <span className="text-gray-900 dark:text-zinc-100">@{username}</span>
                {username && (
                  <a
                    href={`https://instagram.com/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-pink-600 transition"
                    title="View Profile"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {isExpired && (
                <Badge variant="outline" className="border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] gap-1 py-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  Expired
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0 cursor-pointer"
                title="Refresh Instagram feed"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline text-xs">Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisconnectModal(true)}
                className="h-8.5 rounded-md border-red-200 dark:border-red-900/40 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs shadow-2xs gap-1.5 shrink-0 cursor-pointer"
                title="Disconnect account"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Disconnect</span>
              </Button>
            </div>
          ) : null
        }
        renderGrid={(paginatedPosts) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedPosts.map((post) => (
              <SocialPostCard
                key={post.id}
                post={post}
                onSelectPost={setSelectedPost}
              />
            ))}
          </div>
        )}
        pagination={isConnected && filteredPosts.length > 0}
        pageSize={DEFAULT_SOCIAL_PAGE_SIZE}
        emptyState={
          !isConnected ? (
            <InstagramConnectCard
              onConnect={handleConnect}
              isConnecting={isConnecting}
              isExpired={isExpired}
              error={metaError || (isError ? queryError?.message : null)}
            />
          ) : (
            SOCIAL_EMPTY_STATE
          )
        }
      />

      {selectedPost && (
        <MapItemsDialog
          isOpen={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          restaurantId={restaurantId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["instagram-posts-mapped", restaurantId] });
            setSelectedPost(null);
          }}
        />
      )}

      <ConfirmDeleteAlert
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnect}
        isDeleting={isDisconnecting}
        title="Disconnect Instagram Account?"
        description="Are you sure you want to disconnect your Instagram account? Your current item mappings will be preserved, but new posts will stop syncing until you reconnect."
      />
    </div>
  );
}
