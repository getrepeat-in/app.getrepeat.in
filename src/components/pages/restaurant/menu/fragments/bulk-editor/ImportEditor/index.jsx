"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CsvImport } from "./fragments/CsvImport";
import { JsonImport } from "./fragments/JsonImport";
import { ZomatoImport } from "./fragments/ZomatoImport";
import { SwiggyImport } from "./fragments/SwiggyImport";

export function ImportEditor() {
    const [activeTool, setActiveTool] = useState(null);
    const IMPORT_OPTIONS = [
        {
            id: 'json',
            name: 'AI JSON',
            description: "Extract menu from images or PDF using AI.",
            logo: '/assets/logo/json.png', 
            hoverStyle: 'hover:border-blue-500/40 hover:shadow-blue-500/10'
        },
        {
            id: 'zomato',
            name: 'Zomato',
            description: "Paste your restaurant's Zomato link to fetch menu data.",
            logo: '/assets/logo/zomato.webp',
            hoverStyle: 'hover:border-red-500/40 hover:shadow-red-500/10'
        },
        {
            id: 'swiggy',
            name: 'Swiggy',
            description: "Paste your restaurant's Swiggy link to fetch menu data.",
            logo: '/assets/logo/swiggy.webp',
            hoverStyle: 'hover:border-orange-500/40 hover:shadow-orange-500/10'
        },
        {
            id: 'csv',
            name: 'CSV Upload',
            description: "Upload your menu data using our CSV template.",
            logo: '/assets/logo/csv.webp',
            hoverStyle: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10'
        }
    ];

    const activeOption = IMPORT_OPTIONS.find(o => o.id === activeTool);

    const renderContent = () => {
        if (activeTool === 'json') {
            return <JsonImport />;
        }
        if (activeTool === 'zomato') {
            return <ZomatoImport />;
        }
        if (activeTool === 'swiggy') {
            return <SwiggyImport />;
        }
        if (activeTool === 'csv') {
            return <CsvImport />;
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mx-auto">
                {IMPORT_OPTIONS.map((option) => (
                    <div 
                        key={option.id}
                        onClick={() => setActiveTool(option.id)}
                        className={`group bg-white border border-gray-200 rounded-md aspect-square flex flex-col items-center justify-center p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${option.hoverStyle}`}
                    >
                        <div className="w-full flex-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img src={option.logo} alt={option.name} className="max-w-full object-contain drop-shadow-sm" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 font-poppins bg-gray-50/50 flex flex-col font-sans overflow-y-auto">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                {activeOption ? (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => setActiveTool(null)} className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-sm shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <img src={activeOption.logo} alt={activeOption.name} className="max-w-full rounded-sm max-h-full object-contain drop-shadow-sm" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Import from {activeOption.name}</h2>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Import Menu</h2>
                        <p className="text-[13px] text-gray-500 mt-1 font-medium">
                            Choose how you would like to import items into your menu.
                        </p>
                    </div>
                )}
            </div>
            
            <div className="p-4 mx-auto w-full h-full">
                {renderContent()}
            </div>
        </div>
    );
}
