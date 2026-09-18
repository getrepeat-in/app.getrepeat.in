import { useState, useRef } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { ItemImage } from "@/components/global/item-image";
import { UploadService } from "@/services/frontend/upload";
import useNotification from "@/store/hooks/useNotification";
import { Camera, Image as ImageIcon, Loader2, Upload, Trash2 } from "lucide-react";

export function ImageUploadCard({ item, categoryPath, updateItem, restaurantId, onCardClick }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const notification = useNotification();

    const hasImage = Boolean(item.image);
    const dietary = item?.dietaryType || "veg";

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
            className="group relative flex flex-col bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileInput} 
            />

            {/* Media Area */}
            <div className="relative w-full aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
                {hasImage ? (
                    <ItemImage 
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

                {/* Badges Top Bar */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
                    {/* Dietary indicator badge */}
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

                {/* Drag Overlay */}
                <div className={cn(
                    "absolute inset-0 bg-primary/90 text-primary-foreground backdrop-blur-xs flex flex-col items-center justify-center transition-all duration-150 z-20",
                    isDragging ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}>
                    <Camera className="size-7 mb-1.5 animate-bounce" />
                    <span className="font-semibold text-xs">Drop to upload</span>
                </div>

                {/* Hover Quick Action Overlay */}
                <div 
                    onClick={onCardClick}
                    className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 z-10 p-2 cursor-pointer"
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="flex size-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform active:scale-95 shadow-xs"
                        title="Upload from device"
                    >
                        <Upload className="size-4" />
                    </button>

                    {hasImage && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex size-8 items-center justify-center rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white backdrop-blur-md transition-transform active:scale-95 shadow-xs"
                            title="Remove photo"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center text-primary z-30">
                        <Loader2 className="size-7 animate-spin mb-1.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Uploading...</span>
                    </div>
                )}
            </div>

            <div className="px-3.5 py-2.5 flex flex-col justify-center bg-card cursor-pointer" onClick={onCardClick}>
                <h3 className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight" title={item.name}>
                    {item.name}
                </h3>
                <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground truncate" title={categoryPath}>
                        {categoryPath || "Menu Item"}
                    </span>
                    <span className="font-bold text-foreground shrink-0 text-xs">
                        ₹{item.base_price || item.price || 0}
                    </span>
                </div>
            </div>
        </div>
    );
}

