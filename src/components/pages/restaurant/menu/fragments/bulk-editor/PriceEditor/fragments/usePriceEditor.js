import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { MenuService } from "@/services/frontend/menu";
import useNotification from "@/store/hooks/useNotification";

export function usePriceEditor(restaurantId) {
    const [editedItems, setEditedItems] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const notification = useNotification();
    const queryClient = useQueryClient();

    const handleSave = async () => {
        const payload = Object.values(editedItems);
        if (payload.length === 0) {
            notification.error("No changes to save.");
            return;
        }

        setIsSaving(true);
        try {
            await MenuService.bulkUpdatePrice(restaurantId, { items: payload });
            notification.success("Prices updated successfully in bulk!");
            setEditedItems({});
            queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
        } catch (err) {
            console.error("Save error:", err);
            notification.error(err?.response?.data?.message || "Failed to update prices.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBasePriceChange = (itemId, value) => {
        setEditedItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                id: itemId,
                base_price: Number(value)
            }
        }));
    };

    const handleVariantPriceChange = (itemId, originalVariants, vIndex, oIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].options[oIndex].price = Number(value);
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleAddVariant = (itemId, originalVariants) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants.push({ property_name: "Size", options: [{ name: "Regular", price: 0 }] });
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleAddOption = (itemId, originalVariants, vIndex) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants[vIndex].options.push({ name: "New Option", price: 0 });
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleRemoveOption = (itemId, originalVariants, vIndex, oIndex) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            const newVariants = itemUpdate.variants 
                ? JSON.parse(JSON.stringify(itemUpdate.variants)) 
                : JSON.parse(JSON.stringify(originalVariants || []));
            newVariants[vIndex].options.splice(oIndex, 1);
            if (newVariants[vIndex].options.length === 0) {
                newVariants.splice(vIndex, 1);
            }
            itemUpdate.variants = newVariants;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleRemoveAllVariants = (itemId) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            itemUpdate.variants = [];
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const [copiedVariants, setCopiedVariants] = useState(null);

    const handleCopyVariants = (variants) => {
        if (!variants || variants.length === 0) return;
        setCopiedVariants(JSON.parse(JSON.stringify(variants)));
        notification.success("Variants structure copied!");
    };

    const handlePasteVariants = (itemId) => {
        if (!copiedVariants) return;
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            itemUpdate.variants = JSON.parse(JSON.stringify(copiedVariants));
            return { ...prev, [itemId]: itemUpdate };
        });
        notification.success("Variants pasted successfully!");
    };

    const handleVariantGroupNameChange = (itemId, originalVariants, vIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].property_name = value;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const handleVariantOptionNameChange = (itemId, originalVariants, vIndex, oIndex, value) => {
        setEditedItems(prev => {
            const itemUpdate = prev[itemId] ? { ...prev[itemId] } : { id: itemId };
            if (!itemUpdate.variants) {
                itemUpdate.variants = JSON.parse(JSON.stringify(originalVariants || []));
            } else {
                itemUpdate.variants = JSON.parse(JSON.stringify(itemUpdate.variants));
            }
            itemUpdate.variants[vIndex].options[oIndex].name = value;
            return { ...prev, [itemId]: itemUpdate };
        });
    };

    const applyBulkPriceUpdate = ({ applyTo, selectedCats, selectedItems, action, type, value, roundingOption, items }) => {
        const val = Number(value);
        if (isNaN(val) || val <= 0) return;

        const roundPrice = (price, option) => {
            const p = Math.max(0, price);
            if (option === "round_to_integer") {
                return Math.round(p);
            }
            if (option === "nearest_9") {
                const lower = Math.floor(p / 10) * 10 - 1;
                const upper = Math.floor(p / 10) * 10 + 9; 
                return Math.abs(p - lower) <= Math.abs(upper - p) ? Math.max(0, lower) : upper;
            }
            if (option === "next_9") {
                const remainder = Math.round(p) % 10;
                if (remainder === 9) return Math.round(p);
                const distToNext = (9 - remainder + 10) % 10 || 10;
                return Math.round(p) + distToNext;
            }
            return Math.max(0, Number(p.toFixed(2)));
        };

        const calculateNewPrice = (oldPrice) => {
            let newPrice = oldPrice;
            if (action === "increase") {
                newPrice = type === "percentage" ? oldPrice * (1 + val / 100) : oldPrice + val;
            } else {
                newPrice = type === "percentage" ? oldPrice * (1 - val / 100) : oldPrice - val;
            }
            return roundPrice(newPrice, roundingOption);
        };

        setEditedItems(prev => {
            const nextEdited = { ...prev };

            items.forEach(item => {
                const itemId = String(item.id || item._id);
                const isSelected = applyTo === "entire_menu" || 
                    (Array.isArray(selectedItems) ? selectedItems.map(String).includes(itemId) : selectedItems?.[itemId]) || 
                    (selectedCats && (selectedCats[item.category] || selectedCats[item.category?._id]));

                if (!isSelected) return;

                const currentItemEdit = nextEdited[item.id] || {};
                const originalBasePrice = item.base_price;
                const originalVariants = item.variants || [];

                const currentVariants = currentItemEdit.variants 
                    ? JSON.parse(JSON.stringify(currentItemEdit.variants)) 
                    : JSON.parse(JSON.stringify(originalVariants));

                if (currentVariants && currentVariants.length > 0) {
                    let minPrice = Infinity;
                    currentVariants.forEach(variant => {
                        if (variant.options) {
                            variant.options.forEach(opt => {
                                const newOptPrice = calculateNewPrice(Number(opt.price) || 0);
                                opt.price = newOptPrice;
                                if (newOptPrice < minPrice) {
                                    minPrice = newOptPrice;
                                }
                            });
                        }
                    });

                    nextEdited[item.id] = {
                        ...currentItemEdit,
                        id: item.id,
                        variants: currentVariants,
                        base_price: minPrice !== Infinity ? minPrice : calculateNewPrice(Number(currentItemEdit.base_price ?? originalBasePrice) || 0)
                    };
                } else {
                    const currentBasePrice = Number(currentItemEdit.base_price ?? originalBasePrice) || 0;
                    nextEdited[item.id] = {
                        ...currentItemEdit,
                        id: item.id,
                        base_price: calculateNewPrice(currentBasePrice)
                    };
                }
            });

            return nextEdited;
        });
    };

    return {
        editedItems,
        isSaving,
        handleSave,
        handleBasePriceChange,
        handleVariantPriceChange,
        handleAddVariant,
        handleAddOption,
        handleRemoveOption,
        handleRemoveAllVariants,
        applyBulkPriceUpdate,
        copiedVariants,
        handleCopyVariants,
        handlePasteVariants,
        handleVariantGroupNameChange,
        handleVariantOptionNameChange
    };
}
