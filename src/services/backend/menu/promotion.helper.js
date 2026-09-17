const isPromotionActive = (promo, now = new Date()) => {
    const isStarted = !promo.starts_at || new Date(promo.starts_at) <= now;
    const isNotEnded = !promo.ends_at || new Date(promo.ends_at) >= now;
    return promo.status === "ACTIVE" && isStarted && isNotEnded;
};

const calculateDiscountAmount = (promo, basePrice) => {
    if (promo.discount_type === "FLAT") {
        return promo.discount_value || 0;
    }
    if (promo.discount_type === "PERCENTAGE") {
        return ((basePrice || 0) * (promo.discount_value || 0)) / 100;
    }
    return 0;
};

export const applyPromotionsToItems = (items, activePromotions) => {
    if (!items || items.length === 0) return [];
    if (!activePromotions || activePromotions.length === 0) return items;

    const now = new Date();
    const validPromotions = activePromotions.filter(promo => isPromotionActive(promo, now));

    if (validPromotions.length === 0) return items;

    const preparedPromos = validPromotions.map(promo => ({
        ...promo,
        itemSet: new Set((promo.items || []).map(id => (id && id._id ? id._id.toString() : id?.toString())))
    }));

    return items.map(item => {
        if (!item || !item._id) return item;
        const itemId = item._id.toString();
        const basePrice = item.base_price || 0;

        let bestDiscount = null;
        let maxDiscountAmount = 0;

        for (const promo of preparedPromos) {
            if (promo.itemSet.has(itemId)) {
                const discountAmount = calculateDiscountAmount(promo, basePrice);
                if (discountAmount > maxDiscountAmount && discountAmount < basePrice) {
                    maxDiscountAmount = discountAmount;
                    bestDiscount = promo;
                }
            }
        }

        if (bestDiscount) {
            return {
                ...item,
                discounted_price: Math.max(0, Math.floor(basePrice - maxDiscountAmount)),
                applied_promotion: {
                    name: bestDiscount.name,
                    discount_type: bestDiscount.discount_type,
                    discount_value: bestDiscount.discount_value
                }
            };
        }

        return item;
    });
};

