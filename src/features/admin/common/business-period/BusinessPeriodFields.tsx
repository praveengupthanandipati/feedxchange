import { useEffect, useState } from "react";
import { Button, Input } from "../../../../shared/components/ui";
import SearchableSelectField from "../../../../shared/components/dropdown/SearchableSelectField";
import { PERIOD_OPTIONS, periodFor, type Period, type PeriodKey } from "../../business-dashboard/businessDashboard.utils";
import type { BusinessFilter } from "./useBusinessFilter";
import "./BusinessPeriodFields.scss";

interface BusinessPeriodFieldsProps {
  business: BusinessFilter;
  period: Period;
  /** Called with the period to apply (a preset at once; a custom range when Apply is pressed). */
  onPeriodChange: (period: Period) => void;
}

/**
 * Business and Period controls, the same as the Business Dashboard's: Business = "All" plus the businesses the user may see,
 * Period = presets (this month ... last financial year, all time) or a custom From / To range.
 * Put them inside a `.bp-filters` row next to the screen's own filters.
 */
const BusinessPeriodFields = ({ business, period, onPeriodChange }: BusinessPeriodFieldsProps) => {
  const [draft, setDraft] = useState({ from: period.from, to: period.to });

  // the period can also be set from outside (e.g. a month bar in an overview): show its dates
  useEffect(() => {
    setDraft({ from: period.from, to: period.to });
  }, [period.from, period.to]);

  const businessOptions = [
    { value: "all", label: "All" },
    ...business.options.map((option) => ({
      value: String(option.profileId),
      label: `${option.name}${option.city ? ` (${option.city})` : ""}${option.isOwn ? " – your business" : ""}`,
    })),
  ];

  const customInvalid =period.key === "custom" && !!draft.from && !!draft.to && draft.from > draft.to;

  const choosePeriod = (key: PeriodKey) => {
    if (key === "custom") onPeriodChange({ key, from: period.from, to: period.to });
    else onPeriodChange(periodFor(key));
  };

  return (
    <>
      {business.options.length > 0 && (
        <SearchableSelectField
          label="Business"
          value={business.value}
          onChange={business.setValue}
          options={businessOptions}
          fieldClassName="bp-fields__business"
        />
      )}
      <SearchableSelectField
        label="Period"
        value={period.key}
        onChange={(key) => choosePeriod(key as PeriodKey)}
        options={PERIOD_OPTIONS.map((option) => ({ value: option.key, label: option.label }))}
      />
      {period.key === "custom" && (
        <>
          <Input label="From" type="date" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft((d) => ({ ...d, from: event.target.value }))} />
          <Input
            label="To"
            type="date"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(event) => setDraft((d) => ({ ...d, to: event.target.value }))}
            error={customInvalid ? "To must be on or after From" : undefined}
          />
          <Button
            variant="primary"
            onClick={() => !customInvalid && onPeriodChange({ key: "custom", from: draft.from, to: draft.to })}
            disabled={customInvalid || (draft.from === period.from && draft.to === period.to)}
          >
            Apply
          </Button>
        </>
      )}
    </>
  );
};

export default BusinessPeriodFields;
