import React from "react";
import { Undo2 } from "lucide-react";
import { getCategoryName } from "../../helpers/utils";

export const getDescriptionColumns = ({ 
    rawCategories, 
    formik, 
    handleDescriptionChange, 
    handleUndoItem 
}) => [
    {
      header: "Item Name",
      width: "30%",
      render: (item) => {
        const catName = item.category ? getCategoryName(item.category, rawCategories) : "";
        const subCatName = item.subCategory ? getCategoryName(item.subCategory, rawCategories) : "";
        const breadcrumb = catName && subCatName ? `${catName} > ${subCatName}` : catName || subCatName || "Uncategorized";

        return (
          <div className="flex flex-col pt-1">
            <span className="font-semibold font-sans text-[14px] text-gray-800 tracking-tight leading-tight">{item.name}</span>
            <span className="text-[11px] font-medium font-sans text-gray-400 mt-0.5 uppercase tracking-wide">{breadcrumb}</span>
          </div>
        );
      }
    },
    {
      header: "Description",
      className: "pl-4",
      render: (item) => {
        const isEdited = formik.values[item.id] !== formik.initialValues[item.id];
        const currentDesc = formik.values[item.id] || "";

        return (
          <div className="flex items-center gap-3 pt-1 pb-1 w-full max-w-2xl pr-4">
            <textarea
              value={currentDesc}
              onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
              placeholder="Add a delicious description..."
              rows={2}
              className={`w-full text-[14px] font-medium text-slate-700 bg-white border rounded-md p-3 outline-none resize-none shadow-none transition-all duration-200 ${
                isEdited 
                  ? "border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400" 
                  : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
            {isEdited && (
              <button
                onClick={() => handleUndoItem(item.id)}
                className="text-amber-500 hover:text-amber-600 p-2 rounded-md hover:bg-amber-50 transition-colors shrink-0 cursor-pointer"
                title="Revert changes"
              >
                <Undo2 className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        );
      }
    }
];
