import { useState } from "react";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch";
import { profileSettingDefinitions } from "./newBusiness.data";

const ProfileSettingsSection = () => {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(profileSettingDefinitions.map((setting) => [setting.key, setting.defaultValue]))
  );

  const toggleSetting = (key: string) =>
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));

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
                checked={values[setting.key]}
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
