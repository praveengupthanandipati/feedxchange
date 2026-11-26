import SearchableSelect, { type SearchableSelectOption } from "./SearchableSelect";
import "./SearchableSelectField.scss";

interface SearchableSelectFieldProps {
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Extra class on the field wrapper (e.g. a min-width for a long list). */
  fieldClassName?: string;
}

/**
 * A labelled dropdown with a search box, laid out like the ui kit's Select / Input fields (same label, height and corners),
 * so it sits in a filter row next to them. Typing in the search box narrows the options.
 */
const SearchableSelectField = ({ label, options, value, onChange, placeholder, disabled, fieldClassName = "" }: SearchableSelectFieldProps) => (
  <div className={`ui-field searchable-select-field ${fieldClassName}`}>
    <span className="ui-field__label">{label}</span>
    <SearchableSelect options={options} value={value} onChange={onChange} placeholder={placeholder} ariaLabel={label} disabled={disabled} />
  </div>
);

export default SearchableSelectField;
