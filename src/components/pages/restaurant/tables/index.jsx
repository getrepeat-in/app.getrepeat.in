"use client";
import QRCodeLib from "qrcode";
import { getImageUrl } from "@/lib/utils";
import { TableFormSheet } from "./fragments";
import { useTable } from "@/store/hooks/useTable";
import DataTable from "@/components/global/table";
import { useState, useMemo, useEffect } from "react";
import GlobalButton from "@/components/global/button";
import { Plus, Users, RefreshCw } from "lucide-react";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { TABLE_STATUS_FILTERS, DEFAULT_PAGE_SIZE, buildQRUrl, QR_ERROR_CORRECTION, TableNumberCell, TableStatusBadge, TableActiveBadge, TableQRCell, TableActionsCell } from "./helpers";

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

            const gradient = ctx.createRadialGradient(
                canvas.width / 2, 0, 0,
                canvas.width / 2, canvas.height / 3, canvas.height * 1.2
            );
            try {
                gradient.addColorStop(0, brandColor);
            } catch (e) {
                brandColor = "#ea580c";
                gradient.addColorStop(0, brandColor);
            }
            gradient.addColorStop(1, "#290c03");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            const glow = ctx.createRadialGradient(canvas.width, canvas.height, 0, canvas.width/2, canvas.height/2, 600);
            glow.addColorStop(0, "rgba(255, 120, 50, 0.15)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.save();
            ctx.translate(65, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
            ctx.font = "900 180px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("MENU", 0, 0);
            ctx.restore();

            let logoLoaded = false;
            let finalLogoImg = null;
            const logoUrl = activeRestaurant?.logo ? getImageUrl(activeRestaurant.logo, false, "original") : null;
            if (logoUrl) {
                try {
                    const logoImg = new window.Image();
                    logoImg.crossOrigin = "anonymous";
                    
                    await new Promise((resolve, reject) => {
                        logoImg.onload = resolve;
                        logoImg.onerror = reject;
                        logoImg.src = logoUrl;
                    });
                    finalLogoImg = logoImg;
                    
                    ctx.save();
                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowBlur = 30;
                    ctx.drawImage(logoImg, canvas.width / 2 - 50, 55, 100, 100);
                    ctx.restore();
                    logoLoaded = true;
                } catch (e) {
                    console.warn("Failed to load logo, skipping", e);
                }
            }

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "bold 36px sans-serif";
            ctx.fillText(activeRestaurant?.name || "Our Restaurant", canvas.width / 2, logoLoaded ? 190 : 120);

            // Subtitle
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("SCAN TO ORDER", canvas.width / 2, logoLoaded ? 220 : 150);

            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 50;
            ctx.shadowOffsetY = 25;
            ctx.fillStyle = "#ffffff";
            drawRoundedRect(100, 270, 400, 480, 40);
            ctx.restore();

            ctx.fillStyle = brandColor;
            ctx.font = "900 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Table ${table.tableNumber}`, canvas.width / 2, 345);

            const qrUrl = buildQRUrl(table.qrToken, activeRestaurant?.slug);
            const qr = QRCodeLib.create(qrUrl, { errorCorrectionLevel: QR_ERROR_CORRECTION });
            const size = qr.modules.size;
            const data = qr.modules.data;
            
            const qrCanvas = document.createElement("canvas");
            const qrSize = 320;
            const margin = 10;
            qrCanvas.width = qrSize;
            qrCanvas.height = qrSize;
            const qrCtx = qrCanvas.getContext("2d");
            
            qrCtx.fillStyle = "#ffffff";
            qrCtx.fillRect(0, 0, qrSize, qrSize);
            
            const moduleSize = (qrSize - margin * 2) / size;
            
            const drawModuleRoundedRect = (context, x, y, w, h, r) => {
                context.beginPath();
                context.moveTo(x + r, y);
                context.lineTo(x + w - r, y);
                context.quadraticCurveTo(x + w, y, x + w, y + r);
                context.lineTo(x + w, y + h - r);
                context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                context.lineTo(x + r, y + h);
                context.quadraticCurveTo(x, y + h, x, y + h - r);
                context.lineTo(x, y + r);
                context.quadraticCurveTo(x, y, x + r, y);
                context.closePath();
            };
            
            const drawPositionPattern = (xModule, yModule, color) => {
                const x = margin + xModule * moduleSize;
                const y = margin + yModule * moduleSize;
                const s7 = moduleSize * 7;
                const s1 = moduleSize * 1;
                const s3 = moduleSize * 3;
                const s5 = moduleSize * 5;
                
                qrCtx.fillStyle = color;
                drawModuleRoundedRect(qrCtx, x, y, s7, s7, moduleSize * 1.5);
                qrCtx.fill();
                
                qrCtx.fillStyle = "#ffffff";
                drawModuleRoundedRect(qrCtx, x + s1, y + s1, s5, s5, moduleSize * 0.75);
                qrCtx.fill();
                
                qrCtx.fillStyle = color;
                drawModuleRoundedRect(qrCtx, x + s1 * 2, y + s1 * 2, s3, s3, moduleSize * 0.75);
                qrCtx.fill();
            };
            
            const isPositionPattern = (r, c) => {
                return (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
            };
            
            qrCtx.fillStyle = "#18181b"; 
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (data[r * size + c] && !isPositionPattern(r, c)) {
                        drawModuleRoundedRect(qrCtx, margin + c * moduleSize, margin + r * moduleSize, moduleSize, moduleSize, moduleSize * 0.35);
                        qrCtx.fill();
                    }
                }
            }
            
            // Rich colored corners
            const patternColor = brandColor === "#ea580c" ? "#9f3131" : brandColor;
            drawPositionPattern(0, 0, patternColor);
            drawPositionPattern(size - 7, 0, patternColor);
            drawPositionPattern(0, size - 7, patternColor);
            
            ctx.drawImage(qrCanvas, 140, 380, 320, 320);

            if (finalLogoImg) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(262, 502, 76, 76);
                ctx.drawImage(finalLogoImg, 266, 506, 68, 68);
            }

            ctx.fillStyle = "#64748b";
            ctx.font = "600 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Point your camera to order", canvas.width / 2, 725);

            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.font = "500 15px sans-serif";
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
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <GlobalButton
                            onClick={handleAddTable}
                            size="sm"
                            className="flex-1 sm:flex-none w-full sm:w-auto h-9 sm:h-8.5 rounded-md shadow-2xs gap-1.5 font-semibold text-xs shrink-0"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add Table</span>
                        </GlobalButton>

                        {refetch && (
                            <GlobalButton
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-9 w-9 sm:h-8.5 sm:w-auto px-0 sm:px-3 rounded-md border-gray-200 dark:border-zinc-800 shadow-2xs shrink-0 flex items-center justify-center"
                                title="Refresh tables list"
                            >
                                <RefreshCw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline text-xs ml-1.5">Refresh</span>
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
