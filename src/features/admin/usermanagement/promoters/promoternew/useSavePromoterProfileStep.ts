import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddPromoterProfileMutation,
  useUpdatePromoterProfileMutation,
  useCreatePromoterRegionMutation,
  useUpdatePromoterRegionMutation,
  type CreatePromoterRegionEntry,
  type PromoterRegionDetail,
} from "../../../../../core/store/promotersApi";
import {
  useCreateProfileAddressMutation,
  useLazyGetProfileAddressQuery,
  useUpdateProfileAddressMutation,
  type CreateProfileAddressEntry,
  type ProfileAddressDetail,
} from "../../../../../core/store/userProfilesCommonApi";
import { useEnableAutoNotifications } from "../../../notification-preferences/useEnableAutoNotifications";
import { usePromoterWizard } from "./PromoterWizardContext";
import { buildPromoterProfilePayload } from "./promoterWizard.utils";
import { getErrorMessage as apiErrorMessage } from "../../../../../core/api/getErrorMessage";

class AddressRemovedError extends Error {
  constructor() {
    super(
      "The promoter details were saved, but the server removed the promoter's address while saving them (UpdatePromoterProfile). The address was not saved. Please report this to the backend team.",
    );
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof AddressRemovedError) return err.message;
  console.error("Failed to save promoter profile:", err);
  return apiErrorMessage(err, "Failed to save promoter profile.");
}


export const useSavePromoterProfileStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId, setProfileId } = usePromoterWizard();
  const enableAutoNotifications = useEnableAutoNotifications();
  const [addPromoterProfile] = useAddPromoterProfileMutation();
  const [updatePromoterProfile] = useUpdatePromoterProfileMutation();
  const [createPromoterRegion] = useCreatePromoterRegionMutation();
  const [updatePromoterRegion] = useUpdatePromoterRegionMutation();
  const [createProfileAddress] = useCreateProfileAddressMutation();
  const [updateProfileAddress] = useUpdateProfileAddressMutation();
  const [loadProfileAddresses] = useLazyGetProfileAddressQuery();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();
      const payload = buildPromoterProfilePayload(draft, currentUserId);

      // The profile's addresses as UpdateProfileAddress knows them; null when they couldn't be read.
      const fetchAddresses = async (id: number): Promise<ProfileAddressDetail[] | null> => {
        try {
          return await loadProfileAddresses(String(id)).unwrap();
        } catch {
          return null;
        }
      };

      let currentProfileId = profileId;
      let addressesBeforeUpdate: ProfileAddressDetail[] | null = null;
      if (currentProfileId) {
        addressesBeforeUpdate = await fetchAddresses(currentProfileId);
        await updatePromoterProfile({ ...payload, profileId: currentProfileId, modifiedBy: currentUserId }).unwrap();
      } else {
        const createdId = Number(await addPromoterProfile(payload).unwrap());
        if (!createdId) {
          throw new Error("Promoter profile was saved but the server didn't return its profile id.");
        }
        currentProfileId = createdId;
        setProfileId(createdId);
        enableAutoNotifications(createdId);
      }

      const primaryAddressFields = {
        officeName: draft.promoterName,
        addressLine1: draft.addressLine1,
        addressLine2: draft.addressLine2,
        landmark: draft.landmark,
        pincode: draft.pinCode,
        city: draft.city,
        district: draft.district,
        stateName: draft.state,
        googleLocationUrl: "",
        isPrimary: true,
        isUnloadingLocation: false,
      };

      const newAddressEntries: CreateProfileAddressEntry[] = [];
      const updatedAddressEntries: ProfileAddressDetail[] = [];

      // Use the address as UpdateProfileAddress knows it: the id held from GetPromoterProfileById can be one the
      // update API doesn't find ("Profile address not found"), and a promoter created in this session has no id
      // held at all (each later save created another address). Only when the lookup fails is the held id used.
      const savedAddresses = await fetchAddresses(currentProfileId!);

      // The address was there before the profile update and is gone after it: the server removed it. Say so
      // instead of quietly creating a new address on every save.
      if (addressesBeforeUpdate && addressesBeforeUpdate.length > 0 && savedAddresses && savedAddresses.length === 0) {
        throw new AddressRemovedError();
      }
      const heldId = draft.billingAddressMeta?.addressId;
      const existingAddress = savedAddresses
        ? savedAddresses.find((address) => address.addressId === heldId) ??
          savedAddresses.find((address) => address.isPrimary) ??
          savedAddresses[0]
        : draft.billingAddressMeta
          ? { addressId: draft.billingAddressMeta.addressId, createdBy: draft.billingAddressMeta.createdBy, createdOn: draft.billingAddressMeta.createdOn }
          : undefined;

      if (existingAddress) {
        updatedAddressEntries.push({
          ...primaryAddressFields,
          addressId: existingAddress.addressId,
          profileId: currentProfileId!,
          createdBy: existingAddress.createdBy,
          createdByName: "",
          createdOn: existingAddress.createdOn,
          modifiedBy: currentUserId,
          modifiedByName: "",
          modifiedOn: now,
        });
      } else {
        newAddressEntries.push({ ...primaryAddressFields, profileId: currentProfileId!, createdBy: currentUserId });
      }

      if (newAddressEntries.length > 0) {
        await createProfileAddress(newAddressEntries).unwrap();
      }
      await Promise.all(updatedAddressEntries.map((entry) => updateProfileAddress(entry).unwrap()));

      const newRegions: CreatePromoterRegionEntry[] = [];
      const updatedRegions: PromoterRegionDetail[] = [];

      // The "Add" button appends an empty row for the next region; State is required, so a row without one is not a region yet.
      draft.regions.filter((region) => region.stateName).forEach((region) => {
        if (region.meta) {
          updatedRegions.push({
            regionId: region.meta.regionId,
            profileId: currentProfileId!,
            stateName: region.stateName,
            districtName: region.districtName,
            cityName: region.cityName,
            createdBy: region.meta.createdBy,
            createdOn: region.meta.createdOn,
            modifiedBy: currentUserId,
            modifiedOn: now,
          });
        } else {
          newRegions.push({
            profileId: currentProfileId!,
            stateName: region.stateName,
            districtName: region.districtName,
            cityName: region.cityName,
            createdBy: currentUserId,
            createdOn: now,
          });
        }
      });

      if (newRegions.length > 0) {
        await createPromoterRegion(newRegions).unwrap();
      }
      await Promise.all(updatedRegions.map((entry) => updatePromoterRegion(entry).unwrap()));

      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
