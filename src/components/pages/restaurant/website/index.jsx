"use client";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import BannerSection from "./fragments/BannerSection";
import OrderingSection from "./fragments/OrderingSection";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import SocialLinksSection from "./fragments/SocialLinksSection";
import { WebsiteConfigService } from "@/services/frontend/website-config";

const WebsiteConfigPage = () => {
  const { restaurantId } = useRestaurant();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["website-config", restaurantId],
    queryFn: () => WebsiteConfigService.getWebsiteConfig(restaurantId),
    enabled: !!restaurantId,
  });

  const configData = data?.data || data;

  const { mutate, isPending } = useFormMutation({
    mutationFn: (payload) => WebsiteConfigService.updateWebsiteConfig(restaurantId, payload),
    queryKey: ["website-config", restaurantId],
    invalidateKeys: [["website-config", restaurantId]],
    extractUpdatedData: (response) => response?.data || response,
    successMessage: "Website configuration saved successfully!"
  });

  const formik = useFormik({
    initialValues: {
      homepage: {
        banners: {
          isEnabled: configData?.homepage?.banners?.isEnabled ?? true,
          items: configData?.homepage?.banners?.items || [],
        },
      },
      socialLinks: {
        facebook: configData?.socialLinks?.facebook || "",
        instagram: configData?.socialLinks?.instagram || "",
        twitter: configData?.socialLinks?.twitter || "",
      },
      ordering: {
        acceptedTypes: configData?.ordering?.acceptedTypes || ["DINE_IN", "TAKEAWAY", "DELIVERY"],
        paymentMethods: configData?.ordering?.paymentMethods || ["CASH", "ONLINE"],
        packingCharges: {
          isEnabled: configData?.ordering?.packingCharges?.isEnabled ?? false,
          amount: configData?.ordering?.packingCharges?.amount ?? 0
        },
        platformFee: {
          isEnabled: configData?.ordering?.platformFee?.isEnabled ?? false,
          amount: configData?.ordering?.platformFee?.amount ?? 0
        },
        taxAndServiceFee: {
          isEnabled: configData?.ordering?.taxAndServiceFee?.isEnabled ?? false,
          amount: configData?.ordering?.taxAndServiceFee?.amount ?? 0
        }
      },
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (!restaurantId) return;

      const payload = {
        homepage: {
          ...configData?.homepage,
          banners: {
            isEnabled: values.homepage.banners.isEnabled,
            items: values.homepage.banners.items.map(b => ({
               ...b,
               image: b.image?._id || b.image,
            }))
          }
        },
        socialLinks: values.socialLinks,
        ordering: values.ordering,
      };

      mutate(payload, {
        onSuccess: () => resetForm({ values }),
      });
    },
  });

  if (!isMounted || isLoading) {
    return (
      <div className="flex-1 w-full max-w-[1400px] mx-auto bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
        <div className="p-3 md:p-4 space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/40 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      <div className="p-3 md:p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Website Configuration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your storefront banners and social links.</p>
          </div>
          
          <Button 
            onClick={formik.handleSubmit}
            disabled={isPending || !formik.dirty} 
            className="h-11 px-8 rounded-md font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/40 shadow-sm p-5 md:p-8 space-y-12">
          <BannerSection formik={formik} />
          <OrderingSection formik={formik} />
          <SocialLinksSection formik={formik} />
        </div>
      </div>
    </div>
  );
};

export default WebsiteConfigPage;
