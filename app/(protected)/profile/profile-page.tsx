"use client";
import { signOut } from "@/actions/auth-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Session = typeof auth.$Infer.Session;

export default function ProfilePage({ session }: { session: Session }) {
  const router = useRouter();
  const user = session.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-20">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h2>
                <p className="hidden md:block text-gray-600 text-sm">
                  Administra tu cuenta y configura tus preferencias aquí.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center p-1 gap-2">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="block md:hidden text-gray-600 text-sm m-2">
                Administra tu cuenta y configura tus preferencias aquí.
              </p>
            </div>

            {/* Authentication Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Authentication Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Status:</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Authenticated
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Email:</span>
                  <span className="ml-2 text-blue-600">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Role:</span>
                  <span className="ml-2 text-blue-600">{user.role}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">
                    Email Verified:
                  </span>
                  <span className="ml-2 text-blue-600">
                    {user.emailVerified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* {user.role === "ADMIN" && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full bg-transparent"
                  >
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuraciones
                    </Link>
                  </Button>
                </div>
              </div>
            )} */}

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
