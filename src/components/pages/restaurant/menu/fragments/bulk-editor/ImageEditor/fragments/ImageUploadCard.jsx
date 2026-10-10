import { useState, useRef } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { ItemImage } from "@/components/global/item-image";
import { UploadService } from "@/services/frontend/upload";
import useNotification from "@/store/hooks/useNotification";
import { Camera, Image as ImageIcon, Loader2, Upload, Trash2 } from "lucide-react";

export function ImageUploadCard({ item, categoryPath, updateItem, restaurantId, onCardClick, isProcessing = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const notification = useNotification();

    const hasImage = Boolean(item.image);
    const dietary = item?.dietaryType || "veg";

    const handleCardClick = (e) => {
        if (isUploading || isProcessing) return;
        if (e?.target?.closest("button") || e?.target?.closest("input")) return;
        if (onCardClick) onCardClick();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const uploadFile = async (file) => {
        if (!file || !file.type.startsWith("image/")) {
            notification.error("Please upload a valid image file.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "menu/items");
            
            const res = await UploadService.uploadFile(formData, restaurantId);
            const imageId = res?.imageId || res?.data?.imageId;
            
            if (!imageId) throw new Error("Failed to get image ID from upload response");

            await updateItem({ itemId: item._id, data: { image: imageId } });
            notification.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            notification.error(error?.response?.data?.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async (e) => {
        e.stopPropagation();
        try {
            await updateItem({ itemId: item._id, data: { image: null } });
            notification.success("Image removed");
        } catch (error) {
            notification.error(error?.response?.data?.message || "Failed to remove image");
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (isUploading) return;
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleFileInput = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div 
            onClick={handleCardClick}
            className={cn(
                "group relative flex flex-col bg-card border rounded-md overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer select-none",
                isProcessing 
                    ? "border-primary ring-2 ring-primary/40 shadow-md" 
                    : "border-border/80 hover:border-primary/40"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onClick={(e) => e.stopPropagation()}
                onChange={handleFileInput} 
            />

            <div className="relative w-full aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
                {hasImage ? (
                    <ItemImage 
                        key={item.image?._id || item.image?.card || item.image?.original || (typeof item.image === "string" ? item.image : "img")}
                        src={getImageUrl(item.image, true, "card")} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground/50 gap-1.5 p-3">
                        <ImageIcon className="size-8 stroke-[1.4]" />
                        <span className="text-[11px] font-medium text-muted-foreground/70">No photo</span>
                    </div>
                )}

                <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
                    <div 
                        className={`size-4 rounded-[3px] border bg-background/90 backdrop-blur-md shadow-2xs flex items-center justify-center ${
                            dietary === "veg" ? "border-emerald-600" :
                            dietary === "non-veg" ? "border-rose-600" :
                            dietary === "egg" ? "border-amber-500" : "border-emerald-600"
                        }`}
                        title={dietary.toUpperCase()}
                    >
                        <div className={`size-1.5 rounded-full ${
                            dietary === "veg" ? "bg-emerald-600" :
                            dietary === "non-veg" ? "bg-rose-600" :
                            dietary === "egg" ? "bg-amber-500" : "bg-emerald-600"
                        }`} />
                    </div>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-90 shadow-sm cursor-pointer"
                        title="Upload from device"
                    >
                        <Upload className="size-3.5 sm:size-4" />
                    </button>

                    {hasImage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveImage(e);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="flex size-7 sm:size-7.5 items-center justify-center rounded-lg bg-rose-500/85 hover:bg-rose-600 text-white backdrop-blur-md transition-transform active:scale-90 shadow-sm cursor-pointer"
                            title="Remove photo"
                        >
                            <Trash2 className="size-3.5 sm:size-4" />
                        </button>
                    )}
                </div>

                <div className={cn(
                    "absolute inset-0 bg-primary/90 text-primary-foreground backdrop-blur-xs flex flex-col items-center justify-center transition-all duration-150 z-20",
                    isDragging ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}>
                    <Camera className="size-7 mb-1.5 animate-bounce" />
                    <span className="font-semibold text-xs">Drop to upload</span>
                </div>

                {(isUploading || isProcessing) && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center text-primary z-30">
                        <Loader2 className="size-7 animate-spin mb-1.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">
                            {isProcessing ? "Matching Photo..." : "Uploading..."}
                        </span>
                    </div>
                )}
            </div>

            <div className="px-3.5 py-2.5 flex flex-col justify-center bg-card">
                <h3 className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight" title={item.name}>
                    {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground truncate" title={categoryPath}>
                        {categoryPath || "Menu Item"}
                    </span>
                </div>
            </div>
        </div>
    );
}

