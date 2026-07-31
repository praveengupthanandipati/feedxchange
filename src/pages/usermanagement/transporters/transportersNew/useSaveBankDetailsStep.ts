import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProfileBankAccountMutation,
  useUpdateProfileBankAccountMutation,
  type CreateProfileBankAccountEntry,
  type UpdateProfileBankAccountPayload,
} from "../../../../store/userProfilesCommonApi";
import { useTransporterWizard } from "./TransporterWizardContext";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save bank details:", err);
  return "Failed to save bank details.";
}

// Rows with a `meta` (loaded from an existing profile) go through
// UpdateProfileBankAccount; the rest are bundled into one
// CreateProfileBankAccount call.
export const useSaveBankDetailsStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId } = useTransporterWizard();
  const [createProfileBankAccount] = useCreateProfileBankAccountMutation();
  const [updateProfileBankAccount] = useUpdateProfileBankAccountMutation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    if (!profileId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();

      const newEntries: CreateProfileBankAccountEntry[] = [];
      const updates: UpdateProfileBankAccountPayload[] = [];

      draft.bankAccounts.forEach((account) => {
        const fields = {
          bankName: account.bankName,
          accountNumber: account.payeeAccountNumber,
          ifscCode: account.ifscCode,
          accountType: account.accountType,
          branchName: account.cityBranch,
          accountHolderName: account.payeeName,
          isPrimaryAccount: account.id === draft.primaryBankId,
        };

        if (account.meta) {
          updates.push({
            ...fields,
            bankAccountId: account.meta.bankAccountId,
            profileId,
            createdBy: account.meta.createdBy,
            createdOn: account.meta.createdOn,
            modifiedBy: currentUserId,
            modifiedOn: now,
          });
        } else {
          newEntries.push({ ...fields, profileId, createdBy: currentUserId });
        }
      });

      if (newEntries.length > 0) {
        await createProfileBankAccount(newEntries).unwrap();
      }
      await Promise.all(updates.map((entry) => updateProfileBankAccount(entry).unwrap()));

      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
