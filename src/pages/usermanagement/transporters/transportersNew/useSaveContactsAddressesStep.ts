import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateTransporterProfileMutation } from "../../../../store/transportersApi";
import {
  useCreateProfileAddressMutation,
  useUpdateProfileAddressMutation,
  type CreateProfileAddressEntry,
  type ProfileAddressDetail,
} from "../../../../store/userProfilesCommonApi";
import { useTransporterWizard } from "./TransporterWizardContext";
import { buildTransporterProfilePayload } from "./transporterWizard.utils";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save contacts & addresses:", err);
  return "Failed to save contacts & addresses.";
}

// Contacts still ride the whole-profile update (no dedicated contact
// endpoint yet). Addresses persist through their own userProfilesCommonApi
// endpoints: rows with a `meta` (loaded from an existing profile, or from an
// earlier save this session) go through UpdateProfileAddress; the rest are
// bundled into one CreateProfileAddress call.
export const useSaveContactsAddressesStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId } = useTransporterWizard();
  const [updateTransporterProfile] = useUpdateTransporterProfileMutation();
  const [createProfileAddress] = useCreateProfileAddressMutation();
  const [updateProfileAddress] = useUpdateProfileAddressMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    if (!profileId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();

      await updateTransporterProfile({
        ...buildTransporterProfilePayload(draft, currentUserId),
        profileId,
        modifiedBy: currentUserId,
      }).unwrap();

      const primaryAddressFields = {
        officeName: draft.tradingName || draft.legalName,
        addressLine1: draft.billingAddressLine1,
        addressLine2: draft.billingAddressLine2,
        landmark: draft.landmark,
        pincode: draft.billingPincode,
        city: draft.billingCity,
        district: draft.billingDistrict,
        stateName: draft.billingState,
        googleLocationUrl: draft.billingGoogleMapLocation,
        isPrimary: true,
        isUnloadingLocation: false,
      };

      const newEntries: CreateProfileAddressEntry[] = [];
      const updates: ProfileAddressDetail[] = [];

      if (draft.billingAddressMeta) {
        updates.push({
          ...primaryAddressFields,
          addressId: draft.billingAddressMeta.addressId,
          profileId,
          createdBy: draft.billingAddressMeta.createdBy,
          createdByName: "",
          createdOn: draft.billingAddressMeta.createdOn,
          modifiedBy: currentUserId,
          modifiedByName: "",
          modifiedOn: now,
        });
      } else {
        newEntries.push({ ...primaryAddressFields, profileId, createdBy: currentUserId });
      }

      draft.addresses.forEach((address) => {
        const fields = {
          officeName: address.officeName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: "",
          pincode: address.pincode,
          city: address.city,
          district: address.district,
          stateName: address.state,
          googleLocationUrl: address.googleLocation,
          isPrimary: false,
          isUnloadingLocation: false,
        };

        if (address.meta) {
          updates.push({
            ...fields,
            addressId: address.meta.addressId,
            profileId,
            createdBy: address.meta.createdBy,
            createdByName: "",
            createdOn: address.meta.createdOn,
            modifiedBy: currentUserId,
            modifiedByName: "",
            modifiedOn: now,
          });
        } else {
          newEntries.push({ ...fields, profileId, createdBy: currentUserId });
        }
      });

      if (newEntries.length > 0) {
        await createProfileAddress(newEntries).unwrap();
      }
      await Promise.all(updates.map((entry) => updateProfileAddress(entry).unwrap()));

      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
