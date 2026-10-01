"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No results found",
  description,
  action,
  size = "default",
  bordered = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        bordered && "border rounded-lg p-8 border-dashed",
        size === "sm" && "p-4",
        size === "default" && "p-8",
        size === "lg" && "p-12",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
        {React.isValidElement(Icon) ? (
          React.cloneElement(Icon, {
            className: cn("h-6 w-6 text-muted-foreground", Icon.props.className)
          })
        ) : (
          <Icon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}