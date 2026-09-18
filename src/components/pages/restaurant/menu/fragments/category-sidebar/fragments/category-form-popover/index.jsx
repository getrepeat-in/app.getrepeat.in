"use client";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadService } from "@/services/frontend/upload";
import { ItemImage } from "@/components/global/item-image";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CategoryFormPopover({ children, initialData, onSubmit, open: controlledOpen, onOpenChange: setControlledOpen }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen || setInternalOpen;

    const [name, setName] = useState(initialData?.name || "");
    const [image, setImage] = useState(initialData?.image || null);
    const [uploading, setUploading] = useState(false);
    const { restaurantId } = useRestaurant();
    const notification = useNotification();

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "menu/categories");
            const res = await UploadService.uploadFile(formData, restaurantId);
            const imageId = res?.imageId || res?.data?.imageId;
            const key = res?.key || res?.data?.key;
            setImage({ _id: imageId, original: { key } });
        } catch (error) {
            notification.error(error?.response?.data?.message || "Failed to upload image");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed && onSubmit) {
            setIsSubmitting(true);
            try {
                await onSubmit({ name: trimmed, image: image?._id || image || null });
                setOpen(false);
                if (!initialData) {
                    setName("");
                    setImage(null);
                }
            } catch (error) {
                console.error("Submit error", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger 
                render={children || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={initialData ? "Edit Category" : "Add Category"}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )} 
            />
            <PopoverContent align="start" className="w-80 p-4" sideOffset={8}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                            {initialData ? "Edit Category" : "Create New Category"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            {initialData 
                                ? "Update the category name and image."
                                : "Add a new category and upload an optional image for the menu."
                            }
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative size-14 rounded-lg border border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                                {image ? (
                                    <ItemImage src={getImageUrl(image, true, "thumbnail")} alt="Category" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="size-5 text-muted-foreground/40" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className={`text-xs font-medium cursor-pointer inline-flex items-center justify-center rounded border bg-white px-2.5 py-1.5 shadow-sm hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploading ? <Loader2 className="size-3 mr-1.5 animate-spin" /> : null}
                                    {uploading ? "Uploading..." : "Upload Image"}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <Input
                                placeholder="Category Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!name.trim() || uploading || isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save" : "Create"}
                        </Button>
                    </div>
                </form> 
            </PopoverContent>
        </Popover>
    );
}
