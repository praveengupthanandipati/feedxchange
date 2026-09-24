import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileMutation,
  useCreateBusinessCapacityRequirementMutation,
  useUpdateBusinessCapacityRequirementMutation,
  useCreateBusinessBuySellChargeMutation,
  useUpdateBusinessBuySellChargeMutation,
  type CreateBusinessCapacityRequirementEntry,
  type UpdateBusinessCapacityRequirementPayload,
  type CreateBusinessBuySellChargeEntry,
  type UpdateBusinessBuySellChargePayload,
} from "../../../../store/businessProfilesApi";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { buildBusinessProfilePayload } from "./businessOwnerWizard.utils";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save business profile:", err);
  return "Failed to save business profile.";
}

export const useSaveBusinessProfileMainStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId, setProfileId } = useBusinessOwnerWizard();
  const [addBusinessProfile] = useAddBusinessProfileMutation();
  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();
  const [createBusinessCapacityRequirement] = useCreateBusinessCapacityRequirementMutation();
  const [updateBusinessCapacityRequirement] = useUpdateBusinessCapacityRequirementMutation();
  const [createBusinessBuySellCharge] = useCreateBusinessBuySellChargeMutation();
  const [updateBusinessBuySellCharge] = useUpdateBusinessBuySellChargeMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();
      const payload = buildBusinessProfilePayload(draft, currentUserId);

      let currentProfileId = profileId;
      const isUpdate = Boolean(currentProfileId);
      if (currentProfileId) {
        await updateBusinessProfile({ ...payload, profileId: currentProfileId, modifiedBy: currentUserId }).unwrap();
      } else {
        const createdId = Number(await addBusinessProfile(payload).unwrap());
        if (!createdId) {
          throw new Error("Business profile was saved but the server didn't return its profile id.");
        }
        currentProfileId = createdId;
        setProfileId(createdId);
      }

      const newCapacityRows: CreateBusinessCapacityRequirementEntry[] = [];
      const updatedCapacityRows: UpdateBusinessCapacityRequirementPayload[] = [];

      draft.capacityRows.forEach((row) => {
        const productId = Number(row.productId) || 0;
        const tonsPerDay = Number(row.tonsPerDay) || 0;
        const tonsPerMonth = Number(row.tonsPerMonth) || 0;

        if (row.meta) {
          updatedCapacityRows.push({
            capacityRequirementId: row.meta.capacityRequirementId,
            profileId: currentProfileId!,
            productId,
            tonsPerDay,
            tonsPerMonth,
            createdBy: row.meta.createdBy,
            createdOn: row.meta.createdOn,
            modifiedBy: currentUserId,
            modifiedOn: now,
          });
        } else {
          newCapacityRows.push({
            profileId: currentProfileId!,
            productId,
            tonsPerDay,
            tonsPerMonth,
            createdBy: currentUserId,
          });
        }
      });

      if (newCapacityRows.length > 0) {
        await createBusinessCapacityRequirement(newCapacityRows).unwrap();
      }
      await Promise.all(updatedCapacityRows.map((entry) => updateBusinessCapacityRequirement(entry).unwrap()));

      const newBrokerageRows: CreateBusinessBuySellChargeEntry[] = [];
      const updatedBrokerageRows: UpdateBusinessBuySellChargePayload[] = [];

      draft.brokerageRows.forEach((row) => {
        const productId = Number(row.productId) || 0;
        const buyCharge = Number(row.buyCharge) || 0;
        const sellCharge = Number(row.sellCharge) || 0;

        if (row.meta) {
          updatedBrokerageRows.push({
            chargeId: row.meta.chargeId,
            profileId: currentProfileId!,
            productId,
            buyCharge,
            sellCharge,
            effectiveFrom: row.meta.effectiveFrom,
            effectiveTo: row.meta.effectiveTo,
            isActive: row.meta.isActive,
            createdBy: row.meta.createdBy,
            createdOn: row.meta.createdOn,
            modifiedBy: currentUserId,
            modifiedOn: now,
          });
        } else {
          newBrokerageRows.push({
            profileId: currentProfileId!,
            productId,
            buyCharge,
            sellCharge,
            effectiveFrom: now,
            effectiveTo: now,
            isActive: true,
            createdBy: currentUserId,
          });
        }
      });

      if (newBrokerageRows.length > 0) {
        await createBusinessBuySellCharge(newBrokerageRows).unwrap();
      }
      await Promise.all(updatedBrokerageRows.map((entry) => updateBusinessBuySellCharge(entry).unwrap()));

      localStorage.setItem(
        "successMessage",
        isUpdate ? "Business owner updated successfully" : "Business owner added successfully",
      );
      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
