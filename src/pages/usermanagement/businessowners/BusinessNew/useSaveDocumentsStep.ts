import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProfileDocumentMutation,
  useUpdateProfileDocumentMutation,
  useDocumentFileFieldsResolver,
  resolveDocumentFolderName,
  type CreateProfileDocumentEntry,
  type UpdateProfileDocumentPayload,
} from "../../../../store/userProfilesCommonApi";
import { useUpdateBusinessProfileMutation } from "../../../../store/businessProfilesApi";
import { useBusinessOwnerWizard } from "./BusinessOwnerWizardContext";
import { buildBusinessProfilePayload } from "./businessOwnerWizard.utils";
import { documentTypeOptions } from "./newBusiness.data";

function getErrorMessage(err: unknown): string {
  console.error("Failed to save documents:", err);
  return "Failed to save documents.";
}

export const useSaveDocumentsStep = (nextPath: string) => {
  const navigate = useNavigate();
  const { draft, profileId } = useBusinessOwnerWizard();
  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();
  const [createProfileDocument] = useCreateProfileDocumentMutation();
  const [updateProfileDocument] = useUpdateProfileDocumentMutation();
  const resolveFileFields = useDocumentFileFieldsResolver();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    if (!profileId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const currentUserId = Number(localStorage.getItem("userId")) || 0;
      const now = new Date().toISOString();

      await updateBusinessProfile({
        ...buildBusinessProfilePayload(draft, currentUserId),
        profileId,
        modifiedBy: currentUserId,
      }).unwrap();

      const newEntries: CreateProfileDocumentEntry[] = [];
      const updates: UpdateProfileDocumentPayload[] = [];

      for (const document of draft.documents) {
        const fileFields = await resolveFileFields(
          document,
          resolveDocumentFolderName(documentTypeOptions, document.documentTypeId),
        );
        const fields = {
          documentTypeId: Number(document.documentTypeId) || 0,
          documentNumber: document.documentNumber,
          fileName: document.fileName,
          issuingAuthority: document.issuingAuthority,
          issuedDate: document.issuedDate,
          ...fileFields,
          isVerified: false,
          verifiedBy: 0,
          verifiedOn: now,
        };

        if (document.meta) {
          updates.push({
            ...fields,
            documentId: document.meta.documentId,
            profileId,
            createdBy: document.meta.createdBy,
            createdOn: document.meta.createdOn,
          });
        } else {
          newEntries.push({ ...fields, profileId, createdBy: currentUserId });
        }
      }

      if (newEntries.length > 0) {
        await createProfileDocument(newEntries).unwrap();
      }
      await Promise.all(updates.map((entry) => updateProfileDocument(entry).unwrap()));

      navigate(nextPath);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, handleSaveAndContinue };
};
