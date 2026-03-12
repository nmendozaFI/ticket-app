"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  HardDrive, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Upload,
  FolderSync
} from "lucide-react";
import { toast } from "sonner";

interface MigrationResult {
  success: number;
  failed: number;
  total: number;
  details: Array<{
    file: string;
    status: "success" | "error";
    sharePointUrl?: string;
    error?: string;
  }>;
}

export default function SharePointMigration() {
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  async function checkConnection() {
    setIsChecking(true);
    try {
      const response = await fetch("/api/admin/migrate-to-sharepoint", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      setIsConnected(data.connected);

      if (data.connected) {
        toast.success("Conexión con SharePoint OK");
      } else {
        toast.error("Error conectando con SharePoint");
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setIsConnected(false);
      toast.error("Error verificando conexión");
    } finally {
      setIsChecking(false);
    }
  }

  async function startMigration() {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch("/api/admin/migrate-to-sharepoint", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
        }),
      });

      if (!response.ok) {
        throw new Error("Migration failed");
      }

      const data = await response.json();
      setMigrationResult(data.result);

      if (data.result.failed === 0) {
        toast.success(`✅ Migración completada: ${data.result.success} archivos`);
      } else {
        toast.warning(
          `⚠️ Migración finalizada: ${data.result.success} OK, ${data.result.failed} errores`
        );
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Error durante la migración");
    } finally {
      setIsMigrating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderSync className="w-5 h-5" />
          <CardTitle>Migración a SharePoint</CardTitle>
        </div>
        <CardDescription>
          Migra archivos de Cloudinary a SharePoint para liberar espacio
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <span className="text-sm">→</span>
              <HardDrive className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Cloudinary → SharePoint</p>
              <p className="text-sm text-muted-foreground">
                Estructura: /TICKETS_CLOUDINARY/año/mes/numberInvoice/
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar conexión"
            )}
          </Button>
        </div>

        {isConnected !== null && (
          <Alert variant={isConnected ? "default" : "destructive"}>
            {isConnected ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {isConnected
                ? "Conexión con SharePoint establecida correctamente"
                : "No se pudo conectar con SharePoint. Verifica las credenciales en .env"}
            </AlertDescription>
          </Alert>
        )}

        {/* Selector de período */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Año</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mes</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={startMigration}
            disabled={isMigrating || isConnected === false}
            className="w-full"
            size="lg"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrando archivos...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Migrar a SharePoint
              </>
            )}
          </Button>
        </div>

        {/* Resultado de migración */}
        {migrationResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{migrationResult.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {migrationResult.success}
                    </p>
                    <p className="text-sm text-muted-foreground">Exitosos</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {migrationResult.failed}
                    </p>
                    <p className="text-sm text-muted-foreground">Errores</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {migrationResult.details.length > 0 && (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="font-medium mb-2">Detalle de archivos:</p>
                <div className="space-y-2">
                  {migrationResult.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1 truncate">
                        <p className="font-mono text-xs truncate">{detail.file}</p>
                        {detail.error && (
                          <p className="text-xs text-red-600 mt-1">{detail.error}</p>
                        )}
                      </div>
                      <Badge
                        variant={detail.status === "success" ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {detail.status === "success" ? "✓" : "✗"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Los archivos permanecerán en Cloudinary después de la
            migración. Puedes eliminarlos manualmente desde el panel de Cloudinary cuando
            lo consideres seguro.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}