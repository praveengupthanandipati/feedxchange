import { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../../../components/dropdown/SearchableSelect";
import NewAddressModal, { type CreatedAddress } from "./NewAddressModal";
import { useGetProfileAddressQuery } from "../../../store/userProfilesCommonApi";

type AddressOption = { value: string; label: string };

// Addresses created from the popup are not in the profile's address list, so they are
// remembered per profile for the rest of the session — a remount would otherwise leave
// the field showing a bare id, or nothing at all.
const createdAddressesByProfile = new Map<number, AddressOption[]>();

export function formatAddressLabel(address: {
  officeName: string;
  addressLine1: string;
  city: string;
}): string {
  return [address.officeName, address.addressLine1, address.city].filter(Boolean).join(", ");
}

interface AddressSelectFieldProps {
  /** Profile the addresses belong to — the seller for loading, the buyer for delivery. */
  profileId: number;
  value: string;
  onChange: (addressId: string, addressLabel: string) => void;
  placeholder: string;
  ariaLabel: string;
  /** Heading for the "add new" popup, e.g. "New Loading Address". */
  modalTitle: string;
  /** Pre-ticks "Unloading location" in the popup, used for delivery addresses. */
  defaultUnloading?: boolean;
}

/**
 * Address dropdown for the truck dispatch screens. "+" in the search box opens the
 * New Address popup — the address is saved against the profile and filled in here,
 * so the user carries on with the truck they were adding.
 * Renders the control only; the calling screen keeps its own label and error markup.
 */
const AddressSelectField = ({
  profileId,
  value,
  onChange,
  placeholder,
  ariaLabel,
  modalTitle,
  defaultUnloading = false,
}: AddressSelectFieldProps) => {
  const { data: addresses } = useGetProfileAddressQuery(String(profileId), { skip: !profileId });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  // Addresses added from the popup, kept here because a one-time dispatch address
  // is not part of the profile's address list.
  const [addedOptions, setAddedOptions] = useState<AddressOption[]>(
    () => createdAddressesByProfile.get(profileId) ?? [],
  );

  useEffect(() => {
    setAddedOptions(createdAddressesByProfile.get(profileId) ?? []);
  }, [profileId]);

  const options = useMemo(() => {
    const fromProfile = (addresses ?? []).map((address) => ({
      value: String(address.addressId),
      label: formatAddressLabel(address),
    }));
    // A just-created address wins over a profile entry with the same id, so the
    // field shows the address that was actually added.
    const added = new Set(addedOptions.map((option) => option.value));
    return [...fromProfile.filter((option) => !added.has(option.value)), ...addedOptions];
  }, [addresses, addedOptions]);

  const handleChange = (addressId: string) => {
    const label = options.find((option) => option.value === addressId)?.label ?? "";
    onChange(addressId, label);
  };

  const handleCreated = (address: CreatedAddress) => {
    setModalOpen(false);
    const option = { value: String(address.addressId), label: formatAddressLabel(address) };
    const next = [
      ...(createdAddressesByProfile.get(profileId) ?? []).filter((o) => o.value !== option.value),
      option,
    ];
    createdAddressesByProfile.set(profileId, next);
    setAddedOptions(next);
    onChange(option.value, option.label);
  };

  return (
    <>
      <SearchableSelect
        options={options}
        value={value}
        onChange={handleChange}
        onAddNew={(query) => {
          setModalName(query);
          setModalOpen(true);
        }}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        clearable
      />

      <NewAddressModal
        open={modalOpen}
        profileId={profileId}
        title={modalTitle}
        initialName={modalName}
        defaultUnloading={defaultUnloading}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
};

export default AddressSelectField;
