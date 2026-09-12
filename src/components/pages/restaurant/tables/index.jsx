"use client";

import QRCodeLib from "qrcode";
import { getImageUrl } from "@/lib/utils";
import { useState, useMemo } from "react";
import { TableFormSheet } from "./fragments";
import GlobalButton from "@/components/global/button";
import { useTable } from "@/store/hooks/useTable";
import DataTable from "@/components/global/table";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { Plus, Users, RefreshCw, MapPin } from "lucide-react";
import { ConfirmDeleteAlert } from "@/components/ui/confirm-delete-alert";
import { TABLE_STATUS_FILTERS, DEFAULT_PAGE_SIZE, buildQRUrl, QR_COLORS, QR_ERROR_CORRECTION, TableNumberCell, TableStatusBadge, TableActiveBadge, TableQRCell, TableActionsCell } from "./helpers";

export default function TablesManagement() {
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
            const qrUrl = buildQRUrl(table.qrToken);
            const qrDataUrl = await QRCodeLib.toDataURL(qrUrl, {
                width: 600,
                margin: 1,
                color: QR_COLORS,
                errorCorrectionLevel: QR_ERROR_CORRECTION,
            });

            const canvas = document.createElement("canvas");
            canvas.width = 600;
            canvas.height = 780;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.fillStyle = primaryColor || "#ea580c";
            ctx.fillRect(0, 0, canvas.width, 160);

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "bold 24px sans-serif";
            ctx.fillText("SCAN TO ORDER", canvas.width / 2, 60);

            ctx.font = "bold 52px sans-serif";
            ctx.fillText(`Table ${table.tableNumber}`, canvas.width / 2, 130);

            const img = new window.Image();
            img.src = qrDataUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            ctx.drawImage(img, 75, 180, 450, 450);

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
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(250, 355, 100, 100);
                    ctx.drawImage(logoImg, 260, 365, 80, 80);
                } catch (e) {
                    console.error("Failed to load logo", e);
                }
            }

            ctx.fillStyle = "#fff7ed";
            ctx.fillRect(0, 680, canvas.width, 100);

            ctx.fillStyle = primaryColor || "#ea580c";
            ctx.font = "bold 26px sans-serif";
            ctx.fillText("📱 Scan & Order Instantly", canvas.width / 2, 725);
            
            ctx.fillStyle = "#fff7ed";
            ctx.font = "normal 16px sans-serif";
            ctx.globalAlpha = 0.8;
            ctx.fillText(`Capacity: ${table.capacity} seats`, canvas.width / 2, 755);

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
                t.label?.toLowerCase().includes(q) ||
                t.zone?.toLowerCase().includes(q)
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
            header: "Zone",
            key: "zone",
            sortable: true,
            render: (table) => (
                <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{table.zone || "General"}</span>
                </div>
            )
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
            render: (table) => <TableQRCell qrToken={table.qrToken} />
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
                subtitle="Configure and manage tables, zones, and QR ordering codes"
                columns={columns}
                data={filteredTables}
                isLoading={isLoading}
                error={error}
                
                searchable
                searchPlaceholder="Search table number, label, zone..."
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
