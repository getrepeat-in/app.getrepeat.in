"use client";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { Image as ImageIcon, Upload, Loader2, Trash2, Plus, Camera } from "lucide-react";

const BannerSection = ({ formik }) => {
  const { restaurantId } = useRestaurant();
  const notification = useNotification();
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadingNew, setUploadingNew] = useState(false);

  const banners = formik.values.homepage?.banners?.items || [];

  const handleAddNewBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNew(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "website/banners");

      const data = await UploadService.uploadFile(formData, restaurantId);
      
      const newBanner = {
        image: { 
          _id: data?.imageId || data?.data?.imageId, 
          original: { key: data?.key || data?.data?.key },
        },
        ctaLink: "",
        isActive: true,
      };

      formik.setFieldValue("homepage.banners.items", [...banners, newBanner]);
      notification.success("Banner uploaded successfully!");
    } catch (error) {
      notification.error(error?.response?.data?.message || error?.message || "Failed to upload image");
    } finally {
      setUploadingNew(false);
      e.target.value = "";
    }
  };

  const handleUpdateImage = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "website/banners");

      const data = await UploadService.uploadFile(formData, restaurantId);
      
      formik.setFieldValue(`homepage.banners.items[${index}].image`, { 
        _id: data?.imageId || data?.data?.imageId, 
        original: { key: data?.key || data?.data?.key },
      });
      notification.success("Banner updated successfully!");
    } catch (error) {
      notification.error(error?.response?.data?.message || error?.message || "Failed to update image");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  const handleRemoveBanner = (index) => {
    const updatedBanners = [...banners];
    updatedBanners.splice(index, 1);
    formik.setFieldValue("homepage.banners.items", updatedBanners);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            Homepage Banners
            <Switch 
              checked={formik.values.homepage?.banners?.isEnabled}
              onCheckedChange={(checked) => formik.setFieldValue("homepage.banners.isEnabled", checked)}
            />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add banners that will appear on the top of your digital storefront.</p>
        </div>
        <div>
          <label htmlFor="new-banner-upload" className={`inline-flex cursor-pointer h-10 items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-all ${uploadingNew ? 'opacity-70 pointer-events-none' : ''}`}>
            {uploadingNew ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {uploadingNew ? "Uploading..." : "Add Banner"}
          </label>
          <input 
            id="new-banner-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAddNewBanner} 
            disabled={uploadingNew} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-muted/20 border border-dashed rounded-xl">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">No banners added</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload an image to create your first banner.</p>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div key={index} className="relative flex flex-col gap-4 p-4 border border-border/50 rounded-xl bg-white dark:bg-zinc-900/30 shadow-sm transition-all hover:shadow-md">
              
              <button
                type="button"
                onClick={() => handleRemoveBanner(index)}
                className="absolute -top-3 -right-3 z-20 bg-white dark:bg-zinc-800 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full shadow border border-border/50 transition-all hover:scale-110"
                title="Remove Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-full">
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-border bg-muted relative group">
                  {banner.image ? (
                    <img 
                      src={getImageUrl(banner.image, true, "card")} 
                      alt={`Banner ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <ImageIcon className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <Camera className="w-8 h-8 text-white mb-2 opacity-80" strokeWidth={1.5} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-90">Change Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleUpdateImage(e, index)}
                        disabled={uploadingIndex === index}
                      />
                    </label>
                  </div>

                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2 text-white">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex flex-col gap-3 flex-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Banner Link (Optional)</label>
                  <Input 
                    name={`homepage.banners.items[${index}].ctaLink`}
                    value={banner.ctaLink} 
                    onChange={formik.handleChange} 
                    placeholder="e.g. /menu or https://example.com" 
                    className="h-10 text-sm" 
                  />
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BannerSection;
