import { useState, useRef } from "react";
import { getImageUrl } from "@/lib/utils";
import { Loader2, Camera, Trash2 } from "lucide-react";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { ItemImage } from "@/components/global/item-image";

export default function ItemImageUpload({ item, updateField }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { restaurantId } = useRestaurant();
    const notification = useNotification();
    const hasImage = Boolean(item?.image);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "menu/items");
            const res = await UploadService.uploadFile(formData, restaurantId);
            const imageId = res?.imageId || res?.data?.imageId;
            const key = res?.key || res?.data?.key;
            updateField("image", { _id: imageId, original: { key } });
        } catch (error) {
            notification.error(error?.response?.data?.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        updateField("image", null);
    };

    return (
        <div className="flex flex-col items-center shrink-0">
            <div 
                className="p-1 bg-primary/10 border-2 border-orange-100 rounded-xl cursor-pointer relative group/img transition-all hover:border-orange-300 shadow-xs hover:shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                title={hasImage ? "Change photo" : "Upload photo"}
            >
                <div className="h-20 w-20 rounded-lg overflow-hidden relative">
                    <ItemImage
                        src={getImageUrl(item?.image, true, "thumbnail")}
                        alt={item?.name || "Item"}
                        className="w-full h-full object-cover"
                    />

                    <div className={`absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center transition-all duration-200 gap-1.5 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`}>
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : hasImage ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="p-1.5 rounded-md bg-white/25 hover:bg-white/40 text-white transition-all hover:scale-110 active:scale-95 shadow-xs"
                                    title="Change image"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="p-1.5 rounded-md bg-rose-500/90 hover:bg-rose-600 text-white transition-all hover:scale-110 active:scale-95 shadow-xs"
                                    title="Remove photo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-0.5 text-white">
                                <Camera className="w-5 h-5" strokeWidth={2.2} />
                                <span className="text-[9px] font-bold tracking-wider">UPLOAD</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleUpload}
            />
        </div>
    );
}
