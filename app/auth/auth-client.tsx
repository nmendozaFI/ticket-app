"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createAuthClient } from "better-auth/client";
import { signIn, signUp } from "@/actions/auth-actions";

export default function AuthClientPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
  };

  const authClient = createAuthClient();

  const signInMicrosoft = async () => {
    const data = await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/",
    });
    console.log("Microsoft Sign-In Data:", data);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    toast.info(isSignIn ? "Iniciando sesión..." : "Creando cuenta...");

    try {
      let result;
      if (isSignIn) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      // Ahora maneja el nuevo formato
      if (result.success && result.user) {
        toast.success(isSignIn ? "¡Sesión iniciada!" : "¡Cuenta creada!");
        clearForm();
        router.push("/");
      } else {
        setError(result.error || "Error desconocido");
        toast.error(result.error || "Error en autenticación");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(`Error: ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-indigo-100">
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignIn ? "Bienvenido" : "Crea tu cuenta"}
            </h1>
            <p className="text-gray-600">
              {isSignIn
                ? "Inicia sesión para continuar"
                : "Registrate para comenzar"}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Authentication */}
          <div className="space-y-3">
            <button
              onClick={signInMicrosoft}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border  border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                <rect x="13" y="0" width="10" height="10" fill="#7FBA00" />
                <rect x="0" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
              Continuar con Microsoft
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-linear-to-br from-blue-50 to-indigo-100 text-gray-500">
                O continuar con:
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isSignIn && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isSignIn}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border-black-200 border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ingrese su nombre completo"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electronico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ingrese su correo electrónico"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isSignIn ? "Signing in..." : "Creating account..."}
                </div>
              ) : isSignIn ? (
                "Inicia sesión"
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn);
                clearForm();
              }}
              className="text-red-600 hover:text-red-500 text-sm font-medium transition-colors"
            >
              {isSignIn
                ? "¿No tienes una cuenta? Regístrate"
                : "¿Ya tienes una cuenta? Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
