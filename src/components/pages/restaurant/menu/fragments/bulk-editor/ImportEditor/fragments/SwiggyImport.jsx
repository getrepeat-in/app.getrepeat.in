import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SwiggyImport({ onBack }) {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!url.includes("swiggy.com")) return;
        
        setIsLoading(true);
        // TODO: Implement actual API call to import from Swiggy
        setTimeout(() => {
            setIsLoading(false);
            alert("Swiggy import feature coming soon!");
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-2 flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary/90 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="w-8 h-8" />
                </div>
                <h4 className="text-[18px] font-bold text-slate-800 mb-2">Find your restaurant</h4>
                <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
                    Go to Swiggy, find your restaurant page, and copy the URL from your browser's address bar. It should look like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">swiggy.com/restaurants/your-restaurant-name</code>.
                </p>

                <form onSubmit={handleImport} className="w-full flex flex-col gap-4">
                    <Input 
                        placeholder="https://www.swiggy.com/city/delhi/barbeque-nation-regal-building-connaught-place-rest1257078" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 bg-slate-50 border-gray-200 text-center text-[14px]"
                        required
                    />
                    <Button 
                        type="submit"
                        disabled={!url || isLoading}
                        className="h-12 bg-primary/90 hover:bg-primary text-white font-bold text-[14px] w-full shadow-md shadow-primary/20 transition-all"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Fetch Menu Data
                    </Button>
                </form>
            </div>
        </div>
    );
}
