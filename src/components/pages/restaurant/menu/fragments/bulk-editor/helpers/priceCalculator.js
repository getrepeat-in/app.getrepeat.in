export const roundPrice = (price, roundingOption) => {
    const p = Math.max(0, price);

    switch (roundingOption) {
        case "round_to_integer":
            return Math.round(p);
            
        case "nearest_9":
            return Math.round((p + 1) / 10) * 10 - 1;
            
        case "next_9":
            return Math.ceil((p + 1) / 10) * 10 - 1;
            
        case "no_rounding":
        default:
            return Math.max(0, Number(p.toFixed(2)));
    }
};

export const calculateNewPrice = (oldPrice, { action, type, value, roundingOption }) => {
    const val = Number(value);
    if (isNaN(val) || val <= 0) return oldPrice;

    const current = Number(oldPrice) || 0;
    let newPrice = current;

    if (action === "increase") {
        newPrice = type === "percentage" ? current * (1 + val / 100) : current + val;
    } else if (action === "decrease") {
        newPrice = type === "percentage" ? current * (1 - val / 100) : current - val;
    }

    return roundPrice(newPrice, roundingOption);
};

export const applyBulkMathToItems = ({ 
    items, 
    editedItems, 
    applyTo, 
    selectedItems, 
    selectedCats, 
    action, 
    type, 
    value, 
    roundingOption 
}) => {
    const nextEdited = { ...editedItems };

    items.forEach(item => {
        const itemId = String(item.id || item._id);
        const isSelected = applyTo === "entire_menu" || 
            (Array.isArray(selectedItems) ? selectedItems.includes(itemId) : selectedItems?.[itemId]) || 
            (selectedCats && (selectedCats[item.category] || selectedCats[item.category?._id]));

        if (!isSelected) return;

        const currentItemEdit = nextEdited[itemId] || {};
        const originalBasePrice = item.base_price;
        const originalVariants = item.variants || [];

        const currentVariants = currentItemEdit.variants 
            ? JSON.parse(JSON.stringify(currentItemEdit.variants)) 
            : JSON.parse(JSON.stringify(originalVariants));

        if (currentVariants && currentVariants.length > 0) {
            let minPrice = Infinity;
            currentVariants.forEach(variant => {
                if (Array.isArray(variant.options)) {
                    variant.options.forEach(opt => {
                        const newOptPrice = calculateNewPrice(opt.price, { action, type, value, roundingOption });
                        opt.price = newOptPrice;
                        if (newOptPrice < minPrice) {
                            minPrice = newOptPrice;
                        }
                    });
                }
            });

            const currentBase = Number(currentItemEdit.base_price ?? originalBasePrice) || 0;
            nextEdited[itemId] = {
                ...currentItemEdit,
                id: itemId,
                variants: currentVariants,
                base_price: minPrice !== Infinity ? minPrice : calculateNewPrice(currentBase, { action, type, value, roundingOption })
            };
        } else {
            const currentBasePrice = Number(currentItemEdit.base_price ?? originalBasePrice) || 0;
            nextEdited[itemId] = {
                ...currentItemEdit,
                id: itemId,
                base_price: calculateNewPrice(currentBasePrice, { action, type, value, roundingOption })
            };
        }
    });

    return nextEdited;
};
