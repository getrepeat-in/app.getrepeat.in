import { PromotionNameCell, PromotionTypeCell, PromotionStatusCell, PromotionActionsCell, PromotionDiscountCell, PromotionDateCell, PromotionUsageCell, PromotionTargetCell } from "../fragments/TableCells";

export const getPromotionsTableColumns = (onEdit, onDelete) => [
    {
        key: "sno",
        header: "S.No",
        render: (_, index) => <span className="text-[13px] font-bold text-slate-400 w-8 inline-block">{String(index + 1).padStart(2, '0')}</span>,
    },
    {
        key: "name",
        header: "Promotion",
        render: (row) => <PromotionNameCell promotion={row} />,
    },
    {
        key: "type",
        header: "Type",
        render: (row) => <PromotionTypeCell promotion={row} />,
    },
    {
        key: "target",
        header: "Applies To",
        render: (row) => <PromotionTargetCell promotion={row} />,
    },
    {
        key: "discount_value",
        header: "Discount",
        render: (row) => <PromotionDiscountCell promotion={row} />,
    },
    {
        key: "dates",
        header: "Active Dates",
        render: (row) => <PromotionDateCell promotion={row} />,
    },
    {
        key: "status",
        header: "Status",
        render: (row) => <PromotionStatusCell promotion={row} />,
    },
    {
        key: "actions",
        header: "Action",
        render: (row) => <PromotionActionsCell promotion={row} onEdit={onEdit} onDelete={onDelete} />,
        align: "right",
    },
];
