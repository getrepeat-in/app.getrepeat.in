import React from "react";

export const DietaryBadge = ({ dietaryType, className = "" }) => {
  const type = dietaryType?.toLowerCase();
  
  if (type === "non-veg") {
    return (
      <div className={`w-3.5 h-3.5 rounded-xs border border-red-600 flex items-center justify-center shrink-0 mt-0.5 ${className}`} title="Non-Veg">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
      </div>
    );
  }
  if (type === "egg") {
    return (
      <div className={`w-3.5 h-3.5 rounded-xs border border-amber-500 flex items-center justify-center shrink-0 mt-0.5 ${className}`} title="Egg">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      </div>
    );
  }
  return (
    <div className={`w-3.5 h-3.5 rounded-xs border border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 ${className}`} title="Veg">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
    </div>
  );
};
