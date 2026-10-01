"use client";

import QRCodeLib from "qrcode";
import { getImageUrl } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { TableFormSheet } from "./fragments";
import { useTable } from "@/store/hooks/useTable";
import DataTable from "@/components/global/table";
import GlobalButton from "@/components/global/button";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Plus, Users, RefreshCw, MapPin } from "lucide-react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { TABLE_STATUS_FILTERS, DEFAULT_PAGE_SIZE, buildQRUrl, QR_COLORS, QR_ERROR_CORRECTION, TableNumberCell, TableStatusBadge, TableActiveBadge, TableQRCell, TableActionsCell } from "./helpers";

export default function TablesManagement() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const { restaurants, restaurantId } = useRestaurant();
    const activeRestaurant = restaurants?.find(r => r._id === restaurantId);
    const { tables, isLoading, error, deleteTable, isDeleting, refetch } = useTable(restaurantId);

    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [tableToDelete, setTableToDelete] = useState(null);

    const handleAddTable = () => {
        setEditingTable(null);
        setIsSheetOpen(true);
    };

    const handleEditTable = (table) => {
        setEditingTable(table);
        setIsSheetOpen(true);
    };

    const handleDelete = async () => {
        if (!tableToDelete) return;
        deleteTable(tableToDelete._id || tableToDelete, {
            onSuccess: () => setTableToDelete(null),
            onError: () => setTableToDelete(null)
        });
    };

    const handleDownloadQR = async (table) => {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = 600;
            canvas.height = 840;
            const ctx = canvas.getContext("2d");

            const drawRoundedRect = (x, y, w, h, r) => {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                ctx.fill();
            };

            const rawPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            let brandColor = "#ea580c";
            
            if (rawPrimary) {
                if (rawPrimary.startsWith("hsl") || rawPrimary.startsWith("rgb") || rawPrimary.startsWith("lab") || rawPrimary.startsWith("#")) {
                    brandColor = rawPrimary;
                } else if (rawPrimary.includes(",")) {
                    brandColor = `hsl(${rawPrimary})`;
                } else {
                    brandColor = `hsl(${rawPrimary.split(' ').filter(Boolean).join(', ')})`;
                }
            }

            // Draw a beautiful warm gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            try {
                gradient.addColorStop(0, brandColor);
            } catch (e) {
                console.warn("Failed to apply primary color, falling back", e);
                brandColor = "#ea580c"; // Fallback to safe hex
                gradient.addColorStop(0, brandColor);
            }
            gradient.addColorStop(1, "#431407");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Large rotated text "MENU" on the left edge
            ctx.save();
            ctx.translate(50, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.font = "900 160px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("MENU", 0, 0);
            ctx.restore();

            // Draw Logo at top
            let logoLoaded = false;
            let finalLogoImg = null;
            const logoUrl = activeRestaurant?.logo ? getImageUrl(activeRestaurant.logo, false, "original") : null;
            if (logoUrl) {
                try {
                    const res = await fetch(logoUrl);
                    const blob = await res.blob();
                    const logoDataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    const logoImg = new window.Image();
                    logoImg.src = logoDataUrl;
                    await new Promise((resolve) => { logoImg.onload = resolve; });
                    finalLogoImg = logoImg;
                    
                    // Add subtle glow behind logo
                    ctx.save();
                    ctx.shadowColor = "rgba(255,255,255,0.3)";
                    ctx.shadowBlur = 20;
                    ctx.drawImage(logoImg, canvas.width / 2 - 45, 60, 90, 90);
                    ctx.restore();
                    logoLoaded = true;
                } catch (e) {
                    console.error("Failed to load logo", e);
                }
            }

            // Restaurant Name
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "bold 36px sans-serif";
            ctx.fillText(activeRestaurant?.name || "Our Restaurant", canvas.width / 2, logoLoaded ? 190 : 120);

            // Subtitle
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("SCAN TO ORDER", canvas.width / 2, logoLoaded ? 220 : 150);

            // Draw a white rounded box for the QR code
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
            ctx.shadowBlur = 40;
            ctx.shadowOffsetY = 20;
            ctx.fillStyle = "#ffffff";
            drawRoundedRect(100, 270, 400, 480, 40);
            ctx.restore();

            // Text inside white box: "Table X"
            ctx.fillStyle = brandColor;
            ctx.font = "900 48px sans-serif";
            ctx.fillText(`Table ${table.tableNumber}`, canvas.width / 2, 345);

            // Draw QR Code
            const qrUrl = buildQRUrl(table.qrToken, activeRestaurant?.slug);
            const qrDataUrl = await QRCodeLib.toDataURL(qrUrl, {
                width: 320,
                margin: 0,
                color: { dark: "#1a1a1a", light: "#ffffff" },
                errorCorrectionLevel: QR_ERROR_CORRECTION,
            });
            const img = new window.Image();
            img.src = qrDataUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            ctx.drawImage(img, 140, 380, 320, 320);

            if (finalLogoImg) {
                ctx.fillStyle = "#ffffff";
                // Center of 320x320 at (140,380) is (300, 540). Draw 76x76 box
                ctx.fillRect(262, 502, 76, 76);
                ctx.drawImage(finalLogoImg, 266, 506, 68, 68);
            }

            // Text under QR code in white box
            ctx.fillStyle = "#64748b";
            ctx.font = "500 16px sans-serif";
            ctx.fillText("Point your camera to order", canvas.width / 2, 730);

            // Bottom Footer
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "normal 14px sans-serif";
            ctx.fillText(`Capacity: ${table.capacity} seats`, canvas.width / 2, 790);

            const a = document.createElement("a");
            a.href = canvas.toDataURL("image/png");
            a.download = `table-${table.tableNumber}-qr.png`;
            a.click();
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };

    const filterTabs = useMemo(() => 
        TABLE_STATUS_FILTERS.map(t => ({
            label: t.label,
            value: t.value
        })), []
    );

    const filteredTables = useMemo(() => {
        if (!tables) return [];
        let data = tables;
        if (statusFilter && statusFilter !== "all") {
            data = data.filter((t) => t.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((t) => 
                String(t.tableNumber)?.toLowerCase().includes(q) ||
                t.label?.toLowerCase().includes(q)
            );
        }
        return data;
    }, [tables, statusFilter, searchQuery]);

    const columns = useMemo(() => [
        {
            header: "Table",
            key: "tableNumber",
            sortable: true,
            render: (table) => <TableNumberCell table={table} />
        },

        {
            header: "Capacity",
            key: "capacity",
            sortable: true,
            render: (table) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
                    <Users size={12} className="text-gray-400" />
                    <span>{table.capacity} seats</span>
                </div>
            )
        },
        {
            header: "Status",
            key: "status",
            align: "center",
            render: (table) => <TableStatusBadge status={table.status} />
        },
        {
            header: "Active",
            key: "isActive",
            align: "center",
            render: (table) => <TableActiveBadge isActive={table.isActive} />
        },
        {
            header: "QR Token / Link",
            key: "qrToken",
            render: (table) => <TableQRCell qrToken={table.qrToken} slug={activeRestaurant?.slug} />
        },
        {
            header: "Actions",
            key: "actions",
            align: "right",
            width: "140px",
            render: (table) => (
                <TableActionsCell 
                    table={table}
                    onEdit={handleEditTable}
                    onDownloadQR={handleDownloadQR}
                    onDelete={setTableToDelete}
                />
            )
        }
    ], [activeRestaurant]);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 m-2 sm:m-4 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-6 rounded-md border border-border/40 shadow-xs min-w-0">
            <DataTable
                title="Table Management"
                subtitle="Configure and manage tables and QR ordering codes"
                columns={columns}
                data={filteredTables}
                isLoading={!isMounted || isLoading}
                error={error}
                
                searchable
                searchPlaceholder="Search table number or label..."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}

                filterTabs={filterTabs}
                activeFilterTab={statusFilter}
                onFilterTabChange={setStatusFilter}

                actions={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <GlobalButton
                            onClick={handleAddTable}
                            size="sm"
                            className="h-8.5 rounded-md shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add Table</span>
                        </GlobalButton>

                        {refetch && (
                            <GlobalButton
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-8.5 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs gap-1.5 shrink-0"
                                title="Refresh tables list"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline text-xs">Refresh</span>
                            </GlobalButton>
                        )}
                    </div>
                }

                pagination
                pageSize={DEFAULT_PAGE_SIZE}
                emptyState={{
                    title: "No Tables Found",
                    description: "You haven't created any tables yet. Add your first table to get started.",
                }}
            />

            <TableFormSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setEditingTable(null);
                }}
                table={editingTable}
            />

            <ConfirmDeleteAlert
                isOpen={!!tableToDelete}
                onClose={() => setTableToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Delete Table?"
                description={`Are you sure you want to delete Table ${tableToDelete?.tableNumber || ""}? This action cannot be undone.`}
            />
        </div>
    );
}
