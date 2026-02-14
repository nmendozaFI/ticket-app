"use client";

import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserBadge } from "./UserBadge";

export default function Navigation() {
  const pathname = usePathname();
  const { user} = useUserContext()

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-gray-900">
              Ticket app
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
          {user?.role === "ADMIN" && (<Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/admin")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Administracion
            </Link> )}

            {user && (
              <UserBadge />
            )}

            {!user && (
              <Link
                href="/auth"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
