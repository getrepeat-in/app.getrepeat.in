import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

export function TreeCheckbox({ checked, onChange, indeterminate }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "flex shrink-0 items-center justify-center size-[18px] rounded-[5px] border-[1.5px] transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        checked || indeterminate
          ? "bg-primary border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
          : "border-border/70 bg-background hover:border-primary/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
      )}
    >
      {checked && !indeterminate && (
        <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
      )}
      {indeterminate && (
        <Minus className="size-2.5 text-primary-foreground" strokeWidth={3} />
      )}
    </button> 
  );
}
