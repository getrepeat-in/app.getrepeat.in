"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Search, ExternalLink } from "lucide-react";

const InstagramIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import api from "@/lib/api/axiosInstance";
import Image from "next/image";
import MapItemsDialog from "./fragments/map-items-dialog";

const fetchMappedPosts = async (restaurantId) => {
    const res = await api.get(`/api/restaurant/${restaurantId}/instagram/posts/mapped`);
    return res.data?.data || [];
};

export default function SocialPage({ restaurantId }) {
    const [selectedPost, setSelectedPost] = useState(null);

    const { data: posts, isLoading, isError, refetch } = useQuery({
        queryKey: ["instagram-posts-mapped", restaurantId],
        queryFn: () => fetchMappedPosts(restaurantId),
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                <p className="text-destructive font-medium">Failed to load Instagram posts.</p>
                <Button onClick={() => refetch()} variant="outline">Try Again</Button>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                <div className="bg-muted p-4 rounded-full">
                    <InstagramIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">No Posts Found</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                    Connect your Instagram account in the Settings &gt; Integrations tab to view your posts here.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Social Posts Mapping</h1>
                <p className="text-muted-foreground mt-1">
                    Map your Instagram posts and reels to specific menu items. These will be visible to customers when they browse your social feed in the app.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden flex flex-col">
                        <div className="relative aspect-square bg-muted">
                            {post.media_type === "VIDEO" ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                    {post.thumbnail_url ? (
                                        <Image
                                            src={post.thumbnail_url}
                                            alt={post.caption || "Video thumbnail"}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Video Post</span>
                                    )}
                                </div>
                            ) : (
                                <Image
                                    src={post.media_url}
                                    alt={post.caption || "Instagram post"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-sm">
                                <InstagramIcon className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <CardContent className="p-4 flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.caption || "No caption provided"}
                            </p>
                            
                            <div className="mt-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Mapped Items ({post.mappedItems?.length || 0})
                                </h4>
                                {post.mappedItems && post.mappedItems.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {post.mappedItems.map((item) => (
                                            <Badge key={item.id || item._id} variant="secondary" className="px-2 py-0.5">
                                                {item.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No items mapped yet.</p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 border-t flex items-center justify-between mt-auto bg-muted/20">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => setSelectedPost(post)}
                            >
                                <Link2 className="w-4 h-4 mr-2" />
                                {post.mappedItems?.length > 0 ? "Edit Mapping" : "Map Items"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {selectedPost && (
                <MapItemsDialog 
                    isOpen={!!selectedPost} 
                    onClose={() => setSelectedPost(null)}
                    post={selectedPost}
                    restaurantId={restaurantId}
                    onSuccess={() => {
                        refetch();
                        setSelectedPost(null);
                    }}
                />
            )}
        </div>
    );
}
