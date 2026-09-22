"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  return (
    <div className="flex w-full items-center">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;

          return (
            <span key={href} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-muted-foreground" />
              {isLast ? (
                <span className="text-foreground font-medium capitalize">
                  {decodeURIComponent(segment)}
                </span>
              ) : (
                <Link href={href} className="hover:text-foreground capitalize">
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}