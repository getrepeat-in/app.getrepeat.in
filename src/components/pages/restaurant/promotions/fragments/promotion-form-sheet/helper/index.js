export const getInitialFormData = (promotion) => ({
    type: promotion?.type || "ITEM_DISCOUNT",
    name: promotion?.name || "",
    discount_type: promotion?.discount_type || "PERCENTAGE",
    discount_value: promotion?.discount_value || "",
    items: promotion?.items?.map(i => i._id || i) || [],
    status: promotion?.status || "ACTIVE",
    starts_at: promotion?.starts_at 
        ? new Date(promotion.starts_at).toISOString().split('T')[0] 
        : (promotion ? "" : new Date().toISOString().split('T')[0]),
    ends_at: promotion?.ends_at ? new Date(promotion.ends_at).toISOString().split('T')[0] : "",
    usage_limit: promotion?.usage_limit || "",
    per_user_limit: promotion?.per_user_limit || "",
    min_order_value: promotion?.min_order_value || ""
});

export const preparePayload = (formData) => {
    const payload = {
        type: formData.type,
        name: formData.name,
        items: formData.items,
        status: formData.status
    };

    if (formData.type === "ITEM_DISCOUNT" || formData.type === "BESTSELLER") {
        payload.discount_type = formData.discount_type;
        payload.discount_value = Number(formData.discount_value);
    }

    if (formData.type === "FREEBIE") {
        payload.min_order_value = Number(formData.min_order_value);
    }

    if (formData.starts_at) payload.starts_at = new Date(formData.starts_at);
    if (formData.ends_at) payload.ends_at = new Date(formData.ends_at);
    if (formData.usage_limit) payload.usage_limit = Number(formData.usage_limit);
    if (formData.per_user_limit) payload.per_user_limit = Number(formData.per_user_limit);

    return payload;
};
