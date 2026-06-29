"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  if (pathname === "/login" || !session) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-[240px] min-h-screen">{children}</main>
    </>
  );
}
