"use client";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import EmptyState from "@/components/global/empty-state";

export function TableEmpty({
  icon,
  title = "No data available",
  description = "There are no records matching your request.",
  action,
  className,
  size = "default",
  bordered = true,
}) {
  return (
    <div className={cn("p-4 sm:p-6 flex items-center justify-center w-full h-full flex-1", className)}>
      <EmptyState
        icon={icon || Inbox}
        title={title}
        description={description}
        action={action}
        size={size}
        bordered={bordered}
        className="w-full h-full"
      />
    </div>
  );
}
