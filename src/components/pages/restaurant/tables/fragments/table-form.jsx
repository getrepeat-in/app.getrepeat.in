"use client";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTable } from "@/store/hooks/useTable";
import { Field, FormInput, Toggle } from "../helpers/ui";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { TABLE_STATUS_OPTIONS, ZONE_SUGGESTIONS } from "../helpers/constants";
import { tableFormSchema, getTableInitialValues } from "../helpers/validators";
import { Loader2, TableProperties, Pencil, Hash, Users, Tag, Wifi, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function TableFormSheet({ isOpen, onClose, table }) {
    const { restaurantId } = useRestaurant();
    const { addTable, updateTable, isAdding, isUpdating } = useTable(restaurantId);

    const isEditMode = !!table;
    const isLoading = isAdding || isUpdating;

    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setIsVisible(true), 0);
            return () => clearTimeout(t);
        } else {
            const t = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: getTableInitialValues(table),
        validationSchema: tableFormSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                if (isEditMode) {
                    await updateTable({ tableId: table._id, data: values }, {
                        onSuccess: () => { resetForm(); onClose(); },
                    });
                } else {
                    await addTable(values, {
                        onSuccess: () => { resetForm(); onClose(); },
                    });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (!isVisible && !isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md bg-[#f8fafc] dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-0 flex flex-col h-full shadow-2xl">
                <div className="flex-1 overflow-y-auto">
                    <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                        <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isEditMode ? "bg-blue-100 text-blue-600" : "bg-primary/20 text-primary"}`}>
                                {isEditMode ? <Pencil size={16} /> : <TableProperties size={16} />}
                            </div>
                            {isEditMode ? "Edit Table" : "Add New Table"}
                        </SheetTitle>
                        <SheetDescription className="text-gray-500 mt-1 text-sm">
                            {isEditMode ? "Update this table's details and status." : "Fill in the details to create a new dine-in table."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="p-6 space-y-6">
                        <form onSubmit={formik.handleSubmit} className="space-y-5">
                            <Field label="Zone" icon={MapPin} error={formik.touched.zone && formik.errors.zone}>
                                <div className="space-y-2">
                                    <FormInput
                                        type="text"
                                        name="zone"
                                        placeholder="e.g. AC, Non-AC, Rooftop…"
                                        value={formik.values.zone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {ZONE_SUGGESTIONS.map((z) => (
                                            <button
                                                type="button"
                                                key={z}
                                                onClick={() => formik.setFieldValue("zone", z)}
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all
                                                    ${formik.values.zone === z
                                                        ? "bg-primary/90 text-white border-orange-500"
                                                        : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:border-orange-300 hover:text-primary"
                                                    }`}
                                            >
                                                {z}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Table No." icon={Hash} error={formik.touched.tableNumber && formik.errors.tableNumber}>
                                    <FormInput
                                        type="number"
                                        name="tableNumber"
                                        placeholder="e.g. 1"
                                        value={formik.values.tableNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={isEditMode}
                                        className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
                                    />
                                </Field>
                                <Field label="Capacity" icon={Users} error={formik.touched.capacity && formik.errors.capacity}>
                                    <FormInput
                                        type="number"
                                        name="capacity"
                                        placeholder="4"
                                        min={1} max={50}
                                        value={formik.values.capacity}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </Field>
                            </div>

                            <Field label="Label (optional)" icon={Tag} error={formik.touched.label && formik.errors.label}>
                                <FormInput
                                    type="text"
                                    name="label"
                                    placeholder="e.g. Window Table, VIP, Corner..."
                                    value={formik.values.label}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </Field>

                            {isEditMode && (
                                <Field label="Status" icon={Wifi}>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TABLE_STATUS_OPTIONS.map((s) => (
                                            <button
                                                type="button"
                                                key={s.value}
                                                onClick={() => formik.setFieldValue("status", s.value)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                                                    ${formik.values.status === s.value
                                                        ? "border-orange-500 bg-primary/10 dark:bg-orange-950 text-primary dark:text-orange-300"
                                                        : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                                    }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            )}

                            {isEditMode && (
                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Table Active</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Inactive tables are hidden from the floor view</p>
                                    </div>
                                    <Toggle
                                        checked={formik.values.isActive}
                                        onChange={() => formik.setFieldValue("isActive", !formik.values.isActive)}
                                    />
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1 h-11 font-medium border-gray-200">
                            Cancel
                        </Button>
                        <Button
                            onClick={formik.handleSubmit}
                            disabled={isLoading}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? "Saving..." : "Creating..."}</>
                            ) : (
                                isEditMode ? "Save Changes" : "Create Table"
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
