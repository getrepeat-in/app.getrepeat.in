"use client";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { getCategoryName } from "../helper/utils";
import { Download, FileSpreadsheet, Layers, UtensilsCrossed } from "lucide-react";

export function ExportCSV() {
  const { restaurantId } = useRestaurant();
  const { items, isLoading: itemsLoading } = useItem(restaurantId, {});
  const { rawCategories, isLoading: catsLoading } = useCategory(restaurantId);
  const notification = useNotification();

  const handleDownload = () => {
    if (!items || items.length === 0) {
      notification.error("No items found to export.");
      return;
    }

    const headers = [
      "Item Name",
      "Base Price (₹)",
      "Category",
      "Subcategory",
      "Description",
      "Dietary Type",
      "Availability",
      "Variants"
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return "";
      const stringVal = String(val);
      const needsQuotes = stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r");
      if (needsQuotes) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = items.map(item => {
      const catName = item.category ? getCategoryName(item.category, rawCategories) : "";
      const subCatName = item.subCategory ? getCategoryName(item.subCategory, rawCategories) : "";
      const dietLabel = item.dietaryType ? item.dietaryType.toUpperCase() : "VEG";
      const availability = item.isAvailable ? "Available" : "Unavailable";
      
      const variantsSummary = (item.variants || []).map(v => {
        const opts = (v.options || []).map(o => `${o.name} (+₹${o.price || 0})`).join(", ");
        return `${v.property_name}: [${opts}]`;
      }).join(" | ");

      return [
        item.name,
        item.base_price,
        catName,
        subCatName,
        item.description || "",
        dietLabel,
        availability,
        variantsSummary
      ];
    });

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `menu_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notification.success(`Successfully exported ${items.length} items to CSV!`);
  };

  if (itemsLoading || catsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Preparing export file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 bg-slate-50/50 h-full">
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-md p-8 flex flex-col items-center text-center transition-all duration-300">
        <Button
          onClick={handleDownload}
          disabled={items.length === 0}
          className="w-full bg-primary hover:bg-white hover:border-primary hover:text-primary text-white font-bold h-12 text-sm rounded-md shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 duration-200 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Download CSV Spreadsheet
        </Button>
        
        <p className="text-[11px] text-slate-400 font-semibold mt-4">
          Ready for Excel, Google Sheets, or POS uploads.
        </p>

      </div>
    </div>
  );
}
