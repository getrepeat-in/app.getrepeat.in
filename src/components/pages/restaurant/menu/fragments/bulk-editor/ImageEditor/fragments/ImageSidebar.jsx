import { cn, getImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { Search, X, Sparkles, Loader2 } from "lucide-react";
import { UploadService } from "@/services/frontend/upload";
import useNotification from "@/store/hooks/useNotification";
import { FoodsnapService } from "@/services/frontend/foodsnap";
import { useEffect, useState, useRef, useCallback } from "react";
import { useFoodsnapImageSearch } from "@/store/hooks/useFoodsnapImageSearch";

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
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
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
        }, {
            rootMargin: "150px"
        });
        
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
                    "fixed inset-0 bg-black/30 z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />
            
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-[85vw] sm:w-[65vw] bg-white shadow-xl z-[110] flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="px-6 py-5 shrink-0 bg-white border-b border-gray-100 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pr-10">
                        <div className="text-left space-y-0.5">
                            <h2 className="text-[24px] font-[800] text-slate-900 tracking-tight">Image Suggestions</h2>
                            <p className="text-slate-500 font-medium text-[15px]">
                                For <span className="font-bold text-slate-900">{item?.name}</span>
                            </p>
                        </div>
                        {images.length > 0 && (
                            <Button
                                size="sm"
                                disabled={!!uploadingId}
                                onClick={() => handleSelectImage(images[0])}
                                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-3.5 rounded-xl shadow-xs cursor-pointer shrink-0"
                            >
                                {uploadingId === images[0]._id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="size-3.5" />
                                )}
                                Auto-Apply Best Match
                            </Button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for an item..."
                            className="pl-10 h-11 bg-white border-gray-200 rounded-xl shadow-sm text-[15px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6 bg-slate-50/30">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
                            <Loader />
                            <p className="font-medium text-sm">Searching for delicious images...</p>
                        </div>
                    )}

                    {!isLoading && images.length === 0 && (
                        <div className="text-center py-20 text-gray-400 font-medium">
                            No images found for "{debouncedQuery}"
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {images.map((img, index) => {
                            const isLast = images.length === index + 1;
                            const isUploadingThis = uploadingId === img._id;
                            
                            return (
                                <div 
                                    ref={isLast ? lastImageElementRef : null}
                                    key={img._id} 
                                    onClick={() => handleSelectImage(img)}
                                    className={cn(
                                        "group flex flex-col bg-white border border-gray-200/80 rounded-md overflow-hidden cursor-pointer",
                                        "shadow-sm hover:shadow-md transition-all duration-300",
                                        isUploadingThis && "opacity-80 pointer-events-none ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div className="relative w-full aspect-[4/3] bg-[#f8f9fa] overflow-hidden">
                                        <img 
                                            src={getImageUrl(img.image_url , true , "detail")} 
                                            alt={img.name || img.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {isUploadingThis && (
                                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-primary">
                                                <Loader />
                                                <span className="text-[11px] font-bold uppercase tracking-widest mt-1">Uploading...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2 flex flex-col bg-white">
                                        <h3 className="text-[11px] font-medium text-slate-800 truncate">
                                            {img.name || img.title}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isFetchingNextPage && (
                        <div className="py-8 flex justify-center text-primary">
                            <Loader />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
