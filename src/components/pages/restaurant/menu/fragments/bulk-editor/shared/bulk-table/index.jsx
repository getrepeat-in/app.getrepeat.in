import React from 'react';
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/global/empty-state";

export function BulkTable({ title, subtitle, columns, data, rowKey, emptyMessage = "No items found." }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 p-4 h-full">
                {(title || subtitle) && (
                    <div className="mb-4">
                        {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
                        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                    </div>
                )}
                <EmptyState
                    icon={SearchX}
                    title="No Data Available"
                    description={emptyMessage}
                    className="h-full w-full"
                />
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-md bg-white shadow-sm flex flex-col font-poppins h-full">
            {(title || subtitle) && (
                <div className="px-5 py-4 border-b border-gray-100 bg-white">
                    {title && <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">{title}</h2>}
                    {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
            )}
            <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50/50">
                {columns.map((col, index) => (
                    <div 
                        key={index} 
                        className={`font-medium text-slate-500 text-[12px] uppercase tracking-wide ${col.className || ''}`}
                        style={col.width ? { width: col.width } : { flex: 1 }}
                    >
                        {col.header}
                    </div>
                ))}
            </div>
            
            <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                {data.map((row, rowIndex) => (
                    <div 
                        key={rowKey ? row[rowKey] : rowIndex} 
                        className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors duration-150"
                    >
                        {columns.map((col, colIndex) => (
                            <div 
                                key={colIndex} 
                                className={`${col.className || ''}`}
                                style={col.width ? { width: col.width } : { flex: 1 }}
                            >
                                {col.render(row, rowIndex)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
