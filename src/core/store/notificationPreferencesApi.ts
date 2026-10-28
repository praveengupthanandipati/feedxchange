import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";
import type { ChannelCode } from "./notificationsApi";

// Shapes of the /api/NotificationPreferences endpoints: who is told about which event, on which channel, and the automatic send that uses them.

export interface PreferenceEvent {
  eventCode: string;
  eventName: string;
  description: string | null;
  /** Always goes out: at least one channel must stay on, and a pause does not stop it. */
  isMandatory: boolean;
}

export interface PreferenceChannel {
  channelCode: ChannelCode;
  channelName: string;
  /** False when the channel is switched off for the whole platform. */
  isEnabled: boolean;
}

export interface Subscription {
  eventCode: string;
  channels: ChannelCode[];
}

export interface ContactPreferences {
  contactId: number;
  contactName: string;
  designation: string | null;
  email: string | null;
  mobile: string | null;
  isPaused: boolean;
  resumeOn: string | null;
  pauseReason: string | null;
  subscriptions: Subscription[];
}

export type DispatchMode = "Manual" | "Auto";
export type NoSubscriberRule = "SendNothing" | "UseRoleDefaults";

export interface ProfilePreferences {
  profileId: number;
  profileName: string;
  dispatchMode: DispatchMode;
  noSubscriberRule: NoSubscriberRule;
  holdSeconds: number;
  isPaused: boolean;
  pausedUntil: string | null;
  events: PreferenceEvent[];
  channels: PreferenceChannel[];
  contacts: ContactPreferences[];
  warnings: string[];
}

export interface PreferenceProfileLookup {
  profileId: number;
  name: string;
  contactCount: number;
  dispatchMode: DispatchMode;
}

export interface UserPreferences {
  userId: number;
  userName: string;
  email: string | null;
  mobile: string | null;
  profileName: string | null;
  isPaused: boolean;
  resumeOn: string | null;
  pauseReason: string | null;
  events: PreferenceEvent[];
  channels: PreferenceChannel[];
  subscriptions: Subscription[];
}

export interface PreferenceUserLookup {
  userId: number;
  name: string;
  email: string | null;
  profileName: string | null;
}

export interface PreferenceAuditEntry {
  auditId: number;
  action: string;
  contactName: string | null;
  userName: string | null;
  changedByName: string | null;
  changedOn: string;
  oldValues: string | null;
  newValues: string | null;
}

export interface PausePayload {
  /** ISO date-time; empty = until someone resumes. */
  resumeOn?: string | null;
  reason?: string;
}

export interface ProfileSettingsPayload {
  noSubscriberRule: NoSubscriberRule;
  holdSeconds: number;
  isPaused: boolean;
  pausedUntil?: string | null;
}

// ---- automatic notification

export interface ResolveNotificationPayload {
  eventCode: string;
  contractId?: number;
  contractNumber?: string;
  sourceEntityType?: string;
  sourceEntityId?: number;
  profileId?: number;
  idempotencyKey?: string;
}

export interface ResolvedChannel {
  channelCode: ChannelCode;
  ok: boolean;
  problem: string | null;
}

export type ResolvedSource = "Preference" | "Mandatory" | "RoleDefault";

export interface ResolvedRecipient {
  recipientType: string;
  recipientRefId: number;
  role: string;
  displayName: string;
  organisation: string | null;
  source: ResolvedSource;
  channels: ResolvedChannel[];
}

export interface SuppressedRecipient {
  displayName: string;
  role: string;
  channelCode: string | null;
  reason: string;
}

export interface ResolveNotificationResult {
  mode: "Auto" | "Manual";
  reason: string | null;
  holdSeconds: number;
  recipients: ResolvedRecipient[];
  suppressed: SuppressedRecipient[];
  channelCount: number;
}

export interface DispatchNotificationResult {
  sent: boolean;
  mode: "Auto" | "Manual";
  message: string | null;
  notificationId: number | null;
  duplicate: boolean;
  deliveries: { deliveryId: number; recipientRole: string; displayName: string | null; channelCode: string; status: string }[];
  suppressed: SuppressedRecipient[];
}

const base = "/api/NotificationPreferences";

