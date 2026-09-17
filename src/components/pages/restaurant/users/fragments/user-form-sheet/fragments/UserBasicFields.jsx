import React from "react";
import { User, Phone, Lock, Key, Eye, EyeOff } from "lucide-react";

export function UserBasicFields({
  formik,
  isEditMode,
  showPassword,
  setShowPassword,
  isResettingPassword,
  setIsResettingPassword,
}) {
  return (
    <>
      <div className="relative border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 bg-white dark:bg-zinc-900 mt-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all">
        <span className="absolute -top-2.5 left-4 px-1.5 bg-[#f8fafc] dark:bg-zinc-950 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Full Name
        </span>
        <User className="text-primary/90 w-5 h-5 shrink-0" />
        <input
          type="text"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 p-0 focus:ring-0"
          placeholder="Customer Name"
        />
        {formik.touched.name && formik.errors.name && (
          <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">
            {formik.errors.name}
          </span>
        )}
      </div>

      <div className="relative border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 bg-white dark:bg-zinc-900 mt-6 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all">
        <span className="absolute -top-2.5 left-4 px-1.5 bg-[#f8fafc] dark:bg-zinc-950 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Phone Number
        </span>
        <Phone className="text-primary/90 w-5 h-5 shrink-0" />
        <input
          type="text"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 p-0 focus:ring-0"
          placeholder="9876543210"
          maxLength={10}
        />
        {formik.touched.phone && formik.errors.phone && (
          <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">
            {formik.errors.phone}
          </span>
        )}
      </div>

      <div className="relative border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 bg-white dark:bg-zinc-900 mt-6 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all">
        <span className="absolute -top-2.5 left-4 px-1.5 bg-[#f8fafc] dark:bg-zinc-950 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Password{" "}
          {isEditMode && !isResettingPassword && (
            <span className="text-red-500 font-medium normal-case">(Cannot be changed)</span>
          )}
        </span>
        <Lock className="text-primary/90 w-5 h-5 shrink-0" />
        <input
          type={(!isEditMode || isResettingPassword) && showPassword ? "text" : "password"}
          name="password"
          value={isEditMode && !isResettingPassword ? "••••••••" : formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isEditMode && !isResettingPassword}
          className="w-full bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 p-0 focus:ring-0 disabled:text-gray-400 dark:disabled:text-gray-500"
          placeholder="••••••••"
        />
        {isEditMode && !isResettingPassword ? (
          <button
            type="button"
            onClick={() => setIsResettingPassword(true)}
            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
          >
            <Key size={10} />
            Reset
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {(!isEditMode || isResettingPassword) && formik.touched.password && formik.errors.password && (
          <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">
            {formik.errors.password}
          </span>
        )}
      </div>
    </>
  );
}
