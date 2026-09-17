import CategoryView from "../category-view";
import { BULK_EDIT_MODES } from "../../bulk-editor/helper/constant";
import { ChevronRight, SlidersHorizontal, DatabaseZap } from "lucide-react";

export const renderViewContent = (props) => {
    const {
        activeView,
        activeBulkMode,
        setActiveBulkMode,
        activeCategory,
        setActiveCategory,
        activeSubCategory,
        setActiveSubCategory
    } = props;

    switch (activeView) {
        case "MENU":
            return (
                <div className="space-y-2 p-3 pb-8">
                    <CategoryView 
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeSubCategory={activeSubCategory}
                        setActiveSubCategory={setActiveSubCategory}
                    />
                </div>
            );
        case "BULK": {
            const editors = BULK_EDIT_MODES.filter((m) => m.category === "EDITORS" || !m.category);
            const dataTools = BULK_EDIT_MODES.filter((m) => m.category === "DATA");

            const renderModeItem = (mode) => {
                const isActive = activeBulkMode === mode.id;
                const Icon = mode.icon;

                return (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveBulkMode(mode.id)}
                        className={`group relative flex items-center gap-3 w-full px-3 py-2 rounded-md text-left transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                            isActive
                                ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold ring-1 ring-primary/20 shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-primary"
                                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium"
                        }`}
                    >
                        <div
                            className={`flex size-7.5 items-center justify-center rounded-lg shrink-0 transition-all duration-150 ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-xs [&>svg]:stroke-[2.2]"
                                    : "bg-muted/80 text-muted-foreground/80 group-hover:bg-background group-hover:text-foreground group-hover:shadow-2xs [&>svg]:stroke-[1.8]"
                            }`}
                        >
                            <Icon className="size-4" />
                        </div>

                        <span className={`flex-1 text-[13px] tracking-tight truncate ${isActive ? "text-primary dark:text-primary font-semibold" : "text-foreground/90 font-medium"}`}>
                            {mode.label}
                        </span>

                        <ChevronRight
                            className={`size-3.5 shrink-0 transition-all duration-150 ${
                                isActive
                                    ? "text-primary opacity-100 translate-x-0"
                                    : "text-muted-foreground/40 opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0"
                            }`}
                        />
                    </button>
                );
            };

            return (
                <div className="p-3 pb-8 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase select-none">
                            <SlidersHorizontal className="size-3" />
                            <span>Batch Editors</span>
                        </div>
                        <div className="space-y-1">
                            {editors.map(renderModeItem)}
                        </div>
                    </div>

                    {dataTools.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase select-none">
                                <DatabaseZap className="size-3" />
                                <span>Data & Sync</span>
                            </div>
                            <div className="space-y-1">
                                {dataTools.map(renderModeItem)}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        default:
            return null;
    }
};