"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
    icon: Icon,
    title = "No Data Available",
    description,
    action,
    secondaryAction,
    children,
    size = "default", 
    bordered = true,
    className,
}) {
    const isSm = size === "sm";
    const isLg = size === "lg";

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center transition-all",
                bordered && "border border-dashed border-border/80 bg-muted/20 rounded-xl",
                isSm ? "p-4.5" : isLg ? "p-10 sm:p-12" : "p-6 sm:p-8",
                "mx-auto",
                className
            )}
        >
            {Icon && (
                <div
                    className={cn(
                        "flex items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0",
                        isSm ? "size-9 mb-2.5 [&>svg]:size-4.5" : isLg ? "size-14 mb-4 rounded-xl [&>svg]:size-7" : "size-11 mb-3 rounded-lg [&>svg]:size-5.5"
                    )}
                >
                    {React.isValidElement(Icon) ? Icon : <Icon />}
                </div>
            )}

            {title && (
                <h4
                    className={cn(
                        "font-semibold text-foreground tracking-tight",
                        isSm ? "text-xs mb-1" : isLg ? "text-base sm:text-lg mb-1.5" : "text-sm mb-1"
                    )}
                >
                    {title}
                </h4>
            )}

            {description && (
                <p
                    className={cn(
                        "text-muted-foreground leading-relaxed",
                        isSm ? "text-[11px] mb-3.5 max-w-[220px]" : isLg ? "text-sm mb-5 max-w-sm" : "text-xs mb-4 max-w-xs"
                    )}
                >
                    {description}
                </p>
            )}

            {(action || secondaryAction || children) && (
                <div className={cn("flex items-center justify-center gap-2 w-full", isSm ? "flex-col" : "flex-wrap")}>
                    {action}
                    {secondaryAction}
                    {children}
                </div>
            )}
        </div>
    );
}

export default EmptyState;
