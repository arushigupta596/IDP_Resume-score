"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/copilot", label: "AI Copilot", icon: Bot },
  { href: "/nominations", label: "Nominations", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col z-50">
      <div className="px-5 py-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 p-1">
            <Image
              src="/Logotype_de_DP_World.png"
              alt="DP World"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold text-foreground leading-tight tracking-tight">
              DP World
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Talent Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-teal/20 text-teal text-[11px] font-semibold">
              HR
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight">
              HR Admin
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Program Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Program
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] transition-all duration-150 ${
                isActive
                  ? "bg-[var(--sidebar-accent)] text-teal font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]/50"
              }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-teal" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[var(--sidebar-border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Appearance</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/60 hover:bg-secondary transition-colors"
          >
            <Sun
              className={`w-3.5 h-3.5 transition-colors ${!dark ? "text-amber" : "text-muted-foreground"}`}
            />
            <Moon
              className={`w-3.5 h-3.5 transition-colors ${dark ? "text-blue-400" : "text-muted-foreground"}`}
            />
          </button>
        </div>
        <button className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
