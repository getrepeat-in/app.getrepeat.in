export * from "./validator";

export const getEmailPrefix = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.split("@")[0] || "";
};

export const getStaffInitialValues = (staff) => {
  const isEditMode = Boolean(staff);
  return {
    name: staff?.name || "",
    emailPrefix: isEditMode ? getEmailPrefix(staff?.email) : "",
    password: "",
    role: staff?.role?._id || staff?.role || "",
    status: staff?.status || "ACTIVE",
    image: staff?.image || null,
  };
};

export const buildStaffPayload = (values, { isEditMode, domain }) => {
  const fullEmail = `${values.emailPrefix}@${domain || "nearby.com"}`;
  return {
    name: values.name?.trim(),
    role: values.role,
    status: values.status,
    image: values.image?._id || values.image || null,
    ...(!isEditMode && {
      email: fullEmail,
      password: values.password,
    }),
  };
};
