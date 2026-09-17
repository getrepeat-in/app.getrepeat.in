"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "./InstagramIcon";
import React, { useState, useMemo } from "react";
import { Search, Link2, ExternalLink, Film, RefreshCw } from "lucide-react";

export function SocialPostsGrid({ posts = [], onSelectPost, onRefresh, isRefreshing, username }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const caption = post.caption || "";
      const matchesSearch = !searchQuery.trim() || caption.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const isMapped = Array.isArray(post.mappedItems) && post.mappedItems.length > 0;
      let matchesFilter = true;
      if (activeFilter === "mapped") matchesFilter = isMapped;
      if (activeFilter === "unmapped") matchesFilter = !isMapped;

      return matchesSearch && matchesFilter;
    });
  }, [posts, searchQuery, activeFilter]);

  const mappedCount = useMemo(() => {
    return posts.filter((p) => Array.isArray(p.mappedItems) && p.mappedItems.length > 0).length;
  }, [posts]);

  const unmappedCount = posts.length - mappedCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-border/40 p-3 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by caption..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/30 dark:bg-zinc-800/40 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/40 dark:bg-zinc-800/50 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-2xs"
                : "text-muted-foreground hover:text-gray-900 dark:hover:text-zinc-100"
            }`}
          >
            All ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("mapped")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeFilter === "mapped"
                ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-400 shadow-2xs"
                : "text-muted-foreground hover:text-gray-900 dark:hover:text-zinc-100"
            }`}
          >
            Mapped ({mappedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("unmapped")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeFilter === "unmapped"
                ? "bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-2xs"
                : "text-muted-foreground hover:text-gray-900 dark:hover:text-zinc-100"
            }`}
          >
            Unmapped ({unmappedCount})
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border/60 bg-white/50 dark:bg-zinc-900/50 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <InstagramIcon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">
            {searchQuery || activeFilter !== "all" ? "No matching posts found" : "No posts found"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search query or filter to view other posts."
              : `No posts or reels found on your Instagram account (@${username || "connected"}).`}
          </p>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="mt-4 h-8 rounded-lg text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Instagram Feed</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPosts.map((post) => {
            const isVideo = post.media_type === "VIDEO";
            const imageUrl = isVideo ? post.thumbnail_url : post.media_url;
            const mappedItems = post.mappedItems || [];
            const isMapped = mappedItems.length > 0;

            return (
              <div
                key={post.id}
                className="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-border/50 rounded-xl hover:border-border hover:shadow-xs transition duration-200 group"
              >
                <div className="relative aspect-square w-full bg-muted/60 overflow-hidden shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={post.caption || "Instagram media"}
                      fill
                      className="object-cover group-hover:scale-103 transition duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                      {isVideo ? "Video Reel" : "Photo Post"}
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {isVideo && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold">
                        <Film className="h-3 w-3" />
                        Reel
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition"
                        title="View on Instagram"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5">
                    {isMapped ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-600/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                        {mappedItems.length} {mappedItems.length === 1 ? "Item" : "Items"} Tagged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium">
                        Not Tagged
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                      {post.caption || <span className="text-muted-foreground/60 italic">No caption provided</span>}
                    </p>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Mapped Dishes ({mappedItems.length}/3)
                      </p>
                      {isMapped ? (
                        <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden">
                          {mappedItems.map((item) => (
                            <Badge
                              key={item.id || item._id}
                              variant="secondary"
                              className="px-2 py-0.5 text-[11px] font-medium bg-muted/80 text-foreground border-border/40"
                            >
                              {item.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/70 italic">No menu items mapped yet</p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant={isMapped ? "outline" : "default"}
                    size="sm"
                    className={`w-full h-8 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs ${
                      !isMapped
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border-gray-200 dark:border-zinc-800 hover:bg-muted"
                    }`}
                    onClick={() => onSelectPost(post)}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    <span>{isMapped ? "Edit Tagged Items" : "Tag Menu Items"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
