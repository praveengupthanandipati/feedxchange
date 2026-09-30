import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../api/baseQuery";

// Shapes of GET /api/RolePermissions/GetRoleAccessTree and POST /api/RolePermissions/SaveRoleAccess.

export interface RoleAccessAction {
  /** view | create | edit | delete */
  action: string;
  /** The role can do this today. */
  granted: boolean;
  /** No permission of its own: allowed whenever any page inside the Sub Module is (shown, never ticked). */
  derived: boolean;
  /** The permission that ticking this action grants; actions of one node sharing a key are one right. */
  permissionKey: string | null;
}

export interface RoleAccessNode {
  key: string;
  title: string;
  nodeType: "SubModule" | "Page";
  routePath: string | null;
  actions: RoleAccessAction[];
  children: RoleAccessNode[];
}

export interface RoleAccessModule {
  moduleKey: string;
  name: string;
  items: RoleAccessNode[];
}

export interface RoleAccessPermission {
  id: number;
  key: string;
  name: string;
  granted: boolean;
}

export interface RoleAccessTree {
  roleId: number;
  roleName: string;
  modules: RoleAccessModule[];
  otherPermissions: RoleAccessPermission[];
}

export interface RoleListItem {
  id: number;
  name: string;
  profileTypeName?: string | null;
  isActive: boolean;
}

export interface SaveRoleAccessPayload {
  roleId: number;
  actions: { key: string; action: string }[];
  otherPermissionIds: number[];
}

export const roleAccessApi = createApi({
  reducerPath: "roleAccessApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["RoleAccess"],
  endpoints: (builder) => ({
    getRoles: builder.query<RoleListItem[], void>({
      // only the roles below the signed-in user's own: a parent controls its child roles, nobody else's
      query: () => "/api/RolePermissions/GetManageableRoles",
    }),
    getRoleAccessTree: builder.query<RoleAccessTree, number>({
      query: (roleId) => `/api/RolePermissions/GetRoleAccessTree?roleId=${roleId}`,
      providesTags: (_result, _error, roleId) => [{ type: "RoleAccess", id: roleId }],
    }),
    saveRoleAccess: builder.mutation<RoleAccessTree, SaveRoleAccessPayload>({
      query: (body) => ({ url: "/api/RolePermissions/SaveRoleAccess", method: "POST", body }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: "RoleAccess", id: roleId }],
    }),
  }),
});

export const { useGetRolesQuery, useGetRoleAccessTreeQuery, useSaveRoleAccessMutation } = roleAccessApi;
