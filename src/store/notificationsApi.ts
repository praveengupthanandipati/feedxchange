import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of the /api/Notifications endpoints. The server looks up recipient addresses, resolves templates and renders the message;
// the screens only choose recipients, channels and templates.

export type ChannelCode = "SMS" | "EMAIL" | "WHATSAPP" | "APP";
export type RecipientType = "User" | "ProfileContact" | "Driver" | "Profile" | "Adhoc";

export interface NotificationChannel {
  channelId: number;
  channelCode: ChannelCode;
  channelName: string;
  isEnabled: boolean;
  supportsAttachments: boolean;
  maxBodyLength: number | null;
}

export interface NotificationRule {
  recipientRole: string;
  channelCode: ChannelCode;
  isDefaultOn: boolean;
  isUserSelectable: boolean;
}

export interface NotificationEvent {
  eventCode: string;
  eventName: string;
  requiresContract: boolean;
  allowsAdhocRecipients: boolean;
  rules: NotificationRule[];
}

export interface NotificationTemplate {
  templateId: number;
  templateCode: string;
  templateName: string;
  eventCode: string;
  channelCode: ChannelCode;
  recipientRole: string | null;
  variantCode: string | null;
  category: string | null;
  isDefault: boolean;
  languageCode: string;
}

export interface RecipientCandidate {
  recipientType: RecipientType;
  recipientRefId: number;
  role: string;
  displayName: string;
  organisation: string | null;
  email: string | null;
  mobile: string | null;
  hasAppLogin: boolean;
}

export interface ChannelSelection {
  channelCode: ChannelCode;
  /** Null = the default template for the event, role and channel. */
  templateId: number | null;
}

export interface RecipientSelection {
  recipientType: RecipientType;
  recipientRefId?: number | null;
  role: string;
  displayName?: string | null;
  /** Only for Adhoc recipients; for everyone else the server looks the address up. */
  email?: string | null;
  mobile?: string | null;
  channels: ChannelSelection[];
}

export interface ComposeNotificationRequest {
  eventCode: string;
  contractId?: number | null;
  profileId?: number | null;
  sourceEntityType?: string | null;
  sourceEntityId?: number | null;
  variantCode?: string | null;
  openText?: string | null;
  data?: Record<string, string> | null;
  recipients: RecipientSelection[];
  idempotencyKey?: string | null;
}

export interface RenderedMessage {
  recipientRole: string;
  displayName: string | null;
  channelCode: string;
  templateId: number | null;
  templateName: string | null;
  address: string | null;
  subject: string | null;
  body: string;
  html: string | null;
  problems: string[];
}

export interface NotificationPreviewResult {
  messages: RenderedMessage[];
  canSend: boolean;
}

export interface DeliverySummary {
  deliveryId: number;
  recipientRole: string;
  displayName: string | null;
  channelCode: string;
  status: string;
}

export interface SendNotificationResult {
  notificationId: number;
  duplicate: boolean;
  deliveries: DeliverySummary[];
}

export type DeliveryStatus =
  | "Pending" | "Queued" | "Processing" | "Submitted" | "Sent" | "Delivered" | "Read"
  | "Failed" | "RetryScheduled" | "Cancelled" | "Suppressed";

export interface NotificationHistoryItem {
  deliveryId: number;
  notificationId: number;
  eventCode: string;
  eventName: string;
  recipientRole: string | null;
  recipientName: string | null;
  channelCode: ChannelCode;
  status: DeliveryStatus;
  address: string | null;
  isResend: boolean;
  parentDeliveryId: number | null;
  isLegacy: boolean;
  failureReason: string | null;
  createdAt: string;
  submittedAt: string | null;
  deliveredAt: string | null;
  resendCount: number;
}

