"use client";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { useItem } from "@/store/hooks/useItem";
import React, { useState, useMemo } from "react";
import { BulkTable } from "../shared/bulk-table";
import { Loader2, Undo2, Save, Sparkles } from "lucide-react";
import { MenuService } from "@/services/frontend/menu";
import { useQueryClient } from "@tanstack/react-query";
import { useCategory } from "@/store/hooks/useCategory";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { getDescriptionColumns } from "./fragments/description-columns";

export function DescriptionEditor() {
  const { restaurantId } = useRestaurant();
  const { items, isLoading: itemsLoading } = useItem(restaurantId, {});
  const { rawCategories, isLoading: catsLoading } = useCategory(restaurantId);
  const notification = useNotification();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const initialValues = useMemo(() => {
    const values = {};
    if (items) {
      items.forEach(item => {
        const id = item._id || item.id;
        values[id] = item.description || "";
      });
    }
    return values;
  }, [items]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = [];
      Object.keys(values).forEach(id => {
        if (values[id] !== initialValues[id]) {
          payload.push({ id, description: values[id] });
        }
      });

      if (payload.length === 0) {
        notification.error("No changes to save.");
        return;
      }

      setIsSaving(true);
      try {
        await MenuService.bulkUpdateDescription(restaurantId, { items: payload });
        notification.success("Menu descriptions updated successfully!");
        formik.resetForm({ values });
        queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
      } catch (err) {
        console.error("Description save error:", err);
        notification.error(err?.response?.data?.message || "Failed to update descriptions.");
      } finally {
        setIsSaving(false);
      }
    }
  });

  const handleGenerate = async () => {
    if (!items || items.length === 0) return;
    const payload = items.map(item => ({
      id: item._id || item.id,
      name: item.name
    }));

    setIsGenerating(true);
    try {
      await MenuService.bulkUpdateDescription(restaurantId, { items: payload });
      notification.success("AI generated and saved descriptions for all items!");
      queryClient.invalidateQueries({ queryKey: ["items", restaurantId] });
    } catch (err) {
      console.error("Generation error:", err);
      notification.error(err?.response?.data?.message || "Failed to generate descriptions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescriptionChange = (itemId, val) => {
    formik.setFieldValue(itemId, val);
  };

  const handleUndoItem = (itemId) => {
    formik.setFieldValue(itemId, formik.initialValues[itemId]);
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items;
  }, [items, formik.values]);

  const unsavedCount = useMemo(() => {
    return Object.keys(formik.values).filter(id => formik.values[id] !== formik.initialValues[id]).length;
  }, [formik.values, formik.initialValues]);

  if (itemsLoading || catsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-full font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const columns = useMemo(() => getDescriptionColumns({
    rawCategories,
    formik,
    handleDescriptionChange,
    handleUndoItem
  }), [rawCategories, formik.values]);

  return (
    <div className="flex-1 overflow-y-auto bg-white m-2 flex flex-col relative h-full font-sans">
      
      <div className="sticky top-0 z-10 bg-white flex flex-col border-b border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 bg-white">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">Dish Description Editor</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Add or modify delicious descriptions for your menu items</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || isSaving}
              variant="outline"
              className="h-8 px-4 rounded-md border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold font-sans shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            <Button 
              onClick={formik.handleSubmit} 
              disabled={isSaving || unsavedCount === 0}
              className="h-8 px-4 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-semibold font-sans shadow-none flex items-center gap-1.5 transition-all"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes {unsavedCount > 0 && `(${unsavedCount})`}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <BulkTable 
          columns={columns} 
          data={filteredItems} 
          rowKey={(row) => row._id || row.id}
          emptyMessage="No items match your filters." 
        />
      </div>

    </div>
  );
}
