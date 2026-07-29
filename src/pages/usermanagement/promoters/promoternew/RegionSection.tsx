import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import SearchableSelect from "../../../../components/dropdown/SearchableSelect";
import ConfirmDialog from "../../../../components/dialog/ConfirmDialog";
import EmptyRowsState from "./EmptyRowsState";
import { cityOptions, districtOptions, stateOptions } from "./promoterNew.data";

export interface RegionEntry {
  id: string;
  stateName: string;
  districtName: string;
  cityName: string;
  // Present only for rows loaded from an existing profile — tells the save
  // step to call UpdatePromoterRegion instead of bundling this row into the
  // next CreatePromoterRegion call.
  meta?: { regionId: number; createdBy: number; createdOn: string };
}

let seq = 0;
export const nextRegionId = () => `region-${Date.now()}-${seq++}`;

const emptyEntry = (): RegionEntry => ({
  id: nextRegionId(),
  stateName: "",
  districtName: "",
  cityName: "",
});

interface RegionSectionProps {
  entries: RegionEntry[];
  onEntriesChange: (entries: RegionEntry[]) => void;
}

const RegionSection = ({ entries, onEntriesChange }: RegionSectionProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const addEntry = () => onEntriesChange([...entries, emptyEntry()]);
  const confirmRemoveEntry = () => {
    onEntriesChange(entries.filter((entry) => entry.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const updateEntry = (id: string, patch: Partial<RegionEntry>) =>
    onEntriesChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  return (
    <div>
      <h3 className="form-subheading">Geographic Regions of Operation</h3>

      {entries.length === 0 ? (
        <EmptyRowsState onAdd={addEntry} message="No Data available" />
      ) : (
        <>
          <div className="repeatable-entries">
            {entries.map((entry) => (
              <div className="repeatable-entry" key={entry.id}>
                <div className="new-contract__grid">
                  <div className="form-field">
                    <span className="form-field__label">
                      State <span className="form-field__required">*</span>
                    </span>
                    <SearchableSelect
                      options={stateOptions}
                      value={entry.stateName}
                      onChange={(value) => updateEntry(entry.id, { stateName: value })}
                      ariaLabel="State"
                      allowCustom
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">District</span>
                    <SearchableSelect
                      options={districtOptions}
                      value={entry.districtName}
                      onChange={(value) => updateEntry(entry.id, { districtName: value })}
                      ariaLabel="District"
                      allowCustom
                    />
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">City</span>
                    <SearchableSelect
                      options={cityOptions}
                      value={entry.cityName}
                      onChange={(value) => updateEntry(entry.id, { cityName: value })}
                      ariaLabel="City"
                      allowCustom
                    />
                  </div>

                  <button
                    type="button"
                    className="repeatable-entry__delete repeatable-entry__delete--inline"
                    onClick={() => setPendingDeleteId(entry.id)}
                    aria-label="Remove region"
                  >
                    <FiTrash2 aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="repeatable-entries__add" onClick={addEntry}>
            + Add
          </button>
        </>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this region?"
        message="This will remove this region entry. This cannot be undone."
        onConfirm={confirmRemoveEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default RegionSection;
