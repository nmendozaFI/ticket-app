"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useOCR, useUploadReceipt } from "@/hooks/useOCR";
import { toast } from "sonner";
import Image from "next/image";
import { Camera, ExternalLink, Loader2, X } from "lucide-react";

type ExpenseFormValues = {
  date: Date;
  amount: number;
  category?: string;
  vendor?: string;
  description?: string;
  invoiceNumber?: string; // ✅ NUEVO
  paymentMethod?: string; // ✅ NUEVO
  receiptUrl?: string;
};

interface ExpenseFormProps {
  tripId: string;
  initialData?: Expense;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  tripId,
}: ExpenseFormProps) {
  const ocrMutation = useOCR();
  const uploadMutation = useUploadReceipt();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // ✅ Estado separado para preview y URL guardada
  const [receiptUrl, setReceiptUrl] = React.useState<string>(
    initialData?.receiptUrl || "",
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    initialData?.receiptUrl || null,
  );

  const [values, setValues] = React.useState<ExpenseFormValues>({
    date: initialData ? new Date(initialData.date) : new Date(),
    amount: initialData ? Number(initialData.amount) : 0,
    category: initialData?.category || "",
    vendor: initialData?.vendor || "",
    description: initialData?.description || "",
    invoiceNumber: initialData?.invoiceNumber || "",
    paymentMethod: initialData?.paymentMethod || "Tarjeta",
    receiptUrl: initialData?.receiptUrl || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // 1. Procesar OCR
      toast.info("Extrayendo datos del ticket");

      const ocrData = await ocrMutation.mutateAsync(file);

      // 2. Subir imagen a Cloudinary
      const imageUrl = await uploadMutation.mutateAsync({
        image: file,
        tripId,
      });
      // 3. Actualizar estados
      setReceiptUrl(imageUrl);
      setPreviewUrl(imageUrl);

      // 3. Actualizar formulario con datos extraídos
      setValues((prev) => ({
        ...prev,
        vendor: ocrData.vendor || prev.vendor,
        amount: ocrData.amount || prev.amount,
        date: ocrData.date ? new Date(ocrData.date) : prev.date,
        invoiceNumber: ocrData.invoiceNumber || prev.invoiceNumber,
        category: ocrData.category || prev.category,
        description: ocrData.description || prev.description,
        receiptUrl: imageUrl,
      }));

      toast.success("Datos extraídos correctamente. Revisa y confirma.");
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast.error("No se pudo procesar el ticket. Intenta nuevamente.");
    }
  }

  function handleRemoveImage() {
    setPreviewUrl(null);
    setReceiptUrl("");
    setValues((prev) => ({ ...prev, receiptUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      ...values,
      receiptUrl: receiptUrl,
    });
  }

  const isProcessing = ocrMutation.isPending || uploadMutation.isPending;

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* ✅ SECCIÓN DE CAPTURA DE TICKET */}
      <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Escanear Ticket</Label>
            <p className="text-sm text-muted-foreground">
              Sube una foto del recibo para autocompletar
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                {previewUrl ? "Cambiar Foto" : "Subir Foto"}
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-muted">
              <Image
                src={previewUrl}
                alt="Recibo"
                fill
                sizes="s"
                className="object-contain"
                unoptimized={!previewUrl.startsWith("http")} // ✅ Solo optimizar URLs de Cloudinary
              />
            </div>
            <div className="flex gap-2">
              {receiptUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Original
                  </a>
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Fecha</label>
          <Input
            type="date"
            name="date"
            value={values.date.toISOString().slice(0, 10)}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, date: new Date(e.target.value) }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Monto</label>
          <Input
            type="number"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            step="0.01"
            min={1}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Categoría</label>
          <Select
            value={values.category}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, category: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Taxi">Taxi</SelectItem>
              <SelectItem value="Comida">Comida</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Metrobus/Parking">Metrobus/Parking</SelectItem>
              <SelectItem value="Gasolina">Gasolina</SelectItem>
              <SelectItem value="Ave">Ave</SelectItem>
              <SelectItem value="Avion">Avion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Proveedor</label>
          <Input
            name="vendor"
            value={values.vendor}
            onChange={handleChange}
            placeholder="Restaurante, taxi..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Nº Factura</Label>
          <Input
            name="invoiceNumber"
            value={values.invoiceNumber}
            onChange={handleChange}
            placeholder="1234567890"
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select
            value={values.paymentMethod}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, paymentMethod: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tarjeta">Santander tarj debito</SelectItem>
              <SelectItem value="Efectivo">Efectivo</SelectItem>
              <SelectItem value="Transferencia">
                Santander transferencia
              </SelectItem>
              <SelectItem value="Domiciliacion">
                Santander domiciliacion
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={3}
          placeholder="Detalles adicionales..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {initialData ? "Actualizar" : "Guardar"} Gasto
        </Button>
      </div>
    </form>
  );
}
