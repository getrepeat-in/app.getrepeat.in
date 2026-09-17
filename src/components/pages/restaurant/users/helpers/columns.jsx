import React from "react";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileCell, UserStatusBadge } from "./badges";

export const getUserColumns = ({ onEdit, onDelete }) => [
  {
    header: "Profile",
    key: "name",
    sortable: true,
    render: (user) => <UserProfileCell user={user} />,
  },
  {
    header: "Account Status",
    key: "status",
    align: "center",
    render: (user) => <UserStatusBadge status={user.status} />,
  },
  {
    header: "Joined",
    key: "createdAt",
    sortable: true,
    render: (user) => (
      <div>
        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
          {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "-"}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
          {user.createdAt ? format(new Date(user.createdAt), "hh:mm a") : "-"}
        </div>
      </div>
    ),
  },
  {
    header: "Actions",
    key: "actions",
    align: "right",
    width: "80px",
    render: (user) => (
      <div className="flex justify-end items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(user);
          }}
          className="rounded-md hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 cursor-pointer"
          title="Edit Customer"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(user);
          }}
          className="rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-red-500 cursor-pointer"
          title="Delete Customer"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    ),
  },
];
