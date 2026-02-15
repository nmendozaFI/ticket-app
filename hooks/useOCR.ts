"use client";

import { useMutation } from "@tanstack/react-query";

interface OCRResult {
  vendor: string | null;
  amount: number | null;
  date: string | null;
  invoiceNumber: string | null;
  category: string | null;
  description: string | null;
}

export function useOCR() {
  return useMutation({
    mutationFn: async (image: File): Promise<OCRResult> => {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("/api/expenses/ocr", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error processing image");
      }

      const { data } = await res.json();
      return data;
    },
  });
}

export function useUploadReceipt() {
  return useMutation({
    mutationFn: async ({ image, tripId }: { image: File; tripId: string }): Promise<string> => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("tripId", tripId);

      const res = await fetch("/api/expenses/upload-receipt", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error uploading image");
      }

      const { url } = await res.json();
      return url;
    },
  });
}