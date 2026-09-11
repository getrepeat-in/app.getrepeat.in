"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TABLE_STATUS_CONFIG, buildQRUrl } from "./constants";
import { Link, Copy, Check, Pencil, Trash2, Download, ExternalLink } from "lucide-react";

export const TableNumberCell = ({ table }) => (
    <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center shrink-0">
            <span className="text-orange-600 dark:text-orange-500 font-bold text-xs">{table.tableNumber}</span>
        </div>
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
            {table.label || `Table ${table.tableNumber}`}
        </span>
    </div>
);

export const TableStatusBadge = ({ status }) => {
    const cfg = TABLE_STATUS_CONFIG[status] || TABLE_STATUS_CONFIG.unavailable;
    const isOccupied = status === "occupied";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${cfg.badge} shadow-2xs`}>
            <span className="relative flex h-1.5 w-1.5">
                {isOccupied && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
            </span>
            <span>{cfg.label}</span>
        </span>
    );
};

export const TableActiveBadge = ({ isActive }) => (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border
        ${isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-500"
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
        {isActive ? "Active" : "Inactive"}
    </span>
);

export const TableQRCell = ({ qrToken }) => {
    const [copied, setCopied] = useState(false);
    const qrUrl = buildQRUrl(qrToken);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-gray-200/90 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
                title="Copy menu ordering link"
            >
                {copied ? (
                    <>
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy size={12} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                        <span>Copy Link</span>
                    </>
                )}
            </button>
            {qrUrl && (
                <a 
                    href={qrUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-md transition-colors"
                    title="Open ordering link"
                >
                    <ExternalLink size={13} />
                </a>
            )}
        </div>
    );
};

export const TableActionsCell = ({ table, onEdit, onDownloadQR, onDelete }) => (
    <div className="flex items-center justify-end gap-1">
        <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                onDownloadQR(table);
            }}
            className="h-7 px-2 text-[11px] font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40 shadow-2xs gap-1"
            title="Download QR Code"
        >
            <Download size={12} />
            <span className="hidden sm:inline">QR</span>
        </Button>
        <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
                e.stopPropagation();
                onEdit(table);
            }}
            className="rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
            title="Edit Table"
        >
            <Pencil size={13} />
        </Button>
        <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(table);
            }}
            className="rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-red-500"
            title="Delete Table"
        >
            <Trash2 size={13} />
        </Button>
    </div>
);
