import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddTransporterProfileMutation,
  useUpdateTransporterProfileMutation,
} from "../../../../store/transportersApi";
import { useTransporterWizard } from "./TransporterWizardContext";
import { buildTransporterProfilePayload } from "./transporterWizard.utils";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save transporter profile:", err);
  return "Failed to save transporter profile.";
}

// Shared by every wizard step so they all persist the same way: create the
// profile on the first save, then update that same record on every step
// after. Used until the backend adds per-section endpoints for contacts.
export const useSaveTransporterProfileStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId, setProfileId } = useTransporterWizard();
  const [addTransporterProfile] = useAddTransporterProfileMutation();
  const [updateTransporterProfile] = useUpdateTransporterProfileMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const payload = buildTransporterProfilePayload(draft, currentUserId);

      if (profileId) {
        await updateTransporterProfile({ ...payload, profileId, modifiedBy: currentUserId }).unwrap();
      } else {
        const createdId = Number(await addTransporterProfile(payload).unwrap());
        if (!createdId) {
          throw new Error("Transporter profile was saved but the server didn't return its profile id.");
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
