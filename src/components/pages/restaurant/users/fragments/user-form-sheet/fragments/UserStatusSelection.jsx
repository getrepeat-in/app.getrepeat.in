import React from "react";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", activeClass: "bg-green-500 text-white border-green-500" },
  { value: "INACTIVE", label: "Inactive", activeClass: "bg-amber-500 text-white border-amber-500" },
  { value: "BLOCKED", label: "Blocked", activeClass: "bg-red-500 text-white border-red-500" },
];

export function UserStatusSelection({ formik }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Account Status
      </label>
      <div className="grid grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = formik.values.status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => formik.setFieldValue("status", opt.value)}
              className={`h-10 rounded-md border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? `${opt.activeClass} shadow-xs`
                  : "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {formik.touched.status && formik.errors.status && (
        <span className="text-[11px] font-semibold text-red-500">{formik.errors.status}</span>
      )}
    </div>
  );
}
