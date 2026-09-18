"use client";
import { useState, useMemo } from "react";
import { CheckCircle2, Layers, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "./fragments/SegmentedControl";
import { NestedItemSelection } from "@/components/global/nested-item-selector";
import { ACTION_OPTIONS, TYPE_OPTIONS, ROUNDING_OPTIONS } from "./constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";

export function BulkPriceUpdateSheet({ open, onOpenChange, items = [], categories = [], onApply }) {
  const [action, setAction] = useState("increase");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("");
  const [roundingOption, setRoundingOption] = useState("next_9");

  // All items selected by default
  const allItemIds = useMemo(() => items.map(i => String(i._id || i.id)), [items]);
  const [selectedItems, setSelectedItems] = useState(() => allItemIds);

  // Sync when items prop changes (sheet reopens)
  useMemo(() => {
    setSelectedItems(allItemIds);
  }, [allItemIds.join(",")]);

  const isFormValid = value && !isNaN(Number(value)) && Number(value) > 0;

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCategoryToggleList = (itemIds, isFullySelected) => {
    setSelectedItems(prev => {
      const current = new Set(prev);
      if (isFullySelected) {
        itemIds.forEach(id => current.delete(id));
      } else {
        itemIds.forEach(id => current.add(id));
      }
      return Array.from(current);
    });
  };

  const handleSelectAll = () => setSelectedItems(allItemIds);
  const handleClearAll = () => setSelectedItems([]);

  const handleSubmit = () => {
    if (!isFormValid) return;
    if (onApply) {
      onApply({
        applyTo: selectedItems.length === allItemIds.length ? "entire_menu" : "selected_items",
        selectedItems,
        action,
        type,
        value,
        roundingOption,
        items,
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col h-full bg-[#f8fafc] dark:bg-zinc-950 border-l border-border/80 shadow-2xl"
        showCloseButton={true}
      >
        {/* Sticky Header */}
        <SheetHeader className="px-5 py-4 text-left border-b border-border/80 bg-white dark:bg-zinc-900 sticky top-0 z-40">
          <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers className="size-4" />
            </div>
            <span>Bulk Price Update</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5 leading-normal">
            Apply a percentage or flat adjustment across selected menu items.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
          <div className="space-y-3 p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Action</label>
                <SegmentedControl
                  options={ACTION_OPTIONS}
                  value={action}
                  onChange={setAction}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Type</label>
                <SegmentedControl
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={setType}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Value</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={type === "percentage" ? "e.g. 10 for 10%" : "e.g. 20 for ₹20"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="pr-10 h-9 text-sm font-medium bg-background border-border/80 rounded-lg shadow-2xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs flex items-center justify-center size-5 rounded bg-muted/60">
                  {type === "percentage" ? "%" : "₹"}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Rounding */}
          <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              Rounding
            </label>
            <Select value={roundingOption} onValueChange={setRoundingOption}>
              <SelectTrigger className="w-full h-9 text-xs font-medium px-3 bg-background border-border/80 rounded-lg shadow-2xs focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select rounding option" />
              </SelectTrigger>
              <SelectContent>
                {ROUNDING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Apply To
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {selectedItems.length} / {allItemIds.length} items
                </span>
                <button
                  type="button"
                  onClick={selectedItems.length === allItemIds.length ? handleClearAll : handleSelectAll}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {selectedItems.length === allItemIds.length ? "Clear all" : "Select all"}
                </button>
              </div>
            </div>
            <NestedItemSelection
              items={items}
              categories={categories}
              selectedItems={selectedItems}
              onToggleItem={handleItemToggle}
              onToggleCategory={handleCategoryToggleList}
            />
          </div>
        </div>

        <SheetFooter className="p-4 border-t border-border/80 bg-white dark:bg-zinc-900 mt-auto flex flex-row items-center gap-2.5">
          <SheetClose asChild className="flex-1">
            <Button
              variant="outline"
              className="w-full h-9 text-xs font-semibold rounded-md border-border/80 hover:bg-muted"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || selectedItems.length === 0}
            className="flex-1 h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-xs transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="size-3.5" />
            Apply Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
