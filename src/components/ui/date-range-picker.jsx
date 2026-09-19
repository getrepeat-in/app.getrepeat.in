"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, startOfDay, endOfDay } from "date-fns";

export function DatePickerWithRange({ className, date, setDate }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(date);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setTempDate(date);
    }
  };

  const PRESETS = [
    { label: "Today", getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
    { label: "Yesterday", getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
    { label: "This week", getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
    { label: "Last week", getRange: () => ({ from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }) }) },
    { label: "This month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "Last month", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: "This year", getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
    { label: "Last year", getRange: () => ({ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }) },
    { label: "All time", getRange: () => ({ from: undefined, to: undefined }) },
  ];

  const handleApply = () => {
    if (tempDate?.from) {
      setDate({ 
        from: tempDate.from, 
        to: tempDate.to ? endOfDay(tempDate.to) : endOfDay(tempDate.from) 
      });
    } else {
      setDate(tempDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsOpen(false);
  };

  const isPresetActive = (presetDate) => {
    if (!tempDate?.from && !presetDate.from) return true;
    if (!tempDate?.from || !presetDate.from) return false;
    return format(tempDate.from, "yyyy-MM-dd") === format(presetDate.from, "yyyy-MM-dd") && 
           (!tempDate.to || (presetDate.to && format(tempDate.to, "yyyy-MM-dd") === format(presetDate.to, "yyyy-MM-dd")));
  };

  return (
    <div className={cn("inline-flex shrink-0", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger render={
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-8.5 w-auto shrink-0 px-2.5 gap-1.5 justify-start text-left font-normal bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-md shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800/60",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            {date?.from ? (
              date.to ? (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                  {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                  {format(date.from, "MMM d, yyyy")}
                </span>
              )
            ) : (
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">All time</span>
            )}
          </Button>
        } />
        <PopoverContent className="w-auto max-w-[95vw] p-0 flex flex-col sm:flex-row shadow-xl border border-gray-100 dark:border-zinc-800 rounded-md overflow-hidden" align="end" sideOffset={4}>
          <div className="w-full sm:w-32 md:w-36 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-row sm:flex-col p-1.5 sm:p-2 gap-1 overflow-x-auto sm:overflow-y-auto no-scrollbar shrink-0 max-h-[360px]">
            {PRESETS.map((preset) => {
              const presetRange = preset.getRange();
              const active = isPresetActive(presetRange);
              return (
                <button
                  key={preset.label}
                  onClick={() => setTempDate(presetRange)}
                  className={cn(
                    "text-left px-2 sm:px-3 py-1.5 rounded-md text-xs transition-colors font-medium whitespace-nowrap sm:whitespace-normal truncate",
                    active 
                      ? "bg-primary/10 text-primary dark:bg-primary/20" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col bg-white dark:bg-zinc-950 max-w-full overflow-hidden">
            <div className="p-1.5 sm:p-3 overflow-x-auto no-scrollbar flex justify-center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempDate?.from}
                selected={tempDate}
                onSelect={setTempDate}
                numberOfMonths={1}
                className="select-none"
              />
            </div>
          
            <div className="flex items-center justify-end gap-2 p-2 sm:p-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel} className="px-3 sm:px-4 text-xs font-semibold h-7.5 rounded-md">
                Cancel
              </Button>
              <Button size="sm" onClick={handleApply} className="px-3 sm:px-4 text-xs font-semibold h-7.5 rounded-md">
                Apply
              </Button>
            </div>
          </div>
          
        </PopoverContent>
      </Popover>
    </div>
  );
}
