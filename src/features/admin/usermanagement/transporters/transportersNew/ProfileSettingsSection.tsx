import { useState } from "react";
import ToggleSwitch from "../../../../../shared/components/toggle/ToggleSwitch";
import { useTransporterWizard } from "./TransporterWizardContext";
import { profileSettingDefinitions } from "./newTransporter.data";

const ProfileSettingsSection = () => {
  // The status toggle is saved with the profile (draft.status); the other toggles have no backend field yet.
  const { draft, updateDraft } = useTransporterWizard();
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(profileSettingDefinitions.map((setting) => [setting.key, setting.defaultValue]))
  );
  const valueOf = (key: string) => (key === "transporterStatus" ? draft.status === "Active" : values[key]);

  const toggleSetting = (key: string) => {
    if (key === "transporterStatus") updateDraft({ status: draft.status === "Active" ? "Inactive" : "Active" });
    else setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h3 className="form-subheading">Profile Settings</h3>

      <div className="profile-settings-table">
        <div className="profile-settings-table__header">
          <span>Profile Setting Description</span>
          <span>Value</span>
        </div>

        {profileSettingDefinitions.map((setting) => (
          <div className="profile-settings-table__row" key={setting.key}>
            <div className="profile-settings-table__description">
              <p className="profile-settings-table__title">{setting.title}</p>
              <p className="profile-settings-table__hint">{setting.description}</p>
            </div>
            <div className="profile-settings-table__value">
              <ToggleSwitch
                checked={valueOf(setting.key)}
                onChange={() => toggleSetting(setting.key)}
                ariaLabel={setting.title}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSettingsSection;
