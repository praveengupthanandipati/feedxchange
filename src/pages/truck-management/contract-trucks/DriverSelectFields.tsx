import { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import NewDriverModal from "../../transporters/drivers/driver-create/NewDriverModal";
import {
  useGetAllActiveDriversQuery,
  useLazyGetDriverByMobileQuery,
  type Driver,
} from "../../../store/driversApi";

export interface DriverSelection {
  /** Driver id as a string, matching the dropdown option value. */
  driverId: string;
  driverPhone: string;
  /** The selected driver's name, for screens that display it alongside the id. */
  driverLabel?: string;
}

interface DriverSelectFieldsProps {
  value: DriverSelection;
  onChange: (next: DriverSelection) => void;
  nameError?: string;
  phoneError?: string;
}

/**
 * Driver Name + Driver Contact No dropdowns used by the truck dispatch screens.
 * Either field fills the other, and "+" in the search box opens the New Driver popup —
 * the driver is saved to Driver Master and filled in here so the user can carry on.
 */
const DriverSelectFields = ({ value, onChange, nameError, phoneError }: DriverSelectFieldsProps) => {
  const { data: drivers } = useGetAllActiveDriversQuery();
  const [fetchDriverByMobile, { isFetching: loadingDriverByMobile }] = useLazyGetDriverByMobileQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalMobile, setModalMobile] = useState("");

  const driverOptions = useMemo(
    () => (drivers ?? []).map((d) => ({ value: String(d.driverId), label: d.driverName })),
    [drivers],
  );
  const driverMobileOptions = useMemo(
    () =>
      (drivers ?? [])
        .filter((d) => Boolean(d.mobileNumber))
        .map((d) => ({ value: d.mobileNumber, label: d.mobileNumber })),
    [drivers],
  );

  // A driver id set from elsewhere (a Reassign, or an existing dispatch) arrives without
  // its phone number, so it is filled in as soon as the drivers load.
  useEffect(() => {
    if (!value.driverId || value.driverPhone || !drivers) return;
    const driver = drivers.find((d) => String(d.driverId) === value.driverId);
    if (!driver) return;
    onChange({
      driverId: value.driverId,
      driverPhone: driver.mobileNumber,
      driverLabel: driver.driverName,
    });
  }, [drivers, value.driverId, value.driverPhone, onChange]);

  const handleDriverChange = (driverId: string) => {
    const driver = (drivers ?? []).find((d) => String(d.driverId) === driverId);
    onChange({
      driverId,
      driverPhone: driverId ? driver?.mobileNumber ?? value.driverPhone : "",
      driverLabel: driverId ? driver?.driverName : "",
    });
  };

  // Picking a mobile number fills in the matching driver — locally first, then confirmed by the API.
  const handleDriverPhoneChange = async (mobileNumber: string) => {
    if (!mobileNumber) {
      onChange({ driverId: "", driverPhone: "", driverLabel: "" });
      return;
    }

    const local = (drivers ?? []).find((d) => d.mobileNumber === mobileNumber);
    onChange({
      driverId: local ? String(local.driverId) : value.driverId,
      driverPhone: mobileNumber,
      driverLabel: local ? local.driverName : value.driverLabel,
    });

    try {
      const driver = await fetchDriverByMobile(mobileNumber).unwrap();
      if (driver) {
        onChange({
          driverId: String(driver.driverId),
          driverPhone: driver.mobileNumber,
          driverLabel: driver.driverName,
        });
      }
    } catch {
      // Keep the locally matched driver if the lookup fails.
    }
  };

  const openNewDriver = (name: string, mobile: string) => {
    setModalName(name);
    setModalMobile(mobile);
    setModalOpen(true);
  };

  const handleDriverCreated = (driver: Driver) => {
    setModalOpen(false);
    onChange({
      driverId: String(driver.driverId),
      driverPhone: driver.mobileNumber,
      driverLabel: driver.driverName,
    });
  };

  return (
    <>
      <div className="assign-truck-drawer__field">
        <label className="assign-truck-drawer__label">
          Driver Name <span className="assign-truck-drawer__required">*</span>
        </label>
        <SearchableSelect
          options={driverOptions}
          value={value.driverId}
          onChange={handleDriverChange}
          onAddNew={(query) => openNewDriver(query, "")}
          placeholder="Select Driver"
          ariaLabel="Select Driver"
          clearable
        />
        {nameError && <p className="assign-truck-drawer__error">{nameError}</p>}
      </div>

      <div className="assign-truck-drawer__field">
        <label className="assign-truck-drawer__label">
          Driver Contact No <span className="assign-truck-drawer__required">*</span>
        </label>
        <SearchableSelect
          options={driverMobileOptions}
          value={value.driverPhone}
          onChange={handleDriverPhoneChange}
          onAddNew={(query) => openNewDriver("", query)}
          placeholder={loadingDriverByMobile ? "Loading driver…" : "Select Driver Contact No"}
          ariaLabel="Select Driver Contact No"
          clearable
        />
        {phoneError && <p className="assign-truck-drawer__error">{phoneError}</p>}
      </div>

      <NewDriverModal
        open={modalOpen}
        initialName={modalName}
        initialMobile={modalMobile}
        onClose={() => setModalOpen(false)}
        onCreated={handleDriverCreated}
      />
    </>
  );
};

export default DriverSelectFields;
