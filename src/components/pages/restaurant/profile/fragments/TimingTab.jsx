import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Save, Power, Loader2, CalendarDays, Copy } from "lucide-react";

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

  const handleApplyToAll = (sourceIndex) => {
    const sourceDay = formik.values.days?.[sourceIndex];
    if (!sourceDay) return;
    const updated = formik.values.days.map((d) => ({
      ...d,
      isOpen: sourceDay.isOpen,
      openTime: sourceDay.openTime,
      closeTime: sourceDay.closeTime,
    }));
    formik.setFieldValue("days", updated);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col">     
      <div className="space-y-6"> 
        <div className={`relative overflow-hidden flex flex-row items-start justify-between gap-3 sm:gap-4 rounded-xl border p-4 sm:p-6 shadow-xs transition-all duration-300 ${formik.values.currentlyOpen ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-transparent dark:from-emerald-950/30 dark:to-emerald-900/10 dark:border-emerald-900/50' : 'border-border/60 bg-muted/20'}`}>
          <div className="flex items-start gap-3 sm:gap-4 z-10 flex-1 min-w-0">
            <div className={`p-2.5 sm:p-3.5 rounded-xl shrink-0 shadow-xs transition-colors duration-300 ${formik.values.currentlyOpen ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
              <Power className={`h-4 w-4 sm:h-5 sm:w-5 ${formik.values.currentlyOpen ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex flex-col min-w-0">
              <Label className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate pr-2">
                Currently {formik.values.currentlyOpen ? 'Accepting Orders' : 'Offline'}
              </Label>
              <p className="text-[11px] sm:text-sm text-muted-foreground truncate pr-2 mt-0.5">
                {formik.values.currentlyOpen 
                  ? 'Your restaurant is live and accepting incoming orders.' 
                  : 'Toggle to temporarily pause new customer orders.'}
              </p>
            </div>
          </div>
          <Switch 
            checked={formik.values.currentlyOpen} 
            onCheckedChange={(val) => formik.setFieldValue('currentlyOpen', val)} 
            className="shrink-0 z-10 mt-1 sm:mt-1.5 data-[state=checked]:bg-emerald-500" 
          />
        </div>

        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-base font-bold tracking-tight text-foreground">Weekly Schedule</h4>
                <p className="text-xs hidden md:block text-muted-foreground">Configure open hours and closed days for each day of the week</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {(formik.values.days || []).map((schedule, idx) => (
              <div 
                key={schedule?.day || idx} 
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                  schedule?.isOpen 
                    ? 'border-border/70 bg-card hover:border-primary/30 shadow-2xs' 
                    : 'border-border/40 bg-muted/20 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[150px]">
                  <Switch 
                    checked={schedule?.isOpen} 
                    onCheckedChange={(val) => formik.setFieldValue(`days[${idx}].isOpen`, val)} 
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`capitalize font-semibold text-sm ${
                      schedule?.isOpen ? 'text-foreground' : 'text-muted-foreground line-through'
                    }`}>
                      {schedule?.day}
                    </span>
                    {!schedule?.isOpen && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Closed
                      </span>
                    )}
                  </div>
                </div>

                {schedule?.isOpen ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto mt-1 md:mt-0">
                    <div className="flex flex-row items-center gap-2.5 w-full sm:w-auto">
                      <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-start gap-1 sm:gap-3 bg-muted/40 hover:bg-muted/70 transition-colors border border-border/70 rounded-xl sm:rounded-lg px-3 py-2 sm:py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Opens
                        </span>
                        <input 
                          type="time" 
                          name={`days[${idx}].openTime`}
                          value={schedule?.openTime || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full sm:w-32 text-xs sm:text-sm font-semibold bg-transparent border-0 outline-none text-foreground cursor-pointer" 
                        />
                      </div>
                      
                      <span className="hidden sm:inline text-muted-foreground font-bold text-xs shrink-0">–</span>
                      <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-start gap-1 sm:gap-3 bg-muted/40 hover:bg-muted/70 transition-colors border border-border/70 rounded-xl sm:rounded-lg px-3 py-2 sm:py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Closes
                        </span>
                        <input 
                          type="time" 
                          name={`days[${idx}].closeTime`}
                          value={schedule?.closeTime || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full sm:w-32 text-xs sm:text-sm font-semibold bg-transparent border-0 outline-none text-foreground cursor-pointer" 
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyToAll(idx)}
                      className="h-10 sm:h-9 px-3 text-[11px] sm:text-xs font-semibold shrink-0 gap-1.5 shadow-2xs bg-white dark:bg-zinc-900 border-border hover:bg-muted text-muted-foreground hover:text-foreground w-full sm:w-auto mt-1 sm:mt-0"
                      title="Apply these timings to all days"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="sm:hidden xl:inline">Apply to all</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <span className="italic">Not accepting orders on this day</span>
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
