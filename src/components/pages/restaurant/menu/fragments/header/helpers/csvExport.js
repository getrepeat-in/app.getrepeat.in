import { CSV_HEADERS } from "./constants";
import { getCategoryName as getCatName } from "../../bulk-editor/helpers/utils";

export const exportMenuToCSV = (items, rawCategories, notification) => {
    if (!items || items.length === 0) {
        notification.error("No items found to export.");
        return;
    }

    const esc = (val) => {
        if (val == null) return "";
        const s = String(val);
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = items.map(item => [
        item.name,
        item.base_price,
        item.category ? getCatName(item.category, rawCategories) : "",
        item.subCategory ? getCatName(item.subCategory, rawCategories) : "",
        item.description || "",
        item.dietaryType ? item.dietaryType.toUpperCase() : "VEG",
        item.isAvailable ? "Available" : "Unavailable",
        (item.variants || []).map(v => `${v.property_name}: [${(v.options||[]).map(o=>`${o.name} (+₹${o.price||0})`).join(", ")}]`).join(" | ")
    ]);

    const csv = [CSV_HEADERS.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    notification.success(`Exported ${items.length} items to CSV!`);
};
