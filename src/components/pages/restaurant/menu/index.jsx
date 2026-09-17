"use client";
import { useState } from "react";
import MenuHeader from "./fragments/header";
import CategorySidebar from "./fragments/category-sidebar";
import MenuItemList from "./fragments/items/menu-item-list";
import { ExportCSV } from "./fragments/bulk-editor/ExportCSV";
import { ImageEditor } from "./fragments/bulk-editor/ImageEditor";
import { PriceEditor } from "./fragments/bulk-editor/PriceEditor";
import { ImportEditor } from "./fragments/bulk-editor/ImportEditor";
import { AddonsEditor } from "./fragments/bulk-editor/AddonsEditor";
import { DescriptionEditor } from "./fragments/bulk-editor/DescriptionEditor";
import { StructureOrganizer } from "./fragments/bulk-editor/StructureOrganizer";

const Menu = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null);
    const [activeView, setActiveView] = useState("MENU");
    const [activeBulkMode, setActiveBulkMode] = useState("PRICE");

    const renderMainContent = () => {
        if (activeView === "MENU") {
            if (activeSubCategory) {
                return (
                    <MenuItemList 
                        activeCategoryId={activeCategory}
                        activeSubCategoryId={activeSubCategory}
                    />
                );
            }
            return (
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950 text-gray-400">
                    <p>Select a subcategory to view items</p>
                </div>
            );
        }

        if (activeView === "BULK") {
            switch (activeBulkMode) {
                case "PRICE":
                    return <PriceEditor />;
                case "EXPORT_CSV":
                    return <ExportCSV />;
                case "DESCRIPTION":
                    return <DescriptionEditor />;
                case "STRUCTURE":
                    return <StructureOrganizer />;
                case "ADDONS":
                    return <AddonsEditor />;
                case "IMAGE":
                    return <ImageEditor />;
                case "IMPORT":
                    return <ImportEditor />;
                default:
                    return (
                        <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950 text-gray-400">
                            <p>Select a bulk edit tool from the sidebar</p>
                        </div>
                    );
            }
        }

        return null;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] w-full overflow-hidden">
            <MenuHeader />
            <div className="flex flex-1 overflow-hidden">
                <CategorySidebar 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory}
                    activeSubCategory={activeSubCategory}
                    setActiveSubCategory={setActiveSubCategory}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    activeBulkMode={activeBulkMode}
                    setActiveBulkMode={setActiveBulkMode}
                />
                
                {renderMainContent()}
            </div>
        </div>
    )
}

export default Menu;