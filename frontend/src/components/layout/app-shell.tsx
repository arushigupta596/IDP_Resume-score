"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, session, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !session && pathname !== "/login") {
      router.push("/login");
    }
  }, [loading, session, pathname, router]);

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
