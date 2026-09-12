"use client";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmDeleteAlert({ isOpen, onClose, onConfirm, title, description, isDeleting }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={!isDeleting ? onClose : undefined}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="relative w-full max-w-[400px] overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl shadow-2xl m-4"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 opacity-80" />

                        <div className="flex flex-col items-center text-center p-8 pt-10">
                            <div className="relative mb-6 group">
                                <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-20 duration-1000" />
                                
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-500/5 flex items-center justify-center border border-red-200 dark:border-red-500/20 shadow-inner transform transition-transform group-hover:scale-105">
                                    <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                                </div>
                            </div>

                            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                {title || "Are you absolutely sure?"}
                            </h2>
                            <p className="text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400 mt-3 px-2">
                                {description || "This action cannot be undone. This will permanently delete the selected item and remove its data from our servers."}
                            </p>
                        </div>
                         
                        <div className="flex items-center gap-3 p-5 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-800/80">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50 text-[15px] shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="relative flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] text-[15px] active:scale-[0.98]"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
