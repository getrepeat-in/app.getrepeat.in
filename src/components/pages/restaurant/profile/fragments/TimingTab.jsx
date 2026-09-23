import { useFormik } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Save, Power, Loader2, Sunrise, Sunset, CalendarDays } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const TimingTab = ({ timingsData }) => {
  const { restaurantId } = useRestaurant();

  const { mutate, isPending } = useFormMutation({
    mutationFn: (data) => RestaurantService.updateRestaurant(restaurantId, data),
    queryKey: ["restaurant-details", restaurantId],
    invalidateKeys: [["restaurant-details", restaurantId]],
    extractUpdatedData: (response) => response?.data?.restaurant || response?.restaurant,
    successMessage: "Operating hours updated successfully!"
  });

  const formik = useFormik({
    initialValues: {
      currentlyOpen: timingsData?.currentlyOpen ?? true,
      days: Array.isArray(timingsData?.days) && timingsData.days.length > 0 
        ? timingsData.days.map(d => ({
            day: d.day,
            isOpen: d.isOpen ?? true,
            openTime: d.openTime || "10:00",
            closeTime: d.closeTime || "22:00"
          }))
        : DAYS.map(day => ({
            day,
            isOpen: true,
            openTime: "10:00",
            closeTime: "22:00"
          }))
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (!restaurantId) return;
      mutate({ openingHours: values }, {
        onSuccess: () => resetForm({ values }),
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col">     
      <div className="space-y-8"> 
        <div className={`relative overflow-hidden flex flex-row items-center justify-between rounded-md border p-6 shadow-sm transition-all duration-300 ${formik.values.currentlyOpen ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20 dark:border-green-900/50' : 'border-border/40 bg-muted/20'}`}>
          <div className="flex items-center gap-5 z-10">
            <div className={`p-4 rounded-md shadow-sm transition-colors duration-300 ${formik.values.currentlyOpen ? 'bg-white text-green-600 dark:bg-green-900/60 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800'}`}>
              <Power className={`h-6 w-6 ${formik.values.currentlyOpen ? 'animate-pulse' : ''}`} />
            </div>
            <div className="space-y-1">
              <Label className="text-lg font-semibold tracking-tight">Currently {formik.values.currentlyOpen ? 'Accepting Orders' : 'Offline'}</Label>
              <p className="text-sm text-muted-foreground">{formik.values.currentlyOpen ? 'Your restaurant is visible and active for customers.' : 'Toggle to temporarily close your restaurant to new orders.'}</p>
            </div>
          </div>
          <Switch 
            checked={formik.values.currentlyOpen} 
            onCheckedChange={(val) => formik.setFieldValue('currentlyOpen', val)} 
            className="scale-125 z-10 data-[state=checked]:bg-green-500" 
          />
          {formik.values.currentlyOpen && (
            <div className="absolute right-0 top-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <CalendarDays className="h-5 w-5 text-primary/90 dark:text-orange-400" />
            <h4 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">Weekly Schedule</h4>
          </div>
          
          <div className="space-y-3">
            {(formik.values.days || []).map((schedule, idx) => (
              <div 
                key={schedule?.day || idx} 
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${schedule?.isOpen ? 'border-border/60 bg-card hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/50' : 'border-border/30 bg-muted/30 opacity-75'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-[140px]">
                  <Switch 
                    checked={schedule?.isOpen} 
                    onCheckedChange={(val) => formik.setFieldValue(`days[${idx}].isOpen`, val)} 
                  />
                  <div className={`capitalize font-semibold text-sm sm:text-base ${schedule?.isOpen ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600'}`}>
                    {schedule?.day}
                  </div>
                </div>

                <div className={`flex flex-1 items-center gap-1.5 sm:gap-3 transition-opacity duration-300 ${schedule?.isOpen ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex-1 relative group min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <Sunrise className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 group-focus-within:text-primary/90 transition-colors" />
                    </div>
                    <Input 
                      type="time" 
                      name={`days[${idx}].openTime`}
                      value={schedule?.openTime || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!schedule?.isOpen}
                      className="pl-7 sm:pl-9 h-10 sm:h-11 w-full text-xs sm:text-sm bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-gray-800 focus-visible:ring-primary px-1 sm:px-3" 
                    />
                    <span className="absolute -top-2.5 left-2 sm:left-3 px-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white dark:bg-background">Opens</span>
                  </div>
                  
                  <span className="text-gray-400 font-medium shrink-0 text-sm sm:text-base">-</span>
                  
                  <div className="flex-1 relative group min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <Sunset className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 group-focus-within:text-primary/90 transition-colors" />
                    </div>
                    <Input 
                      type="time" 
                      name={`days[${idx}].closeTime`}
                      value={schedule?.closeTime || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!schedule?.isOpen}
                      className="pl-7 sm:pl-9 h-10 sm:h-11 w-full text-xs sm:text-sm bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-gray-800 focus-visible:ring-primary px-1 sm:px-3" 
                    />
                    <span className="absolute -top-2.5 left-2 sm:left-3 px-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white dark:bg-background">Closes</span>
                  </div>
                </div>
                
                {!schedule?.isOpen && (
                  <div className="hidden md:flex justify-end w-[80px]">
                    <span className="text-[10px] sm:text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 sm:px-2.5 py-1 rounded-md">Closed</span>
                  </div>
                )}
              </div>
            ))}
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
          {isPending ? "Saving changes..." : "Save Operating Hours"}
        </Button>
      </div>
    </form>
  );
};

export default TimingTab;
