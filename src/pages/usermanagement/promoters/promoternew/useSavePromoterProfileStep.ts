import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddPromoterProfileMutation,
  useUpdatePromoterProfileMutation,
  useCreatePromoterRegionMutation,
  useUpdatePromoterRegionMutation,
  type CreatePromoterRegionEntry,
  type PromoterRegionDetail,
} from "../../../../store/promotersApi";
import {
  useCreateProfileAddressMutation,
  useUpdateProfileAddressMutation,
  type CreateProfileAddressEntry,
  type ProfileAddressDetail,
} from "../../../../store/userProfilesCommonApi";
import { usePromoterWizard } from "./PromoterWizardContext";
import { buildPromoterProfilePayload } from "./promoterWizard.utils";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save promoter profile:", err);
  return "Failed to save promoter profile.";
}


export const useSavePromoterProfileStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId, setProfileId } = usePromoterWizard();
  const [addPromoterProfile] = useAddPromoterProfileMutation();
  const [updatePromoterProfile] = useUpdatePromoterProfileMutation();
  const [createPromoterRegion] = useCreatePromoterRegionMutation();
  const [updatePromoterRegion] = useUpdatePromoterRegionMutation();
  const [createProfileAddress] = useCreateProfileAddressMutation();
  const [updateProfileAddress] = useUpdateProfileAddressMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();
      const payload = buildPromoterProfilePayload(draft, currentUserId);

      let currentProfileId = profileId;
      if (currentProfileId) {
        await updatePromoterProfile({ ...payload, profileId: currentProfileId, modifiedBy: currentUserId }).unwrap();
      } else {
        const createdId = Number(await addPromoterProfile(payload).unwrap());
        if (!createdId) {
          throw new Error("Promoter profile was saved but the server didn't return its profile id.");
        }
        currentProfileId = createdId;
        setProfileId(createdId);
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

      if (draft.billingAddressMeta) {
        updatedAddressEntries.push({
          ...primaryAddressFields,
          addressId: draft.billingAddressMeta.addressId,
          profileId: currentProfileId!,
          createdBy: draft.billingAddressMeta.createdBy,
          createdByName: "",
          createdOn: draft.billingAddressMeta.createdOn,
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

      draft.regions.forEach((region) => {
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
