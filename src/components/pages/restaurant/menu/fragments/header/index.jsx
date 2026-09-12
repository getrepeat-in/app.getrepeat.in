"use client";
import { useState, useEffect } from "react";
import { useItem } from "@/store/hooks/useItem";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Loader2 } from "lucide-react";
import { MenuService } from "@/services/frontend/menu";
import { useQueryClient } from "@tanstack/react-query";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export default function MenuHeader() {
    const { restaurantId } = useRestaurant();
    const { items, isLoading: itemsLoading } = useItem(restaurantId, {});
    
    const notification = useNotification();
    const queryClient = useQueryClient();

    const [isImporting, setIsImporting] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const [zomatoUrl, setZomatoUrl] = useState("");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleZomatoImport = async () => {
        if (!zomatoUrl.trim()) {
            notification.error("Please enter a Zomato menu URL");
            return;
        }

        setIsImporting(true);
        try {
            const data = await MenuService.importZomato(restaurantId, zomatoUrl);
            if (data.success) {
                notification.success(`Successfully imported ${data.total_items || data.stats?.itemsImported || 0} items!`);
                setPopoverOpen(false);
                setZomatoUrl("");
                queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
                queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
            } else {
                notification.error(data.message || "Failed to import Zomato menu");
            }
        } catch (e) {
            notification.error(e.response?.data?.message || e.message || "Failed to import Zomato menu");
        } finally {
            setIsImporting(false);
        }
    };

    const total = items?.length || 0;
    const media = items?.filter(item => item?.image || (item?.media && item?.media.length > 0))?.length || 0;
    const noMedia = total - media;

    const isLoading = !mounted || itemsLoading;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-30">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-50/80 border border-gray-100 px-3 py-1.5 rounded-md text-[13px] font-semibold text-gray-700 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Total: {isLoading ? <Loader2 className="h-3 w-3 animate-spin inline ml-1" /> : total}
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1.5 rounded-md text-[13px] font-semibold text-emerald-700 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Media: {isLoading ? <Loader2 className="h-3 w-3 animate-spin inline ml-1" /> : media}
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10/50 border border-orange-100/50 px-3 py-1.5 rounded-md text-[13px] font-semibold text-primary shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/90"></div>
                    No Media: {isLoading ? <Loader2 className="h-3 w-3 animate-spin inline ml-1" /> : noMedia}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Actions can go here in the future */}
            </div>
        </div>
    );
}
