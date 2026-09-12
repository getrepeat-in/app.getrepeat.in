"use client";

/** Reusable labelled form field wrapper */
export const Field = ({ label, icon: Icon, error, children }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {Icon && <Icon size={12} className="text-primary/90" />}
            {label}
        </label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

/** Styled input that matches the design system */
export const FormInput = ({ className = "", ...props }) => (
    <input
        className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-orange-400 transition-colors ${className}`}
        {...props}
    />
);

/** Simple pill-style toggle switch */
export const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        aria-checked={checked}
        role="switch"
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40
            ${checked ? "bg-primary/90" : "bg-gray-200 dark:bg-zinc-700"}`}
    >
        <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
        />
    </button>
);
