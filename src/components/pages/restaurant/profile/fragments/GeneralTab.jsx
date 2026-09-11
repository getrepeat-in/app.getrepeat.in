"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { getImageUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Store, Link2, Phone, Mail, Image as ImageIcon, Save, Loader2, Upload } from "lucide-react";

const GeneralTab = ({ generalData }) => {
  const { restaurantId } = useRestaurant();
  const notification = useNotification();

  console.log("generalData" , generalData)
  
  const { mutate, isPending } = useFormMutation({
    mutationFn: (data) => RestaurantService.updateRestaurant(restaurantId, data),
    queryKey: ["restaurant-details", restaurantId],
    invalidateKeys: [["restaurant-details", restaurantId], ["all-restaurants"]],
    extractUpdatedData: (response) => response?.data?.restaurant || response?.restaurant,
    successMessage: "General information updated successfully!"
  });

  const formik = useFormik({
    initialValues: {
      logo: generalData?.logo || "",
      name: generalData?.name || "",
      slug: generalData?.slug || "",
      domain: generalData?.domain || "",
      phone: generalData?.phone || "",
      email: generalData?.email || "",
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (!restaurantId) return;
      
      const payload = {
        ...values,
        logo: values.logo?._id || values.logo || null,
      };

      mutate(payload, {
        onSuccess: () => resetForm({ values }),
      });
    },
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "logo");

      const data = await UploadService.uploadFile(formData, restaurantId);
      formik.setFieldValue("logo", { 
        _id: data?.imageId || data?.data?.imageId, 
        original: { key: data?.key || data?.data?.key },
      });
      notification.success("Image uploaded successfully!");
    } catch (error) {
      notification.error(error?.response?.data?.message || error?.message || "Failed to upload image");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col">
      <div className="space-y-7">
        <div className="space-y-2.5">
          <label className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-zinc-400 ml-1">Restaurant Logo</label>
          <div className="flex items-center gap-5">
            {formik.values.logo ? (
              <div className="relative size-18 sm:size-20 rounded-md overflow-hidden border border-border/60 bg-muted shrink-0 shadow-2xs">
                <img src={getImageUrl(formik.values.logo, true, "thumbnail")} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="size-18 sm:size-20 rounded-md border border-dashed border-border/80 flex items-center justify-center bg-muted/20 shrink-0">
                <ImageIcon className="size-6 text-muted-foreground/40" />
              </div>
            )}
            <div className="flex-1">
              <label htmlFor="logo-upload" className={`inline-flex cursor-pointer h-10 items-center justify-center rounded-md border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-200 shadow-2xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/30 transition-all ${uploadingLogo ? 'opacity-70 pointer-events-none' : ''}`}>
                {uploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadingLogo ? "Uploading..." : "Upload new image"}
              </label>
              <input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoUpload} 
                disabled={uploadingLogo} 
              />
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">Recommended: Square image, max 2MB. JPG or PNG.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors">Restaurant Name</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Store className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              </div>
              <Input 
                id="name" 
                name="name"
                value={formik.values.name} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                required 
                placeholder="e.g. The Rustic Spoon" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors">Slug URL</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Link2 className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              </div>
              <Input 
                id="slug" 
                name="slug"
                value={formik.values.slug} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                required 
                placeholder="e.g. the-rustic-spoon" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors">Phone Number</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              </div>
              <Input 
                id="phone" 
                name="phone"
                value={formik.values.phone} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                required 
                placeholder="+91 9876543210" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors">Email Address</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              </div>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formik.values.email} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                required 
                placeholder="contact@therusticspoon.com" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group md:col-span-2">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-orange-600 transition-colors">Custom Domain</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Link2 className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              </div>
              <Input 
                id="domain" 
                name="domain"
                value={formik.values.domain} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                placeholder="e.g. therusticspoon.com" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
        <Button 
          type="submit" 
          disabled={isPending || !formik.dirty} 
          className="h-9 px-5 rounded-md font-semibold text-xs sm:text-sm shadow-2xs transition-all active:scale-[0.98] bg-orange-600 hover:bg-orange-700 text-white gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Saving changes..." : "Save General Info"}
        </Button>
      </div>
    </form>
  );
};

export default GeneralTab;