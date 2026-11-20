export type DocumentSendChannel = "email" | "whatsapp" | "both";

/** How WhatsApp is delivered when channel includes WhatsApp */
export type WhatsAppDelivery = "open" | "business" | "both";

export interface WhatsAppBusinessCapability {
  enabled: boolean;
  configured: boolean;
  provider: "meta" | "twilio" | string;
  template_configured: boolean;
}

export interface DocumentSendDefaults {
  to: string | null;
  whatsapp_number: string | null;
  document_label?: string | null;
  client_name?: string | null;
  guard_name?: string | null;
  whatsapp_business?: WhatsAppBusinessCapability;
  default_whatsapp_delivery?: WhatsAppDelivery;
}

export interface DocumentSendPayload {
  channel: DocumentSendChannel;
  whatsapp_delivery?: WhatsAppDelivery;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  message?: string;
  whatsapp_number?: string;
  guard_id?: number;
  period_start?: string;
  period_end?: string;
}

export interface DocumentSendResult {
  channel: DocumentSendChannel;
  whatsapp_delivery?: WhatsAppDelivery | null;
  message: string | null;
  whatsapp_url: string | null;
  share_url: string | null;
  business_message_id?: string | null;
  business_provider?: string | null;
}
