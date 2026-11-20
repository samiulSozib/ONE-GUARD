"use client";

import { useParams } from "next/navigation";
import InvoiceDetail from "@/components/invoice/invoice-detail";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = Number(params.id);

  if (!invoiceId || Number.isNaN(invoiceId)) {
    return <div className="p-6 text-sm text-red-600">Invalid invoice id.</div>;
  }

  return <InvoiceDetail invoiceId={invoiceId} />;
}
