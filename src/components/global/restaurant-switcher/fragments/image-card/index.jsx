import { useState } from "react";
import { Store } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const RestaurantImage = ({ restaurant, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = restaurant?.logo ? getImageUrl(restaurant.logo, true, "thumbnail") : null;
  const initial = restaurant?.name ? restaurant.name.charAt(0).toUpperCase() : "R";

  return (
    <div
      className={`relative flex size-8 sm:size-8.5 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-muted/60 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={restaurant?.name || "Restaurant"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary font-bold text-xs sm:text-sm select-none">
          {initial || <Store className="size-4 text-primary" />}
        </div>
      )}
    </div>
  );
};

export default RestaurantImage;