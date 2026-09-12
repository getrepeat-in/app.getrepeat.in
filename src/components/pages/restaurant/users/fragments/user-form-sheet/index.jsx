"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/store/hooks/useUsers";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { User, Loader2, Eye, EyeOff, Key, Phone, Lock } from "lucide-react";
import { AvatarUpload } from "@/components/pages/restaurant/staff/fragments";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const getValidationSchema = (isEditMode, isResettingPassword) => Yup.object({
    name: Yup.string().required("Name is required"),
    phone: Yup.string().matches(/^[0-9]+$/, "Phone number must contain only digits").length(10, "Phone number must be exactly 10 digits").required("Phone is required"),
    status: Yup.string().oneOf(["ACTIVE", "INACTIVE", "BLOCKED"]).required("Status is required"),
    ...((!isEditMode || isResettingPassword) && {
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
    })
});

export default function UserFormSheet({ isOpen, onClose, user }) {
    const notification = useNotification();
    const { restaurantId } = useRestaurant();
    const { addUser, updateUser, isAdding, isUpdating } = useUsers(restaurantId);

    const [isVisible, setIsVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const isEditMode = !!user;
    const isLoading = isAdding || isUpdating;

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsResettingPassword(false);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsResettingPassword(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: user?.name || "",
            phone: user?.phone || "",
            status: user?.status || "ACTIVE",
            password: "",
            image: user?.image || null,
        },
        validationSchema: getValidationSchema(isEditMode, isResettingPassword),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                if (isEditMode) {
                    const payload = {
                        name: values.name,
                        phone: values.phone,
                        status: values.status,
                        image: values.image?._id || values.image || null
                    };
                    if (isResettingPassword) {
                        payload.password = values.password;
                    }
                    await updateUser({ 
                        userId: user._id, 
                        data: payload
                    }, {
                        onSuccess: () => {
                            resetForm();
                            onClose();
                        }
                    });
                } else {
                    await addUser({
                        name: values.name,
                        phone: values.phone,
                        status: values.status,
                        password: values.password,
                        image: values.image?._id || values.image || null
                    }, {
                        onSuccess: () => {
                            resetForm();
                            onClose();
                        }
                    });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "user-profiles");

            const data = await UploadService.uploadFile(formData, restaurantId);
            formik.setFieldValue("image", {
                _id: data?.imageId || data?.data?.imageId,
                key: data?.key || data?.data?.key
            });
            notification.success("Profile image uploaded successfully!", { duration: 3000 });
        } catch (error) {
            notification.error(error?.response?.data?.message || error?.message || "Failed to upload image", { duration: 3000 });
        } finally {
            setIsUploading(false);
        }
    };

    if (!isVisible && !isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md bg-[#f8fafc] dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-0 flex flex-col h-full shadow-2xl">
                <div className="flex-1 overflow-y-auto">
                    <SheetHeader className="px-6 py-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                        <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                <User size={18} />
                            </div>
                            {isEditMode ? "Update Customer Profile" : "Add New Customer"}
                        </SheetTitle>
                        <SheetDescription className="text-gray-500 mt-1">
                            {isEditMode ? "Modify details and account status for this customer." : "Create a new customer account manually."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="p-6">
                        <form onSubmit={formik.handleSubmit} className="space-y-7">
                            <AvatarUpload 
                                formik={formik}
                                isUploading={isUploading}
                                handleImageUpload={handleImageUpload}
                            />

                            {/* Name Field */}
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
                                    <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">{formik.errors.name}</span>
                                )}
                            </div>

                            {/* Phone Field */}
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
                                    <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">{formik.errors.phone}</span>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="relative border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 bg-white dark:bg-zinc-900 mt-6 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all">
                                <span className="absolute -top-2.5 left-4 px-1.5 bg-[#f8fafc] dark:bg-zinc-950 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Password {isEditMode && !isResettingPassword && <span className="text-red-500 font-medium normal-case">(Cannot be changed)</span>}
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
                                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs shrink-0"
                                    >
                                        <Key size={10} />
                                        Reset
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-655 focus:outline-none shrink-0"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                )}
                                {(!isEditMode || isResettingPassword) && formik.touched.password && formik.errors.password && (
                                    <span className="absolute -bottom-5 left-1 text-[11px] font-semibold text-red-500">{formik.errors.password}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Account Status
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["ACTIVE", "INACTIVE", "BLOCKED"].map((statusOption) => {
                                        const isSelected = formik.values.status === statusOption;
                                        return (
                                            <button
                                                key={statusOption}
                                                type="button"
                                                onClick={() => formik.setFieldValue("status", statusOption)}
                                                className={`h-11 rounded-md border text-xs font-bold transition-all ${
                                                    isSelected
                                                        ? statusOption === "ACTIVE"
                                                            ? "bg-green-500 text-white border-green-500"
                                                            : statusOption === "INACTIVE"
                                                            ? "bg-amber-500 text-white border-amber-500"
                                                            : "bg-red-500 text-white border-red-500"
                                                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-800"
                                                }`}
                                            >
                                                {statusOption}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </form>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="flex-1 h-11 font-medium border-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={formik.handleSubmit}
                            disabled={isLoading || isUploading}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <>{isEditMode ? "Save Changes" : "Create Account"}</>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
