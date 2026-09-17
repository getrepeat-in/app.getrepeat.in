import React from "react";
import { Users } from "lucide-react";

export const USER_STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  },
  BLOCKED: {
    label: "Blocked",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
  },
};

export const USER_STATUS_FILTERS = [
  { label: "All Customers", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
];

export const DEFAULT_PAGE_SIZE = 10;

export const USER_EMPTY_STATE = {
  title: "No Customers Found",
  description: "You haven't got any registered customers yet.",
  icon: <Users size={28} className="text-gray-400 dark:text-zinc-600" />,
};
