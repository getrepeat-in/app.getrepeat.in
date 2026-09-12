import { STATUS_OPTIONS } from "../helper/constants";

export const StatusSelection = ({ formData, handleSelectChange }) => {
    return (
        <div className="space-y-6 mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
            <div className="relative group">
                <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Promotion Status</span>
                </div>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-zinc-900/50 p-1">
                    {STATUS_OPTIONS.map(status => {
                        const isActive = formData.status === status.value;
                        let activeBg = "bg-white text-gray-900";
                        if (isActive) {
                            if (status.value === "ACTIVE") activeBg = "bg-[#00c950] text-white shadow-sm ring-1 ring-[#00c950]/50";
                            else if (status.value === "INACTIVE") activeBg = "bg-slate-500 text-white shadow-sm ring-1 ring-slate-500/50";
                            else activeBg = "bg-primary/90 text-white shadow-sm ring-1 ring-primary/50";
                        }
                        
                        return (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => handleSelectChange("status", status.value)}
                                className={`flex-1 py-2 px-3 text-[14px] font-semibold rounded-md transition-all ${
                                    isActive
                                        ? activeBg
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50"
                                }`}
                            >
                                {status.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
