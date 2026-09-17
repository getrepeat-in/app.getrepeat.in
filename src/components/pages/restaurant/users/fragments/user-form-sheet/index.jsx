"use client";
import { useFormik } from "formik";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/store/hooks/useUsers";
import React, { useEffect, useState } from "react";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { UserBasicFields, UserStatusSelection } from "./fragments";
import { AvatarUpload } from "@/components/pages/restaurant/staff/fragments";
import { getUserInitialValues, buildUserPayload, getUserValidationSchema } from "./helper";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function UserFormSheet({ isOpen, onClose, user }) {
  const notification = useNotification();
  const { restaurantId } = useRestaurant();
  const { addUser, updateUser, isAdding, isUpdating } = useUsers(restaurantId);

  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = Boolean(user);
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
    initialValues: getUserInitialValues(user),
    validationSchema: getUserValidationSchema(isEditMode, isResettingPassword),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = buildUserPayload(values, { isEditMode, isResettingPassword });

        if (isEditMode) {
          await updateUser(
            { userId: user._id, data: payload },
            {
              onSuccess: () => {
                resetForm();
                onClose();
              },
            }
          );
        } else {
          await addUser(payload, {
            onSuccess: () => {
              resetForm();
              onClose();
            },
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
        key: data?.key || data?.data?.key,
      });
      notification.success("Profile image uploaded successfully!", { duration: 3000 });
    } catch (error) {
      notification.error(
        error?.response?.data?.message || error?.message || "Failed to upload image",
        { duration: 3000 }
      );
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
              {isEditMode
                ? "Modify details and account status for this customer."
                : "Create a new customer account manually."}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-7">
              <AvatarUpload
                formik={formik}
                isUploading={isUploading}
                handleImageUpload={handleImageUpload}
              />

              <UserBasicFields
                formik={formik}
                isEditMode={isEditMode}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isResettingPassword={isResettingPassword}
                setIsResettingPassword={setIsResettingPassword}
              />

              <UserStatusSelection formik={formik} />
            </form>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="flex-1 h-11 font-medium border-gray-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={formik.handleSubmit}
              disabled={isLoading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
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
