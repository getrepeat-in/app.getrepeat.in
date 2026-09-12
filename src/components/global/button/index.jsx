"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";

export default function Button({
  variant = "default",
  size = "default",
  isLoading = false,
  disabled = false,
  icon,
  children,
  className,
  ...rest
}) {
  const isDisabled = disabled || isLoading;
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn(className)}
      {...rest}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {icon && !isLoading && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      {children}
    </ShadcnButton>
  );
}
