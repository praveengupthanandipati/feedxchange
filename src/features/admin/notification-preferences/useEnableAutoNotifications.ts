import { useCallback } from "react";
import { usePermission } from "../../../core/auth/AuthContext";
import { useUpdateProfileModeMutation } from "../../../core/store/notificationPreferencesApi";

/**
 * New profiles start with automatic notifications on. Called right after a profile wizard creates the
 * profile (never on edit, so a profile someone switched off stays off). Only for users allowed to switch
 * the mode; a failure is ignored, as the Notification Preferences step still offers the switch.
 */
export const useEnableAutoNotifications = () => {
  const canSwitchMode = usePermission("notification-automation.manage");
  const [setMode] = useUpdateProfileModeMutation();

  return useCallback(
    (profileId: number) => {
      if (!canSwitchMode || !profileId) return;
      void setMode({ profileId, dispatchMode: "Auto" }).unwrap().catch(() => undefined);
    },
    [canSwitchMode, setMode],
  );
};