export const notificationPreferencesApi = createApi({
  reducerPath: "notificationPreferencesApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["ProfilePrefs", "UserPrefs", "Audit"],
  endpoints: (builder) => ({
    findPreferenceProfiles: builder.query<PreferenceProfileLookup[], string>({
      query: (search) => `${base}/profiles?search=${encodeURIComponent(search)}`,
      providesTags: ["ProfilePrefs"],
    }),
    getProfilePreferences: builder.query<ProfilePreferences, number>({
      query: (profileId) => `${base}/profile/${profileId}`,
      providesTags: (_r, _e, id) => [{ type: "ProfilePrefs", id }],
    }),
    saveContactPreferences: builder.mutation<ContactPreferences, { contactId: number; profileId: number; subscriptions: Subscription[] }>({
      query: ({ contactId, subscriptions }) => ({ url: `${base}/contact/${contactId}`, method: "PUT", body: { subscriptions } }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "Audit"],
    }),
    pauseContact: builder.mutation<ContactPreferences, { contactId: number; profileId: number } & PausePayload>({
      query: ({ contactId, resumeOn, reason }) => ({ url: `${base}/contact/${contactId}/pause`, method: "POST", body: { resumeOn: resumeOn || null, reason } }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "Audit"],
    }),
    resumeContact: builder.mutation<ContactPreferences, { contactId: number; profileId: number }>({
      query: ({ contactId }) => ({ url: `${base}/contact/${contactId}/resume`, method: "POST" }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "Audit"],
    }),
    updateProfileSettings: builder.mutation<ProfilePreferences, { profileId: number } & ProfileSettingsPayload>({
      query: ({ profileId, ...body }) => ({ url: `${base}/profile/${profileId}/settings`, method: "PUT", body }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "Audit"],
    }),
    updateProfileMode: builder.mutation<ProfilePreferences, { profileId: number; dispatchMode: DispatchMode }>({
      query: ({ profileId, dispatchMode }) => ({ url: `${base}/profile/${profileId}/mode`, method: "PUT", body: { dispatchMode } }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "ProfilePrefs", "Audit"],
    }),
    copyPreferences: builder.mutation<ProfilePreferences, { profileId: number; fromContactId: number; toContactIds: number[] }>({
      query: ({ profileId, ...body }) => ({ url: `${base}/profile/${profileId}/copy`, method: "POST", body }),
      invalidatesTags: (_r, _e, a) => [{ type: "ProfilePrefs", id: a.profileId }, "Audit"],
    }),
    getPreferenceAudit: builder.query<PreferenceAuditEntry[], number>({
      query: (profileId) => `${base}/profile/${profileId}/audit?take=50`,
      providesTags: ["Audit"],
    }),

    getMyPreferences: builder.query<UserPreferences, void>({ query: () => `${base}/me`, providesTags: ["UserPrefs"] }),
    saveMyPreferences: builder.mutation<UserPreferences, Subscription[]>({
      query: (subscriptions) => ({ url: `${base}/me`, method: "PUT", body: { subscriptions } }),
      invalidatesTags: ["UserPrefs"],
    }),
    pauseMine: builder.mutation<UserPreferences, PausePayload>({
      query: (body) => ({ url: `${base}/me/pause`, method: "POST", body: { resumeOn: body.resumeOn || null, reason: body.reason } }),
      invalidatesTags: ["UserPrefs"],
    }),
    resumeMine: builder.mutation<UserPreferences, void>({ query: () => ({ url: `${base}/me/resume`, method: "POST" }), invalidatesTags: ["UserPrefs"] }),

    findPreferenceUsers: builder.query<PreferenceUserLookup[], string>({ query: (search) => `${base}/users?search=${encodeURIComponent(search)}` }),
    getUserPreferences: builder.query<UserPreferences, number>({ query: (userId) => `${base}/user/${userId}`, providesTags: ["UserPrefs"] }),
    saveUserPreferences: builder.mutation<UserPreferences, { userId: number; subscriptions: Subscription[] }>({
      query: ({ userId, subscriptions }) => ({ url: `${base}/user/${userId}`, method: "PUT", body: { subscriptions } }),
      invalidatesTags: ["UserPrefs"],
    }),
    pauseUser: builder.mutation<UserPreferences, { userId: number } & PausePayload>({
      query: ({ userId, resumeOn, reason }) => ({ url: `${base}/user/${userId}/pause`, method: "POST", body: { resumeOn: resumeOn || null, reason } }),
      invalidatesTags: ["UserPrefs"],
    }),
    resumeUser: builder.mutation<UserPreferences, number>({ query: (userId) => ({ url: `${base}/user/${userId}/resume`, method: "POST" }), invalidatesTags: ["UserPrefs"] }),

    resolveNotification: builder.mutation<ResolveNotificationResult, ResolveNotificationPayload>({
      query: (body) => ({ url: `${base}/resolve`, method: "POST", body }),
    }),
    dispatchNotification: builder.mutation<DispatchNotificationResult, ResolveNotificationPayload>({
      query: ({ idempotencyKey, ...body }) => ({ url: `${base}/dispatch`, method: "POST", body, headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined }),
    }),
  }),
});

export const {
  useFindPreferenceProfilesQuery,
  useGetProfilePreferencesQuery,
  useSaveContactPreferencesMutation,
  usePauseContactMutation,
  useResumeContactMutation,
  useUpdateProfileSettingsMutation,
  useUpdateProfileModeMutation,
  useCopyPreferencesMutation,
  useGetPreferenceAuditQuery,
  useGetMyPreferencesQuery,
  useSaveMyPreferencesMutation,
  usePauseMineMutation,
  useResumeMineMutation,
  useFindPreferenceUsersQuery,
  useGetUserPreferencesQuery,
  useSaveUserPreferencesMutation,
  usePauseUserMutation,
  useResumeUserMutation,
  useResolveNotificationMutation,
  useDispatchNotificationMutation,
} = notificationPreferencesApi;