export interface NotificationHistoryQuery {
  contractId?: number;
  contractNumber?: string;
  channelCode?: string;
  status?: string;
  recipientRole?: string;
  eventCode?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationHistoryPage {
  items: NotificationHistoryItem[];
  total: number;
}

export interface DeliveryAttempt {
  attemptNumber: number;
  providerName: string | null;
  providerMessageId: string | null;
  attemptStatus: string;
  requestedAt: string;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface DeliveryDetail extends NotificationHistoryItem {
  subject: string | null;
  body: string | null;
  html: string | null;
  attempts: DeliveryAttempt[];
}

export type ResendContentMode = "Original" | "CurrentData";

export interface ResendPayload {
  contractId?: number | null;
  deliveryIds: number[];
  contentMode: ResendContentMode;
  reason: string;
  idempotencyKey?: string;
}

export interface ResendResult {
  resendOperationId: number;
  items: { originalDeliveryId: number; newDeliveryId: number | null; skipped: string | null }[];
}

export interface InboxItem {
  inboxId: number;
  title: string;
  body: string;
  category: string | null;
  deepLink: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface InboxPage {
  items: InboxItem[];
  nextCursor: number | null;
  unreadCount: number;
}

const qs = (params: Record<string, string | number | undefined | null>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Inbox", "UnreadCount", "History"],
  endpoints: (builder) => ({
    getNotificationChannels: builder.query<NotificationChannel[], void>({ query: () => "/api/Notifications/channels" }),
    getNotificationEvents: builder.query<NotificationEvent[], void>({ query: () => "/api/Notifications/events" }),
    getNotificationTemplates: builder.query<NotificationTemplate[], { eventCode: string; channelCode?: string; recipientRole?: string }>({
      query: (q) => `/api/Notifications/templates${qs({ ...q })}`,
    }),
    getNotificationRecipients: builder.query<RecipientCandidate[], { contractId?: number; contractNumber?: string }>({
      query: (q) => `/api/Notifications/recipients${qs({ ...q })}`,
    }),
    previewNotification: builder.mutation<NotificationPreviewResult, ComposeNotificationRequest>({
      query: (body) => ({ url: "/api/Notifications/preview", method: "POST", body }),
    }),
    sendNotification: builder.mutation<SendNotificationResult, ComposeNotificationRequest>({
      query: (body) => ({
        url: "/api/Notifications/send",
        method: "POST",
        body,
        headers: body.idempotencyKey ? { "Idempotency-Key": body.idempotencyKey } : undefined,
      }),
      invalidatesTags: ["History"],
    }),
    getNotificationHistory: builder.query<NotificationHistoryPage, NotificationHistoryQuery>({
      query: (q) => `/api/Notifications/history${qs({ ...q })}`,
      providesTags: ["History"],
    }),
    getDeliveryDetail: builder.query<DeliveryDetail, number>({ query: (id) => `/api/Notifications/deliveries/${id}` }),
    resendNotifications: builder.mutation<ResendResult, ResendPayload>({
      query: (body) => ({
        url: "/api/Notifications/resend",
        method: "POST",
        body,
        headers: body.idempotencyKey ? { "Idempotency-Key": body.idempotencyKey } : undefined,
      }),
      invalidatesTags: ["History"],
    }),
    getInbox: builder.query<InboxPage, { before?: number; pageSize?: number } | void>({
      query: (q) => `/api/Notifications/inbox${qs({ ...(q ?? {}) })}`,
      providesTags: ["Inbox"],
    }),
    getUnreadCount: builder.query<number, void>({ query: () => "/api/Notifications/unread-count", providesTags: ["UnreadCount"] }),
    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/Notifications/inbox/${id}/read`, method: "POST" }),
      invalidatesTags: ["Inbox", "UnreadCount"],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/api/Notifications/inbox/read-all", method: "POST" }),
      invalidatesTags: ["Inbox", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationChannelsQuery,
  useGetNotificationEventsQuery,
  useGetNotificationTemplatesQuery,
  useGetNotificationRecipientsQuery,
  usePreviewNotificationMutation,
  useSendNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetDeliveryDetailQuery,
  useResendNotificationsMutation,
  useGetInboxQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
