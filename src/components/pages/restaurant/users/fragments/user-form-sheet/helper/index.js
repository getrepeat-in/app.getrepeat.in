export * from "./validator";

export const getUserInitialValues = (user) => ({
  name: user?.name || "",
  phone: user?.phone || "",
  status: user?.status || "ACTIVE",
  password: "",
  image: user?.image || null,
});

export const buildUserPayload = (values, { isEditMode, isResettingPassword }) => {
  const payload = {
    name: values.name?.trim(),
    phone: values.phone?.trim(),
    status: values.status,
    image: values.image?._id || values.image || null,
  };

  if (!isEditMode) {
    payload.password = values.password;
  } else if (isResettingPassword && values.password) {
    payload.password = values.password;
  }

  return payload;
};
