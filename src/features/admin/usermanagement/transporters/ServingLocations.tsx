import MultiSelect from "../../../../shared/components/dropdown/MultiSelect";
import { indianStates } from "../businessowners/BusinessList/businessOwners.data";
import type { ServingLocationValue } from "./servingLocation.utils";
import "./ServingLocations.scss";

const stateOptions = indianStates.map((state) => ({ value: state, label: state }));

interface ServingLocationsEditorProps extends ServingLocationValue {
  onChange: (patch: Partial<ServingLocationValue>) => void;
  /** Shown under the section when the two lists are not filled in. */
  error?: string | null;
}

/**
 * The Serving Locations section of the transporter profile (create and edit): Source States and Destination States, both required.
 * Chosen states show as chips under each field (blue = pick-up, green = delivery).
 */
export const ServingLocationsEditor = ({ sourceStates, destinationStates, onChange, error }: ServingLocationsEditorProps) => (
  <section className="new-contract__section serving-locations" aria-labelledby="serving-locations-title">
    <h2 className="new-contract__section-title" id="serving-locations-title">
      Serving Locations
    </h2>
    <p className="serving-locations__intro">Configure the geographical coverage of this transporter.</p>

    <div className="form-field">
      <span className="form-field__label">
        Source States <span className="form-field__required">*</span>
      </span>
      <MultiSelect
        options={stateOptions}
        value={sourceStates}
        onChange={(value) => onChange({ sourceStates: value })}
        placeholder="Select source states..."
        ariaLabel="Source States"
        chipsBelow
        tone="blue"
      />
      <p className="serving-locations__help">States from which goods can be picked up.</p>
    </div>

    <div className="form-field">
      <span className="form-field__label">
        Destination States <span className="form-field__required">*</span>
      </span>
      <MultiSelect
        options={stateOptions}
        value={destinationStates}
        onChange={(value) => onChange({ destinationStates: value })}
        placeholder="Select destination states..."
        ariaLabel="Destination States"
        chipsBelow
        tone="green"
      />
      <p className="serving-locations__help">States where goods can be delivered.</p>
    </div>

    <p className="serving-locations__note">Multiple states can be selected independently.</p>
    {error && (
      <p className="new-contract__error" role="alert" style={{ color: "var(--fx-red-49-fg)" }}>
        {error}
      </p>
    )}
  </section>
);

interface ServingStateChipsProps {
  source: string[] | null | undefined;
  destination: string[] | null | undefined;
  /** Single line per direction, no labels' extra spacing: for table cells and small panels. */
  compact?: boolean;
}

/** Read-only view of Serving Locations: "Picks up from" (blue chips) and "Delivers to" (green chips). */
export const ServingStateChips = ({ source, destination, compact = false }: ServingStateChipsProps) => {
  const from = source ?? [];
  const to = destination ?? [];
  if (from.length === 0 && to.length === 0) {
    return <span className="serving-chips__empty">Not specified</span>;
  }

  const group = (label: string, states: string[], tone: "blue" | "green") => (
    <div className="serving-chips__group">
      <span className="serving-chips__label">{label}</span>
      {states.length === 0 ? (
        <span className="serving-chips__empty">Not specified</span>
      ) : (
        <ul className="serving-chips__list">
          {states.map((state) => (
            <li key={state} className={`serving-chips__chip serving-chips__chip--${tone}`}>
              {state}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className={`serving-chips ${compact ? "serving-chips--compact" : ""}`}>
      {group("Picks up from", from, "blue")}
      {group("Delivers to", to, "green")}
    </div>
  );
};
