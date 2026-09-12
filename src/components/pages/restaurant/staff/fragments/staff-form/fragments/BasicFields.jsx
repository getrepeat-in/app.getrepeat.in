import { Input } from "@/components/ui/input";
import { User, Mail, KeyRound, Eye, EyeOff } from "lucide-react";

export function BasicFields({ formik, isEditMode, domain, showPassword, setShowPassword }) {
    return (
        <>
            <div className="relative group">
                <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Full Name</span>
                </div>
                <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50">
                    <div className="pl-3.5 flex items-center pointer-events-none shrink-0">
                        <User className="h-5 w-5 text-primary/90" />
                    </div>
                    <Input 
                        id="name"
                        placeholder="e.g. John Doe"
                        {...formik.getFieldProps("name")}
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 w-full"
                    />
                </div>
                {formik.touched.name && formik.errors.name && (
                    <p className="text-xs text-red-500 font-medium mt-1.5">{formik.errors.name}</p>
                )}
            </div>

            <div className="relative group">
                <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10 flex items-center gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Email Address</span>
                    {isEditMode && <span className="normal-case font-medium text-[10px] text-red-400">(Cannot be changed)</span>}
                </div>
                <div className={`relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md transition-all bg-white dark:bg-zinc-900/50 overflow-hidden ${!isEditMode ? 'focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary' : 'opacity-70'}`}>
                    <div className="pl-3.5 flex items-center pointer-events-none shrink-0">
                        <Mail className="h-5 w-5 text-primary/90" />
                    </div>
                    <Input 
                        id="emailPrefix"
                        placeholder="e.g. john.doe"
                        {...formik.getFieldProps("emailPrefix")}
                        disabled={isEditMode}
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 flex-1 min-w-[80px]"
                    />
                    <div 
                        className="inline-flex items-center px-3 sm:px-3.5 h-12 bg-gray-50 dark:bg-zinc-900 border-l border-gray-200 dark:border-gray-800 text-gray-500 dark:text-zinc-400 text-xs sm:text-sm font-medium shrink-0 max-w-[55%] min-w-0 select-none cursor-default"
                        title={`@${domain}`}
                    >
                        <span className="truncate">@{domain}</span>
                    </div>
                </div>
                {formik.touched.emailPrefix && formik.errors.emailPrefix && (
                    <p className="text-xs text-red-500 font-medium mt-1.5">{formik.errors.emailPrefix}</p>
                )}
            </div>

            {!isEditMode && (
                <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-950 z-10">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Password</span>
                    </div>
                    <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50 overflow-hidden">
                        <div className="pl-3.5 flex items-center pointer-events-none shrink-0">
                            <KeyRound className="h-5 w-5 text-primary/90" />
                        </div>
                        <Input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter secure password"
                            {...formik.getFieldProps("password")}
                            className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-sm sm:text-base px-3 w-full"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-4 h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors shrink-0"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <p className="text-xs text-red-500 font-medium mt-1.5">{formik.errors.password}</p>
                    )}
                </div>
            )}
        </>
    );
}
