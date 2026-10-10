"use client";
import { cn, getImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ItemImage } from "@/components/global/item-image";
import { UploadService } from "@/services/frontend/upload";
import useNotification from "@/store/hooks/useNotification";
import { FoodsnapService } from "@/services/frontend/foodsnap";
import { useEffect, useState, useRef, useCallback } from "react";
import { useFoodsnapImageSearch } from "@/store/hooks/useFoodsnapImageSearch";
import { Search, X, Loader2, Check, Image as ImageIcon } from "lucide-react";

export function ImageSidebar({ item, isOpen, onClose, onUploadComplete, restaurantId }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [uploadingId, setUploadingId] = useState(null);
    const notification = useNotification();
    const observer = useRef();

    useEffect(() => {
        if (item?.name) {
            setSearchQuery(item.name);
            setDebouncedQuery(item.name);
        }
    }, [item]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useFoodsnapImageSearch(debouncedQuery, { enabled: isOpen, limit: 12 });

    const images = data?.pages.flatMap(page => page.data) || [];

    const lastImageElementRef = useCallback(node => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, { rootMargin: "200px" });
        
        if (node) observer.current.observe(node);
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleSelectImage = async (image) => {
        if (uploadingId) return;
        
        try {
            setUploadingId(image._id);
            const file = await FoodsnapService.downloadImageAsFile(image.image_url, `${item.name}-image.jpeg`);
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "menu/items");
            
            const res = await UploadService.uploadFile(formData, restaurantId);
            const imageId = res?.imageId || res?.data?.imageId;
            
            if (!imageId) throw new Error("Failed to get image ID from upload response");
            await onUploadComplete(imageId);
            
            notification.success("Image successfully applied!");
            onClose();
        } catch (error) {
            notification.error("Failed to apply image. Please try again.");
            console.error(error);
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <>
            <div 
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />
            
            <div 
                className={cn(
                    "fixed z-[110] flex flex-col bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out",
                    "bottom-0 inset-x-0 w-full h-[88vh] max-h-[92vh] rounded-t-[28px] border-t border-border/40",
                    "sm:top-0 sm:right-0 sm:bottom-0 sm:inset-x-auto sm:h-full sm:max-h-none sm:w-[560px] md:w-[620px] lg:w-[680px] sm:rounded-none sm:rounded-l-2xl sm:border-t-0 sm:border-l sm:border-border/60",
                    isOpen 
                        ? "translate-y-0 sm:translate-x-0 sm:translate-y-0" 
                        : "translate-y-full sm:translate-x-full sm:translate-y-0"
                )}
            >
                <div 
                    onClick={onClose}
                    className="sm:hidden mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-zinc-700 shrink-0 cursor-pointer" 
                    title="Swipe down to close"
                />

                <div className="px-5 sm:px-6 pt-2 sm:pt-5 pb-3.5 shrink-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
                                Image Suggestions
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                                Choose matching photo for{" "}
                                <span className="font-bold text-primary dark:text-orange-400">
                                    {item?.name}
                                </span>
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="p-2 -mr-1 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative w-full mt-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search dish photos..."
                            className="pl-9.5 pr-8 h-10 w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm shadow-2xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")} 
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/50 min-h-0 overscroll-contain">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500 space-y-3">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="font-semibold text-xs sm:text-sm">Finding matching dishes...</p>
                        </div>
                    )}

                    {!isLoading && images.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500 space-y-2 text-center px-4">
                            <ImageIcon className="size-10 stroke-[1.5] text-gray-300 dark:text-zinc-600 mb-1" />
                            <p className="font-bold text-sm text-gray-700 dark:text-zinc-300">No photos found</p>
                            <p className="text-xs text-gray-400 max-w-xs">
                                Try searching with different keywords like "{item?.name?.split(" ")[0]}" or a broader category.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {images.map((img, index) => {
                            const isLast = images.length === index + 1;
                            const isUploadingThis = uploadingId === img._id;
                            
                            return (
                                <div 
                                    ref={isLast ? lastImageElementRef : null}
                                    key={img._id} 
                                    onClick={() => handleSelectImage(img)}
                                    className={cn(
                                        "group relative flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer",
                                        "shadow-2xs hover:shadow-md transition-all duration-200 active:scale-[0.98]",
                                        isUploadingThis && "opacity-80 pointer-events-none ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div className="relative w-full aspect-[4/3] bg-muted/30 overflow-hidden">
                                        <ItemImage 
                                            src={getImageUrl(img.image_url, true, "detail")} 
                                            alt={img.name || img.title || "Dish photo"} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <div className="px-3 py-1.5 rounded-lg bg-white/95 text-gray-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                                                <Check className="size-3.5 text-primary" />
                                                <span>Apply</span>
                                            </div>
                                        </div>

                                        {isUploadingThis && (
                                            <div className="absolute inset-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 text-primary">
                                                <Loader2 className="size-7 animate-spin mb-1 text-primary" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Applying...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2.5 flex flex-col bg-white dark:bg-zinc-900">
                                        <h3 className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate group-hover:text-primary transition-colors" title={img.name || img.title}>
                                            {img.name || img.title}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isFetchingNextPage && (
                        <div className="py-6 flex items-center justify-center text-primary gap-2">
                            <Loader2 className="size-5 animate-spin" />
                            <span className="text-xs font-medium text-muted-foreground">Loading more images...</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
