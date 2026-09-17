"use client";
import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Film } from "lucide-react";

export function SocialPostCard({ post, onSelectPost }) {
  const isVideo = post.media_type === "VIDEO";
  const imageUrl = isVideo ? post.thumbnail_url : post.media_url;
  const mappedItems = post.mappedItems || [];
  const isMapped = mappedItems.length > 0;

  return (
    <div className="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-border/50 rounded-xl hover:border-border hover:shadow-xs transition duration-200 group">
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
        <div className="space-y-2">
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
}
