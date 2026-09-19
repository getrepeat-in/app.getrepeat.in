import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Link } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";

export function ZomatoImport() {
    const { restaurantId } = useRestaurant();
    const notification = useNotification();
    const queryClient = useQueryClient();

    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!url.includes("zomato.com")) {
            notification.error("Please enter a valid Zomato URL.");
            return;
        }
        
        setIsLoading(true);
        try {
            const data = await MenuService.importZomato(restaurantId, url);
            if (data.success) {
                notification.success(`Successfully imported ${data.total_items || data.stats?.itemsImported || 0} items!`);
                setUrl("");
                queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
                queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
            } else {
                notification.error(data.message || "Failed to import Zomato menu");
            }
        } catch (e) {
            notification.error(e.response?.data?.message || e.message || "Failed to import Zomato menu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-2">
            <div className="w-full bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-7 h-7" />
                </div>
                
                <div className="mb-8">
                    <h4 className="text-2xl font-semibold text-slate-900 mb-2">Import from Zomato</h4>
                    <p className="text-[15px] text-slate-500 max-w-lg mx-auto">
                        Copy your restaurant's URL from Zomato and paste it below to fetch your entire menu automatically.
                    </p>
                </div>

                <form onSubmit={handleImport} className="w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Link className="w-5 h-5 text-slate-400" />
                        </div>
                        <Input 
                            placeholder="e.g. https://www.zomato.com/ncr/barbeque-nation" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-12 w-full bg-slate-50 border-slate-200 text-slate-900 pl-11 pr-4 rounded-lg text-[15px] focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all shadow-none"
                            required
                        />
                    </div>
                    
                    <Button 
                        type="submit"
                        disabled={!url || isLoading}
                        className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[15px] rounded-lg shadow-sm transition-all sm:w-auto w-full flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {isLoading ? "Fetching..." : "Fetch Menu Data"}
                    </Button>
                </form>

                <div className="mt-8 text-sm text-slate-500">
                    It should look like: <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">zomato.com/ncr/your-restaurant</code>
                </div>
            </div>
        </div>
    );
}
