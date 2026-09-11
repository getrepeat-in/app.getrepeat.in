import { Shield, Loader2 } from "lucide-react";

export function RoleSelection({ formik, roles, rolesLoading }) {
    return (
        <div className="space-y-2.5 group">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 group-focus-within:text-orange-600 transition-colors">
                <Shield size={13} /> Assigned Role
            </label>
            
            {rolesLoading ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading roles...
                </div>
            ) : (
                <div className="flex flex-wrap gap-3">
                    {roles?.map(role => {
                        const isSelected = formik.values.role === role._id;
                        return (
                            <div 
                                key={role._id}
                                onClick={() => formik.setFieldValue("role", role._id)}
                                className={`relative flex items-center gap-2.5 px-3.5 py-2 w-fit rounded-lg border cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                        ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500 shadow-sm" 
                                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-orange-300 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex flex-col justify-center">
                                    <span className={`font-semibold text-sm ${isSelected ? "text-orange-700" : "text-gray-900"}`}>
                                        {role.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {formik.touched.role && formik.errors.role && (
                <p className="text-xs text-red-500 font-medium">{formik.errors.role}</p>
            )}
        </div>
    );
}
