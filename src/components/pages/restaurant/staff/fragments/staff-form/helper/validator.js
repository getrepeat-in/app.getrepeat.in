import * as Yup from "yup";

export const staffValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    emailPrefix: Yup.string().required("Email prefix is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: Yup.string().required("Role is required"),
    status: Yup.string().required("Status is required")
});

export const staffUpdateValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    role: Yup.string().required("Role is required"),
    status: Yup.string().required("Status is required")
});