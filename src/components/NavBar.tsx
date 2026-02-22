"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brain, Upload, BookOpen, Download, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Review", icon: Brain },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/highlights", label: "Browse", icon: BookOpen },
  { href: "/export", label: "Export", icon: Download },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Book Highlights
        </Link>

        {/* Desktop nav */}
        <div className="hidden gap-1 sm:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={cn(isActive && "font-semibold")}
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t px-4 pb-3 sm:hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={cn("w-full justify-start", isActive && "font-semibold")}
                onClick={() => setMobileOpen(false)}
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
