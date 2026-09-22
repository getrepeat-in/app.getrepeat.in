"use client";
import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";

const ThemeSection = ({ formik }) => {
  const colorFields = [
    { name: "primary", label: "Primary" },
    { name: "primaryForeground", label: "Primary Foreground" },
    { name: "secondary", label: "Secondary" },
    { name: "secondaryForeground", label: "Secondary Foreground" },
    { name: "background", label: "Background" },
    { name: "foreground", label: "Foreground" },
    { name: "muted", label: "Muted" },
    { name: "mutedForeground", label: "Muted Foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Theme Colors</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize the colors for your storefront.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {colorFields.map((field) => (
          <div key={field.name} className="relative group">
            <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">{field.label}</span>
            </div>
            <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50 hover:border-gray-400 dark:hover:border-gray-600">
              <div className="pl-3.5 flex items-center pointer-events-none">
                <Palette className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              
              <div className="relative w-6 h-6 rounded overflow-hidden border border-gray-200 dark:border-gray-700 ml-3 flex-shrink-0 cursor-pointer shadow-sm group/color transition-transform hover:scale-110">
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ backgroundColor: formik.values.theme?.colors?.[field.name] || "#000000" }}
                />
                <input 
                  id={`theme.colors.${field.name}-picker`}
                  name={`theme.colors.${field.name}`}
                  type="color"
                  value={formik.values.theme?.colors?.[field.name] || "#000000"} 
                  onChange={formik.handleChange} 
                  className="absolute -inset-4 w-16 h-16 opacity-0 cursor-pointer" 
                />
              </div>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3" />

              <Input 
                id={`theme.colors.${field.name}-text`}
                name={`theme.colors.${field.name}`}
                value={formik.values.theme?.colors?.[field.name] || "#000000"} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm px-0 w-full uppercase font-medium text-gray-700 dark:text-gray-200 tracking-wide" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSection;