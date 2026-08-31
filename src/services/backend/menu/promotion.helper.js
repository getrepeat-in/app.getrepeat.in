const isPromotionActive = (promo, now = new Date()) => {
    const isStarted = !promo.starts_at || new Date(promo.starts_at) <= now;
    const isNotEnded = !promo.ends_at || new Date(promo.ends_at) >= now;
    return promo.status === "ACTIVE" && isStarted && isNotEnded;
};

const doesPromotionApplyToItem = (promo, item) => {
    if (!promo.items || promo.items.length === 0) return false;
    return promo.items.some(id => id.toString() === item._id.toString());
};

const calculateDiscountAmount = (promo, basePrice) => {
    const discountCalculators = {
        "FLAT": () => promo.discount_value,
        "PERCENTAGE": () => (basePrice * promo.discount_value) / 100
    };

    return discountCalculators[promo.discount_type]?.() ?? 0;
};

export const applyPromotionsToItems = (items, activePromotions) => {
    const now = new Date();
    const validPromotions = activePromotions.filter(promo => isPromotionActive(promo, now));

    return items.map(item => {
        const basePrice = item.base_price || 0;
        const bestDiscount = validPromotions
            .filter(promo => doesPromotionApplyToItem(promo, item))
            .map(promo => ({
                promo,
                discountAmount: calculateDiscountAmount(promo, basePrice)
            }))
            .filter(({ discountAmount }) => discountAmount > 0 && discountAmount < basePrice)
            .reduce((max, current) => (current.discountAmount > max.discountAmount ? current : max), { promo: null, discountAmount: 0 });

        if (bestDiscount.promo) {
            return {
                ...item,
                discounted_price: Math.max(0, Math.floor(basePrice - bestDiscount.discountAmount)),
                applied_promotion: {
                    name: bestDiscount.promo.name,
                    discount_type: bestDiscount.promo.discount_type,
                    discount_value: bestDiscount.promo.discount_value
                }
            };
        }

        return item;
    });
};
