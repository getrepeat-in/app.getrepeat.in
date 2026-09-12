import { useState, useRef } from "react";
import { getImageUrl } from "@/lib/utils";
import { Loader2, Camera } from "lucide-react";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { ItemImage } from "@/components/global/item-image";

export default function ItemImageUpload({ item, updateField }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { restaurantId } = useRestaurant();
    const notification = useNotification();

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

    return (
        <div className="flex flex-col items-center gap-2 shrink-0">
            <div 
                className="p-1 bg-primary/10 border-2 border-orange-100 rounded-xl cursor-pointer relative group/img transition-all hover:border-orange-300 shadow-sm hover:shadow-md"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
            >
                <div className="h-20 w-20 rounded-lg overflow-hidden relative">
                    <ItemImage
                        src={getImageUrl(item?.image, true, "thumbnail")}
                        alt={item?.name || "Item"}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity gap-1 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`}>
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <>
                                <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
                                <span className="text-[10px] font-bold text-white tracking-widest leading-none">UPLOAD</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {item?.image && !isUploading && (
                <button 
                    onClick={() => updateField("image", null)}
                    className="text-[10px] font-bold text-red-500 border-[1.5px] border-orange-300/60 bg-white rounded-md px-2 py-0.5 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors uppercase tracking-widest whitespace-nowrap"
                >
                    Remove Photo
                </button>
            )}

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
