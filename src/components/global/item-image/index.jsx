"use client";
import { useState } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { useRestaurant } from "@/store/hooks/useRestaurant";

export function ItemImage({ src, alt, className }) {
    const { restaurantId, restaurants } = useRestaurant();
    const restaurant = restaurants?.find(r => r._id === restaurantId);
    const logoUrl = getImageUrl(restaurant?.logo, true, "thumbnail");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    const showPlaceholder = !src || error;
    return (
        <div className={cn("relative overflow-hidden bg-slate-50 w-full h-full flex items-center justify-center select-none", className)}>
            {loading && !showPlaceholder && (
                <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
            )}

            {showPlaceholder ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-neutral-50/50">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={restaurant?.name || "Restaurant Logo"}
                            className="w-full h-full object-cover opacity-15 filter grayscale transition-all duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-orange-400 font-black text-2xl uppercase opacity-45">
                            {(restaurant?.name || "R")[0]}
                        </div>
                    )}
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    className={cn(
                        "h-full w-full object-cover transition-all duration-500 ease-in-out",
                        loading ? "scale-105 blur-xs" : "scale-100 blur-none"
                    )}
                />
            )}
        </div>
    );
}
