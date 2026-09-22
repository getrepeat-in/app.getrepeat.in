"use client";
import { useState } from "react";
import ActionMenu from "../action-menu";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SubCategoryList from "../sub-category-list";
import InlineInput from "@/components/ui/inline-input";
import { CategoryFormPopover } from "../fragments/category-form-popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, FolderKanban, Plus, LayoutList } from "lucide-react";

export default function CategoryCard({
    category,
    index,
    isExpanded,
    onToggleExpand,
    activeCategory,
    setActiveCategory,
    setActiveSubCategory,
    updateCategory,
    deleteCategory,
    copyCategoryToClipboard,
    activeSubCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    isCollapsed,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [addingSubCategory, setAddingSubCategory] = useState(false);
    const [isSavingSubCategory, setIsSavingSubCategory] = useState(false);

    if (!category) return null;

    const isCategoryActive = activeCategory === category.id;

    const handleCategorySelect = () => {
        setActiveCategory?.(category.id);
        if (!isExpanded) onToggleExpand();

        const firstSubCategory = category.subcategories?.[0];
        if (firstSubCategory) {
            setActiveSubCategory?.(firstSubCategory.id);
        }
    };

    if (isCollapsed) {
        const categoryImage = category.image || category.imageUrl || category.items?.[0]?.image || category.items?.[0]?.imageUrl || category.subcategories?.[0]?.items?.[0]?.image || category.subcategories?.[0]?.items?.[0]?.imageUrl;
        
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleCategorySelect}
                        className={cn(
                            "group relative flex w-11 h-11 mx-auto items-center justify-center rounded-xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                            isCategoryActive ? "bg-primary/10 shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-primary/20" : "hover:bg-muted/70 border border-transparent"
                        )}
                    >
                        {categoryImage ? (
                            <div className="w-8 h-8 overflow-hidden rounded-[8px] border border-border/50 shadow-xs">
                                <img src={getImageUrl(categoryImage)} alt={category.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors border shadow-xs",
                                isCategoryActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border/50 group-hover:bg-background group-hover:text-foreground"
                            )}>
                                <LayoutList className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                    <p className="font-semibold text-[13px]">{category.name}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div
            className={cn(
                "group flex flex-col rounded-md border transition-all duration-300 overflow-hidden",
                isExpanded ? "border-border/50 bg-muted/30 shadow-sm" : "border-transparent bg-transparent hover:border-border hover:bg-muted/50"
            )}
            style={{
                animationDelay: `${index * 30}ms`,
                animationFillMode: "both",
            }}
        >
            <div className={cn(
                "relative flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-2 transition-colors",
                isCategoryActive ? "bg-primary/10" : "group-hover:bg-muted/50"
            )}>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 rounded-md hover:bg-black/5"
                    onClick={onToggleExpand}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                </Button>

                {isEditing ? (
                    <div className="flex-1 pr-1 text-sm">
                        <CategoryFormPopover
                            open={isEditing}
                            onOpenChange={setIsEditing}
                            initialData={category}
                            onSubmit={(data) => {
                                if (updateCategory) {
                                    updateCategory({ categoryId: category.id, data });
                                }
                            }}
                        >
                            <button type="button" aria-label="Edit category" className="w-full h-full cursor-default" />
                        </CategoryFormPopover>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleCategorySelect}
                            className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-left"
                        >
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                isCategoryActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                            )}>
                                <FolderKanban className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className={cn("truncate text-sm font-semibold flex items-center gap-2", isCategoryActive ? "text-primary" : "text-foreground")}>
                                    <span className="truncate">{category.name}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {category.subcategories?.length ?? 0} subcategories
                                </p>
                            </div>
                        </button>

                        <ActionMenu
                            triggerClassName="h-7 w-7 shrink-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                            onRename={() => setIsEditing(true)}
                            onDelete={() => deleteCategory?.(category.id)}
                            onCopy={copyCategoryToClipboard ? () => copyCategoryToClipboard(category.raw || category) : undefined}
                        />
                    </>
                )}
            </div>

            <div className={cn("grid transition-all duration-300 ease-in-out", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                    <div className="border-t border-border/50 bg-white/40 px-2.5 py-2.5">
                        <SubCategoryList
                            categoryId={category.id}
                            subcategories={category.subcategories}
                            activeSubCategory={activeSubCategory}
                            setActiveSubCategory={setActiveSubCategory}
                            setActiveCategory={setActiveCategory}
                            addSubCategory={addSubCategory}
                            updateSubCategory={updateSubCategory}
                            deleteSubCategory={deleteSubCategory}
                        />

                        {addingSubCategory ? (
                            <div className="mt-1.5 px-1 text-sm">
                                <InlineInput
                                    autoFocus
                                    placeholder="Subcategory name"
                                    disabled={isSavingSubCategory}
                                    onSubmit={(name) => {
                                        const trimmed = name.trim();
                                        if (trimmed && addSubCategory) {
                                            setIsSavingSubCategory(true);
                                            addSubCategory(
                                                { name: trimmed, parentCategory: category.id },
                                                {
                                                    onSuccess: () => {
                                                        setAddingSubCategory(false);
                                                        setIsSavingSubCategory(false);
                                                    },
                                                    onError: () => {
                                                        setIsSavingSubCategory(false);
                                                    }
                                                }
                                            );
                                        } else {
                                            setAddingSubCategory(false);
                                        }
                                    }}
                                    onCancel={() => !isSavingSubCategory && setAddingSubCategory(false)}
                                />
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2 w-full justify-start rounded-md text-muted-foreground hover:text-foreground"
                                onClick={() => setAddingSubCategory(true)}
                            >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Add Subcategory
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}