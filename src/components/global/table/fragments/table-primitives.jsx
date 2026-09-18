"use client";
import { cn } from "@/lib/utils";

export function TableContainer({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden flex flex-col rounded-md border border-gray-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 shadow-xs transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TableScrollArea({ children, className, maxHeight, ...props }) {
  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800",
        className
      )}
      style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ className, ...props }) {
  return (
    <table
      className={cn("w-full caption-bottom text-left border-collapse text-sm", className)}
      {...props}
    />
  );
}

export function TableHeader({ className, sticky, ...props }) {
  return (
    <thead
      className={cn(
        "bg-[#fafbfd] dark:bg-zinc-900/95 border-b border-gray-200/90 dark:border-zinc-800 text-[11px] font-semibold tracking-wider text-gray-500 dark:text-zinc-400 uppercase select-none",
        sticky && "sticky top-0 z-10 shadow-2xs backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }) {
  return (
    <tbody
      className={cn("divide-y divide-gray-100 dark:divide-zinc-800/60 font-normal", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn(
        "border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 font-medium text-gray-700 dark:text-zinc-300",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className, isSelected, isHoverable = true, ...props }) {
  return (
    <tr
      className={cn(
        "group/tr transition-colors duration-100",
        isHoverable && "hover:bg-gray-50/70 dark:hover:bg-zinc-900/60",
        isSelected && "bg-primary/[0.04] dark:bg-primary/[0.08] hover:bg-primary/[0.07] dark:hover:bg-primary/[0.12] shadow-[inset_3px_0_0_0_var(--color-primary)]",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, align = "left", sticky, stickyOffset = 0, ...props }) {
  return (
    <th
      className={cn(
        "px-5 py-3.5 text-[11px] font-semibold text-gray-500 dark:text-zinc-400 tracking-wider whitespace-nowrap uppercase",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        sticky === "left" &&
          "sticky left-0 z-20 bg-[#fafbfd] dark:bg-zinc-900 shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]",
        sticky === "right" &&
          "sticky right-0 z-20 bg-[#fafbfd] dark:bg-zinc-900 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.06)]",
        className
      )}
      style={sticky ? { [sticky]: stickyOffset } : undefined}
      {...props}
    />
  );
}

export function TableCell({ className, align = "left", sticky, stickyOffset = 0, ...props }) {
  return (
    <td
      className={cn(
        "px-5 py-3.5 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 transition-colors whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        sticky === "left" &&
          "sticky left-0 z-10 bg-white group-hover/tr:bg-gray-50/70 dark:bg-zinc-950 dark:group-hover/tr:bg-zinc-900/60 shadow-[1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)]",
        sticky === "right" &&
          "sticky right-0 z-10 bg-white group-hover/tr:bg-gray-50/70 dark:bg-zinc-950 dark:group-hover/tr:bg-zinc-900/60 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.06)]",
        className
      )}
      style={sticky ? { [sticky]: stickyOffset } : undefined}
      {...props}
    />
  );
}
