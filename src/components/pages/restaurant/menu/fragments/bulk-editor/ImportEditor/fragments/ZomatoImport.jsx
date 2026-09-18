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
        <div className="flex flex-col h-full overflow-hidden items-center justify-center p-4 sm:p-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-xl mx-auto w-full bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-12 text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-red-400 text-white rounded-[22px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/30 transform -rotate-3 transition-transform duration-300 hover:rotate-0 hover:scale-105">
                    <Search className="w-10 h-10 stroke-[2.5]" />
                </div>
                
                <h4 className="text-[22px] font-bold text-slate-800 mb-3 tracking-tight">Import from Zomato</h4>
                <p className="text-[15px] text-slate-500 mb-10 leading-relaxed max-w-[420px] mx-auto">
                    Go to Zomato, find your restaurant page, and copy the URL from your browser's address bar. It should look like <code className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-600 text-sm font-medium">zomato.com/ncr/your-restaurant</code>.
                </p>

                <form onSubmit={handleImport} className="w-full flex flex-col gap-4">
                    <div className="relative group">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-400 transition-colors w-5 h-5 z-10" />
                        <Input 
                            placeholder="e.g. https://www.zomato.com/ncr/barbeque-nation" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-14 w-full bg-slate-50 border-2 border-slate-100 text-slate-800 pl-12 pr-4 rounded-xl text-[15px] font-medium transition-all focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 placeholder:text-slate-400 shadow-none"
                            required
                        />
                    </div>
                    
                    <Button 
                        type="submit"
                        disabled={!url || isLoading}
                        className="h-14 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-[15px] w-full rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {isLoading ? "Fetching Menu Data..." : "Fetch Menu Data"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
