"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "./InstagramIcon";
import { RefreshCw, Unlink, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";

export function InstagramConnectedHeader({ username, connectedAt, isExpired, onRefresh, isRefreshing, onDisconnect, onReconnect, isConnecting }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 shadow-2xs">
          <InstagramIcon className="h-5.5 w-5.5" />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm sm:text-base">
              {username ? `@${username}` : "Instagram Account"}
            </h3>

            {isExpired ? (
              <Badge variant="outline" className="border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] gap-1 py-0.5">
                <AlertTriangle className="h-3 w-3" />
                Session Expired
              </Badge>
            ) : (
              <Badge variant="outline" className="border-green-500/30 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[10px] gap-1 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            )}

            {username && (
              <a
                href={`https://instagram.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 transition"
                title="View on Instagram"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">
            {connectedAt
              ? `Connected on ${new Date(connectedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`
              : "Syncing media automatically"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {isExpired ? (
          <Button
            onClick={onReconnect}
            disabled={isConnecting}
            size="sm"
            className="h-8.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs shadow-2xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isConnecting ? "animate-spin" : ""}`} />
            <span>Reconnect</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8.5 rounded-lg border-gray-200 dark:border-zinc-800 shadow-2xs text-xs font-medium gap-1.5 cursor-pointer"
            title="Refresh feed from Instagram"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Feed</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          className="h-8.5 rounded-lg border-red-200 dark:border-red-900/40 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
          title="Disconnect Instagram account"
        >
          <Unlink className="h-3.5 w-3.5" />
          <span>Disconnect</span>
        </Button>
      </div>
    </div>
  );
}
