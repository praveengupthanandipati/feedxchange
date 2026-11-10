import { useMemo } from "react";
import SearchableSelect from "../../../shared/components/dropdown/SearchableSelect";
import type { SearchableSelectOption } from "../../../shared/components/dropdown/SearchableSelect";
import { useGetProfileGroupNamesQuery } from "../../../core/store/userProfilesCommonApi";

interface ProfileGroupFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fixed choices a screen already offers (they stay in the list next to the groups other profiles use). */
  extraOptions?: SearchableSelectOption[];
}

const NO_OPTIONS: SearchableSelectOption[] = [];
const NO_NAMES: string[] = [];

/**
 * The "Group" field of every profile (business owner, transporter, promoter): pick a group other profiles already use, or type a new one.
 * The value saved is the group's name.
 */
const ProfileGroupField = ({ value, onChange, extraOptions = NO_OPTIONS }: ProfileGroupFieldProps) => {
  const { data } = useGetProfileGroupNamesQuery(undefined, { refetchOnMountOrArgChange: true });
  const groupNames = data ?? NO_NAMES;

  const options = useMemo(() => {
    const seen = new Set<string>();
    const list: SearchableSelectOption[] = [];
    const add = (option: SearchableSelectOption) => {
      const key = option.value.trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push(option);
    };
    extraOptions.forEach(add);
    groupNames.forEach((name) => add({ value: name, label: name }));
    return list;
  }, [groupNames, extraOptions]);

  return (
    <div className="form-field">
      <span className="form-field__label">Group</span>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select or type..."
        ariaLabel="Group"
        allowCustom
      />
    </div>
  );
};

export default ProfileGroupField;
