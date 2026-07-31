import type { AddTransporterProfilePayload, TransporterProfileDetail } from "../../../../store/transportersApi";
import type { TransporterDraft } from "./TransporterWizardContext";
import { nextContactId, nextAddressId } from "./ContactsAddresses";
import { nextBankEntryId } from "./BankDetailsSection";
import { nextDocumentId } from "./DocumentsSection";

const toNumber = (value: string) => Number(value) || 0;

// Used by the Transporter Profile and Contacts & Addresses steps, which
// still save through the whole Add/Update Transporter Profile call (core
// profile fields + contacts have no dedicated endpoint yet). Bank details
// and documents have their own userProfilesCommonApi endpoints — see
// useSaveTransporterBankDetailsStep/useSaveTransporterDocumentsStep — so
// this payload always sends those two (and addresses) empty.
export function buildTransporterProfilePayload(
  draft: TransporterDraft,
  currentUserId: number,
): AddTransporterProfilePayload {
  return {
    profileTypeId: 2, // Transporter — confirmed via GetProfileTypes
    legalName: draft.legalName,
    tradingName: draft.tradingName,
    yearOfEstablishment: draft.establishmentYear,
    panNumber: draft.panNumber,
    gstNumber: draft.gstNumber,
    emailId: draft.billingEmail,
    mobileNumber: draft.primaryMobileNumber,
    alternativeContactNumber: draft.primaryAlternativeContact,
    websiteUrl: draft.websiteUrl,
    groupName: draft.group,
    referredBy: draft.referralCode,
    aboutProfile: draft.aboutTransporter,
    status: "Active",
    createdBy: currentUserId,
    transporterProfileDetails: {
      transporterLineId: toNumber(draft.transporterLineId),
      transporterTypeId: toNumber(draft.typeOfTransporter),
    },
    addresses: [],
    contacts: draft.contacts.map((contact) => ({
      contactType: contact.contactType,
      contactPerson: contact.contactPersonName,
      designation: contact.designation,
      mobileNumber: contact.mobileNumber,
      alternativeContactNumber: contact.alternativeContact,
      emailId: contact.email,
      isUnloadingContact: false,
    })),
    bankAccounts: [],
    documents: [],
  };
}


export function hydrateDraftFromTransporterProfile(profile: TransporterProfileDetail): TransporterDraft {
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];
  const contactList = profile.contacts ?? [];

  const bankRows = (profile.bankAccounts ?? []).map((account) => ({
    id: nextBankEntryId(),
    accountType: account.accountType,
    payeeName: account.accountHolderName,
    payeeAccountNumber: account.accountNumber,
    ifscCode: account.ifscCode,
    bankName: account.bankName,
    cityBranch: account.branchName,
    ifscError: "",
    isPrimaryAccount: account.isPrimaryAccount,
    meta: account.bankAccountId
      ? { bankAccountId: account.bankAccountId, createdBy: account.createdBy, createdOn: account.createdOn }
      : undefined,
  }));
  const primaryBank = bankRows.find((row) => row.isPrimaryAccount);

  return {
    legalName: profile.legalName,
    tradingName: profile.tradingName,
    establishmentYear: profile.yearOfEstablishment,
    panNumber: profile.panNumber,
    gstNumber: profile.gstNumber,
    transporterLineId: profile.transporterProfileDetails
      ? String(profile.transporterProfileDetails.transporterLineId)
      : "",
    typeOfTransporter: profile.transporterProfileDetails
      ? String(profile.transporterProfileDetails.transporterTypeId)
      : "",
    group: profile.groupName,
    referralCode: profile.referredBy,
    aboutTransporter: profile.aboutProfile,
    billingAddressLine1: primaryAddress?.addressLine1 ?? "",
    billingAddressLine2: primaryAddress?.addressLine2 ?? "",
    landmark: primaryAddress?.landmark ?? "",
    billingPincode: primaryAddress?.pincode ?? "",
    billingCity: primaryAddress?.city ?? "",
    billingDistrict: primaryAddress?.district ?? "",
    billingState: primaryAddress?.stateName ?? "",
    billingEmail: profile.emailId,
    websiteUrl: profile.websiteUrl,
    billingGoogleMapLocation: primaryAddress?.googleLocationUrl ?? "",
    primaryFullName: contactList[0]?.contactPerson ?? "",
    primaryMobileNumber: profile.mobileNumber,
    primaryAlternativeContact: profile.alternativeContactNumber,
    contacts: contactList.map((contact) => ({
      id: nextContactId(),
      contactType: contact.contactType,
      contactPersonName: contact.contactPerson,
      designation: contact.designation,
      mobileNumber: contact.mobileNumber,
      alternativeContact: contact.alternativeContactNumber,
      email: contact.emailId,
    })),
    addresses: addressList
      .filter((address) => address !== primaryAddress)
      .map((address) => ({
        id: nextAddressId(),
        officeName: address.officeName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        pincode: address.pincode,
        city: address.city,
        district: address.district,
        state: address.stateName,
        googleLocation: address.googleLocationUrl,
        meta: address.addressId
          ? { addressId: address.addressId, createdBy: address.createdBy, createdOn: address.createdOn }
          : undefined,
      })),
    bankAccounts: bankRows.map((row) => ({
      id: row.id,
      accountType: row.accountType,
      payeeName: row.payeeName,
      payeeAccountNumber: row.payeeAccountNumber,
      ifscCode: row.ifscCode,
      bankName: row.bankName,
      cityBranch: row.cityBranch,
      ifscError: row.ifscError,
      meta: row.meta,
    })),
    primaryBankId: primaryBank ? primaryBank.id : (bankRows[0]?.id ?? null),
    documents: (profile.documents ?? []).map((document) => ({
      id: nextDocumentId(),
      documentType: String(document.documentTypeId),
      documentNumber: document.documentNumber,
      issuingAuthorityName: document.issuingAuthority,
      issuedDate: document.issuedDate.slice(0, 10),
      fileName: document.fileName,
      fileError: "",
      meta: document.documentId
        ? {
            documentId: document.documentId,
            createdBy: document.createdBy,
            createdOn: document.createdOn,
            filePath: document.filePath,
            fileSize: document.fileSize,
            contentType: document.contentType,
            uploadDate: document.uploadDate,
          }
        : undefined,
    })),
    billingAddressMeta: primaryAddress?.addressId
      ? { addressId: primaryAddress.addressId, createdBy: primaryAddress.createdBy, createdOn: primaryAddress.createdOn }
      : null,
  };
}
