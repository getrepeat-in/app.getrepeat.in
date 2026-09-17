import React from "react";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffProfileCell, StaffRoleBadge, StaffStatusBadge } from "./badges";

export const getStaffColumns = ({ onEdit, onDelete }) => [
  {
    header: "Profile",
    key: "name",
    sortable: true,
    render: (staff) => <StaffProfileCell staff={staff} />,
  },
  {
    header: "Role & Permissions",
    key: "role.name",
    render: (staff) => <StaffRoleBadge role={staff.role} />,
  },
  {
    header: "Account Status",
    key: "status",
    align: "center",
    render: (staff) => <StaffStatusBadge status={staff.status} />,
  },
  {
    header: "Joined",
    key: "createdAt",
    sortable: true,
    render: (staff) => (
      <div>
        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
          {staff.createdAt ? format(new Date(staff.createdAt), "MMM dd, yyyy") : "-"}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
          {staff.createdAt ? format(new Date(staff.createdAt), "hh:mm a") : "-"}
        </div>
      </div>
    ),
  },
  {
    header: "Actions",
    key: "actions",
    align: "right",
    width: "80px",
    render: (staff) => (
      <div className="flex justify-end items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(staff);
          }}
          className="rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 cursor-pointer"
          title="Edit Staff"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(staff);
          }}
          className="rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-red-500 cursor-pointer"
          title="Delete Staff"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    ),
  },
];
