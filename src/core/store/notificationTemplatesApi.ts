import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";
import type { ChannelCode } from "./notificationsApi";

// Shapes of the /api/NotificationTemplates endpoints (template administration).

export type VersionStatus = "Draft" | "Approved" | "Retired";

export interface TemplateAdminItem {
  templateId: number;
  templateCode: string;
  templateName: string;
  eventCode: string;
  eventName: string;
  channelCode: ChannelCode;
  recipientRole: string | null;
  variantCode: string | null;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
  latestVersionNumber: number;
  /** The version messages use. Null = none approved yet, so the template cannot be used. */
  approvedVersionNumber: number | null;
  latestVersionStatus: VersionStatus | "";
  updatedAt: string | null;
}

export interface TemplateVersion {
  templateVersionId: number;
  versionNumber: number;
  subjectTemplate: string | null;
  bodyTemplate: string;
  htmlBodyTemplate: string | null;
  status: VersionStatus;
  providerTemplateName: string | null;
  providerTemplateId: string | null;
  providerApprovalStatus: string | null;
  dltTemplateId: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface TemplateAdminDetail extends TemplateAdminItem {
  versions: TemplateVersion[];
}

export interface TemplateVersionInput {
  subject?: string | null;
  body: string;
  html?: string | null;
  providerTemplateName?: string | null;
  providerTemplateId?: string | null;
  providerApprovalStatus?: string | null;
  dltTemplateId?: string | null;
}

export interface CreateTemplatePayload extends TemplateVersionInput {
  templateCode: string;
  templateName: string;
  eventCode: string;
  channelCode: string;
  recipientRole?: string | null;
  variantCode?: string | null;
  isDefault: boolean;
}

export interface UpdateTemplatePayload {
  templateName: string;
  recipientRole?: string | null;
  variantCode?: string | null;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface RenderSamplePayload {
  subject?: string | null;
  body: string;
  html?: string | null;
  variables: Record<string, string>;
}

export interface RenderSampleResult {
  subject: string | null;
  body: string;
  html: string | null;
  error: string | null;
}

export interface TemplateQuery {
  eventCode?: string;
  channelCode?: string;
  search?: string;
}

const qs = (q: TemplateQuery) => {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const notificationTemplatesApi = createApi({
  reducerPath: "notificationTemplatesApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Templates", "Template"],
  endpoints: (builder) => ({
    listTemplates: builder.query<TemplateAdminItem[], TemplateQuery>({
      query: (q) => `/api/NotificationTemplates${qs(q)}`,
      providesTags: ["Templates"],
    }),
    getTemplate: builder.query<TemplateAdminDetail, number>({
      query: (id) => `/api/NotificationTemplates/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Template", id }],
    }),
    createTemplate: builder.mutation<TemplateAdminDetail, CreateTemplatePayload>({
      query: (body) => ({ url: "/api/NotificationTemplates", method: "POST", body }),
      invalidatesTags: ["Templates"],
    }),
    updateTemplate: builder.mutation<TemplateAdminDetail, { id: number; body: UpdateTemplatePayload }>({
      query: ({ id, body }) => ({ url: `/api/NotificationTemplates/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => ["Templates", { type: "Template", id }],
    }),
    addTemplateVersion: builder.mutation<TemplateAdminDetail, { id: number; body: TemplateVersionInput }>({
      query: ({ id, body }) => ({ url: `/api/NotificationTemplates/${id}/versions`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => ["Templates", { type: "Template", id }],
    }),
    approveTemplateVersion: builder.mutation<TemplateAdminDetail, { templateId: number; versionId: number }>({
      query: ({ versionId }) => ({ url: `/api/NotificationTemplates/versions/${versionId}/approve`, method: "POST" }),
      invalidatesTags: (_r, _e, { templateId }) => ["Templates", { type: "Template", id: templateId }],
    }),
    renderTemplateSample: builder.mutation<RenderSampleResult, RenderSamplePayload>({
      query: (body) => ({ url: "/api/NotificationTemplates/render-sample", method: "POST", body }),
    }),
  }),
});

export const {
  useListTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useAddTemplateVersionMutation,
  useApproveTemplateVersionMutation,
  useRenderTemplateSampleMutation,
} = notificationTemplatesApi;
