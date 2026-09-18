import { cn } from "@/lib/utils";

export function SegmentedControl({ options, value, onChange, className }) {
  return (
    <div className={cn("flex w-full rounded-lg border border-border/70 p-1 bg-muted/40 dark:bg-zinc-900/60 shadow-2xs gap-1", className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 flex items-center justify-center rounded-md h-8.5 text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
