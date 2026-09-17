"use client";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRole } from "@/store/hooks/useRole";
import { useStaff } from "@/store/hooks/useStaff";
import { User, Shield, Loader2 } from "lucide-react";
import { UploadService } from "@/services/frontend/upload";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { RestaurantService } from "@/services/frontend/restaurant";
import { AvatarUpload, BasicFields, RoleSelection, StatusSelection } from "./fragments";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getStaffInitialValues, buildStaffPayload, staffValidationSchema, staffUpdateValidationSchema } from "./helper";

export default function StaffFormSheet({ isOpen, onClose, staff }) {
  const notification = useNotification();
  const { restaurantId } = useRestaurant();
  const { addStaff, updateStaff, isAdding, isUpdating } = useStaff(restaurantId);
  const { roles, isLoading: rolesLoading } = useRole(restaurantId);

  const { data: restaurantData } = useQuery({
    queryKey: ["restaurant-details", restaurantId],
    queryFn: () => RestaurantService.getRestaurantById(restaurantId),
    enabled: Boolean(restaurantId),
  });

  const domain = restaurantData?.data?.domain || restaurantData?.domain || "nearby.com";
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = Boolean(staff);
  const isLoading = isAdding || isUpdating;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getStaffInitialValues(staff),
    validationSchema: isEditMode ? staffUpdateValidationSchema : staffValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = buildStaffPayload(values, { isEditMode, domain });

        if (isEditMode) {
          await updateStaff(
            { staffId: staff._id, data: payload },
            {
              onSuccess: () => {
                resetForm();
                onClose();
              },
            }
          );
        } else {
          await addStaff(payload, {
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
      formData.append("path", "staff-profiles");

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-[#f8fafc] dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-0 flex flex-col h-full shadow-2xl">
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="px-6 py-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
            <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {isEditMode ? (
                <>
                  <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  Update Staff Member
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-md bg-primary/20 text-primary flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  Add New Staff
                </>
              )}
            </SheetTitle>
            <SheetDescription className="text-gray-500 mt-1">
              {isEditMode
                ? "Modify details and permissions for this user."
                : "Create a new user account with specific permissions."}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-7">
              <AvatarUpload
                formik={formik}
                isUploading={isUploading}
                handleImageUpload={handleImageUpload}
              />

              <BasicFields
                formik={formik}
                isEditMode={isEditMode}
                domain={domain}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />

              <RoleSelection
                formik={formik}
                roles={roles}
                rolesLoading={rolesLoading}
              />

              <StatusSelection formik={formik} />
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
