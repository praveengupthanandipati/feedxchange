import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileMutation,
} from "../../../../store/businessProfilesApi";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { buildBusinessProfilePayload } from "./businessOwnerWizard.utils";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save business profile:", err);
  return "Failed to save business profile.";
}

// Shared by every wizard step so they all persist the same way: create the
// profile on the first save, then update that same record on every step
// after. Used until the backend adds per-section endpoints.
export const useSaveBusinessProfileStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId, setProfileId } = useBusinessOwnerWizard();
  const [addBusinessProfile] = useAddBusinessProfileMutation();
  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const payload = buildBusinessProfilePayload(draft, currentUserId);

      if (profileId) {
        await updateBusinessProfile({ ...payload, profileId, modifiedBy: currentUserId }).unwrap();
      } else {
        const createdId = Number(await addBusinessProfile(payload).unwrap());
        if (!createdId) {
          throw new Error("Business profile was saved but the server didn't return its profile id.");
        }
        setProfileId(createdId);
      }

      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
