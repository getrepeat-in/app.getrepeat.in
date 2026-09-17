import React from "react";
import { Users } from "lucide-react";

export const STAFF_STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
  },
  SUSPENDED: {
    label: "Suspended",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
  },
  DISABLED: {
    label: "Disabled",
    dot: "bg-gray-400",
    badge:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export const STAFF_STATUS_FILTERS = [
  { label: "All Staff", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Disabled", value: "DISABLED" },
];

export const DEFAULT_PAGE_SIZE = 10;

export const STAFF_EMPTY_STATE = {
  title: "No Staff Found",
  description:
    "You haven't added any staff members yet. Add them to manage their roles and access.",
  icon: <Users size={28} className="text-gray-400 dark:text-zinc-600" />,
};
