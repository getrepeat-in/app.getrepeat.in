"use client";
import { useFormik } from "formik";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { MapPin, Building, Map, Hash, Globe, Compass, Save, Loader2 } from "lucide-react";

const LocationTab = ({ locationData }) => {
  console.log("locationData" , locationData)
  const { restaurantId } = useRestaurant();
  
  const { mutate, isPending } = useFormMutation({
    mutationFn: (data) => RestaurantService.updateRestaurant(restaurantId, data),
    queryKey: ["restaurant-details", restaurantId],
    invalidateKeys: [["restaurant-details", restaurantId]],
    extractUpdatedData: (response) => response?.data?.restaurant || response?.restaurant,
    successMessage: "Location information updated successfully!"
  });

  const formik = useFormik({
    initialValues: {
      street: locationData?.street || "",
      city: locationData?.city || "",
      state: locationData?.state || "",
      postalCode: locationData?.postalCode || "",
      country: locationData?.country || "IN",
      lat: locationData?.lat || "",
      long: locationData?.long || "",
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (!restaurantId) return;
      mutate({ address: values }, {
        onSuccess: () => resetForm({ values }),
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col">
      <div className="space-y-7">
        <div className="relative group">
          <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Street Address</span>
          </div>
          <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="pl-3.5 flex items-center pointer-events-none">
              <MapPin className="h-4.5 w-4.5 text-primary/90 shrink-0" />
            </div>
            <Input 
              id="street" 
              name="street"
              value={formik.values.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="123 Main Street, Phase 1" 
              className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">City</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Building className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="city" 
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Mumbai" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">State / Province</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Map className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="state" 
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Maharashtra" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Postal Code</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Hash className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="postalCode" 
                name="postalCode"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="400001" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Country</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Globe className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="country" 
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="IN" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Latitude</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Compass className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="lat" 
                name="lat"
                value={formik.values.lat}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="19.0760" 
                className="border-0 focus-visible:ring-0 shadow-none h-11.5 sm:h-12 bg-transparent text-sm sm:text-base px-3.5 w-full" 
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-2.5 left-3.5 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Longitude</span>
            </div>
            <div className="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Compass className="h-4.5 w-4.5 text-primary/90 shrink-0" />
              </div>
              <Input 
                id="long" 
                name="long"
                value={formik.values.long}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="72.8777" 
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
          className="h-9 px-5 rounded-md font-semibold text-xs sm:text-sm shadow-2xs transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Saving changes..." : "Save Location"}
        </Button>
      </div>
    </form>
  );
};

export default LocationTab;
