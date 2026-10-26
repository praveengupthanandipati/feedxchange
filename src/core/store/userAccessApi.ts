import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of the /api/UserAccess endpoints: a parent's per-user menu overrides (UserMenuItems) on top of the user's role.

export interface ManageableUser {
  id: number;
  name: string;
  email: string | null;
  roleId: number | null;
  roleName: string | null;
}

export interface UserAccessAction {
  /** view | create | edit | delete */
  action: string;
  /** A Sub Module overview: follows its pages and cannot be overridden. */
  derived: boolean;
  permissionKey: string | null;
  /** What the user's role gives. */
  roleGranted: boolean;
  /** The parent's override: true = allowed, false = denied, null = follow the role. */
  override: boolean | null;
  /** What the user gets. */
  effective: boolean;
}

export interface UserAccessNode {
  key: string;
  title: string;
  nodeType: "SubModule" | "Page";
  routePath: string | null;
  actions: UserAccessAction[];
  children: UserAccessNode[];
}

export interface UserAccessModule {
  moduleKey: string;
  name: string;
  items: UserAccessNode[];
}

export interface UserAccessTree {
  userId: number;
  userName: string;
  email: string | null;
  roleId: number | null;
  roleName: string | null;
  modules: UserAccessModule[];
}

export interface SaveUserAccessPayload {
  userId: number;
  overrides: { key: string; action: string; allow: boolean }[];
}

export const userAccessApi = createApi({
  reducerPath: "userAccessApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["UserAccess"],
  endpoints: (builder) => ({
    getManageableUsers: builder.query<ManageableUser[], void>({
      query: () => "/api/UserAccess/GetManageableUsers",
    }),
    getUserAccessTree: builder.query<UserAccessTree, number>({
      query: (userId) => `/api/UserAccess/GetUserAccessTree?userId=${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "UserAccess", id: userId }],
    }),
    saveUserAccess: builder.mutation<UserAccessTree, SaveUserAccessPayload>({
      query: (body) => ({ url: "/api/UserAccess/SaveUserAccess", method: "POST", body }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: "UserAccess", id: userId }],
    }),
  }),
});

export const { useGetManageableUsersQuery, useGetUserAccessTreeQuery, useSaveUserAccessMutation } = userAccessApi;
