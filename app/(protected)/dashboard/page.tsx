import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Receipt } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
          {/* Subir gasto */}
          <Link href="/expenses/new" className="group">
            <Card className="h-64 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4">
                <Receipt className="h-10 w-10" />
                <div>
                  <CardTitle className="text-2xl">Subir gasto</CardTitle>
                  <CardDescription>
                    Carga un ticket, asígnalo a un viaje y completa la
                    información.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex h-full items-end">
                <p className="text-sm text-muted-foreground group-hover:underline">
                  Crear un nuevo registro →
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Historial */}
          <Link href="/expenses/history" className="group">
            <Card className="h-64 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center gap-4">
                <History className="h-10 w-10" />
                <div>
                  <CardTitle className="text-2xl">Ver historial</CardTitle>
                  <CardDescription>
                    Revisa los gastos cargados por viaje y su estado.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex h-full items-end">
                <p className="text-sm text-muted-foreground group-hover:underline">
                  Ir al historial →
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}