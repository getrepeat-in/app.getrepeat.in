"use client";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "./InstagramIcon";
import { Loader2, Tag, ShoppingBag, RefreshCw, ShieldCheck } from "lucide-react";

export function InstagramConnectCard({ onConnect, isConnecting, isExpired, error }) {
  return (
    <div className="rounded-xl border border-border/50 bg-white dark:bg-zinc-900 shadow-2xs p-4 sm:p-10 w-full max-w-full overflow-hidden">
      <div className="mx-auto text-center flex flex-col items-center w-full">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-2xs mb-4 sm:mb-5 shrink-0">
          <InstagramIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>

        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 px-2">
          {isExpired ? "Reconnect Your Instagram Account" : "Connect Instagram Account"}
        </h2>
        <p className="mt-2 text-[13px] sm:text-sm text-muted-foreground leading-relaxed max-w-lg px-2">
          {isExpired
            ? "Your Instagram session has expired. Re-authenticate to keep your posts and mapped menu items synchronized."
            : "Connect your Instagram Professional or Creator account to display your latest posts and reels, and tag menu items for seamless ordering."}
        </p>

        {error && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium w-full break-words">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-6 sm:my-7 w-full text-left px-1 sm:px-0">
          <div className="p-3 sm:p-3.5 rounded-lg bg-muted/30 dark:bg-zinc-800/40 border border-border/40 flex items-start gap-2.5 sm:gap-3 overflow-hidden">
            <div className="p-2 rounded-md bg-muted text-foreground shrink-0">
              <RefreshCw className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">Auto-sync Media</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Fetches your newest posts and reels automatically</p>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-lg bg-muted/30 dark:bg-zinc-800/40 border border-border/40 flex items-start gap-2.5 sm:gap-3 overflow-hidden">
            <div className="p-2 rounded-md bg-muted text-foreground shrink-0">
              <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">Tag Menu Items</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Map dishes directly to social media content</p>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-lg bg-muted/30 dark:bg-zinc-800/40 border border-border/40 flex items-start gap-2.5 sm:gap-3 overflow-hidden">
            <div className="p-2 rounded-md bg-muted text-foreground shrink-0">
              <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">Direct Ordering</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Customers can order items straight from the feed</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onConnect}
          disabled={isConnecting}
          size="lg"
          className="h-10 px-6 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-2xs gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98] w-full sm:w-auto"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span className="truncate">Connecting Instagram...</span>
            </>
          ) : (
            <>
              <InstagramIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{isExpired ? "Reconnect Instagram" : "Connect Instagram"}</span>
            </>
          )}
        </Button>

        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-4 flex items-center justify-center gap-1.5 px-2 text-center w-full">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
          <span className="truncate">Secure connection via official Meta API</span>
        </p>
      </div>
    </div>
  );
}
