export function StatusSelection({ formik }) {
    return (
        <div className="space-y-2 group">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Status</label>
            <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-900/80 border border-gray-200/50 dark:border-zinc-800 rounded-lg">
                <button
                    type="button"
                    onClick={() => formik.setFieldValue("status", "ACTIVE")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        formik.values.status === "ACTIVE"
                            ? "bg-green-500 text-white shadow-sm ring-1 ring-gray-900/5"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Active
                </button>
                <button
                    type="button"
                    onClick={() => formik.setFieldValue("status", "DISABLED")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        formik.values.status === "DISABLED"
                            ? "bg-red-500 text-white shadow-sm ring-1 ring-gray-900/5"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Disabled
                </button>
                <button
                    type="button"
                    onClick={() => formik.setFieldValue("status", "SUSPENDED")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                        formik.values.status === "SUSPENDED"
                            ? "bg-orange-500 text-white shadow-sm ring-1 ring-gray-900/5"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Suspended
                </button>
            </div>
        </div>
    );
}
