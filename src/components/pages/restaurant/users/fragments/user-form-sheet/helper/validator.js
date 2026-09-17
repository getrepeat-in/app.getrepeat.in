import * as Yup from "yup";

export const getUserValidationSchema = (isEditMode, isResettingPassword) =>
  Yup.object({
    name: Yup.string().required("Name is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .length(10, "Phone number must be exactly 10 digits")
      .required("Phone is required"),
    status: Yup.string()
      .oneOf(["ACTIVE", "INACTIVE", "BLOCKED"])
      .required("Status is required"),
    ...((!isEditMode || isResettingPassword) && {
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
  });
