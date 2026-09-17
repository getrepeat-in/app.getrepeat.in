import * as Yup from "yup";

export const onboardingValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Must be at least 2 characters")
    .max(100, "Must be 100 characters or less")
    .required("Restaurant name is required"),
  slug: Yup.string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers, and hyphens (e.g. my-restaurant)")
    .max(120, "Must be 120 characters or less")
    .required("Unique slug is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\+?[0-9\s-]{10,20}$/, "Please enter a valid phone number (10-20 digits)")
    .required("Phone number is required"),
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email address is required"),
});

