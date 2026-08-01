import type { AddBusinessProfilePayload, BusinessProfileDetail } from "../../../../store/businessProfilesApi";
import type { BusinessOwnerDraft } from "./BusinessOwnerWizardContext";
import { nextBrokerageRowId, nextCapacityRowId } from "./BusinessProfile";
import { nextContactId, nextAddressId } from "./ContactsAddresses";
import { nextBankEntryId } from "./BankDetailsSection";
import { nextDocumentId } from "./DocumentsSection";

const toNumber = (value: string) => Number(value) || 0;

// Used by the Business Profile and Contacts & Addresses steps, which still
// save through the whole Add/Update Business Profile call (core profile
// fields + contacts have no dedicated endpoint yet). Bank details, documents
// and capacity requirements have all moved to their own dedicated
// endpoints — see useSaveBankDetailsStep/useSaveDocumentsStep/
// useSaveBusinessProfileStep — so this payload always sends those empty.
export function buildBusinessProfilePayload(
  draft: BusinessOwnerDraft,
  currentUserId: number,
): AddBusinessProfilePayload {
  return {
    profileTypeId: 1, // Business — confirmed via GetProfileTypes
    legalName: draft.legalName,
    tradingName: draft.tradingName,
    yearOfEstablishment: draft.yearOfEstablishment,
    panNumber: draft.panNumber,
    gstNumber: draft.gstNumber,
    emailId: draft.emailId,
    mobileNumber: draft.mobileNumber,
    alternativeContactNumber: draft.alternativeContactNumber,
    websiteUrl: draft.websiteUrl,
    // No UI field for this anymore, but the backend payload still requires it.
    groupName: "",
    collectionArea: draft.collectionArea,
    area: draft.area,
    referredBy: draft.referredBy,
    aboutProfile: draft.aboutProfile,
    status: "Active",
    createdBy: currentUserId,
    businessProfileDetails: {
      businessLineId: toNumber(draft.businessLineId),
      businessTypeId: toNumber(draft.businessTypeId),
      businessSubTypeId: toNumber(draft.businessSubTypeId),
      buyBrokerageCharges: toNumber(draft.buyBrokerageCharges),
      sellBrokerageCharges: toNumber(draft.sellBrokerageCharges),
    },
    // Addresses, bank accounts and documents are no longer sent through the
    // whole-profile save — they persist via their own dedicated endpoints in
    // userProfilesCommonApi (see useSaveContactsAddressesStep/
    // useSaveBankDetailsStep/useSaveDocumentsStep), so this payload always
    // sends them empty. Contacts stay embedded here since no dedicated
    // per-contact endpoint exists yet.
    addresses: [],
    contacts: draft.contacts.map((contact) => ({
      contactType: contact.contactType,
      contactPerson: contact.contactPerson,
      designation: contact.designation,
      mobileNumber: contact.mobileNumber,
      alternativeContactNumber: contact.alternativeContactNumber,
      emailId: contact.emailId,
      isUnloadingContact: false,
    })),
    bankAccounts: [],
    documents: [],
    // Capacity requirements and buy/sell charges now persist through their
    // own dedicated endpoints (see useSaveBusinessProfileMainStep),
    // so this payload always sends them empty.
    capacityRequirements: [],
    buySellCharges: [],
  };
}

// Reverse of buildBusinessProfilePayload — turns a GetBusinessProfileById
// response back into wizard draft shape so the "Edit" flow can pre-fill
// every step instead of starting from a blank profile.
export function hydrateDraftFromProfile(profile: BusinessProfileDetail): BusinessOwnerDraft {
  const details = profile.businessProfileDetails;
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];
  const contactList = profile.contacts ?? [];

  const bankRows = (profile.bankAccounts ?? []).map((account) => ({
    id: nextBankEntryId(),
    accountType: account.accountType,
    accountHolderName: account.accountHolderName,
    accountNumber: account.accountNumber,
    ifscCode: account.ifscCode,
    bankName: account.bankName,
    branchName: account.branchName,
    ifscError: "",
    isPrimaryAccount: account.isPrimaryAccount,
    meta: account.bankAccountId
      ? { bankAccountId: account.bankAccountId, createdBy: account.createdBy, createdOn: account.createdOn }
      : undefined,
  }));
  const primaryBank = bankRows.find((row) => row.isPrimaryAccount);

  return {
    legalName: profile.legalName ?? "",
    tradingName: profile.tradingName ?? "",
    yearOfEstablishment: profile.yearOfEstablishment ?? "",
    panNumber: profile.panNumber ?? "",
    gstNumber: profile.gstNumber ?? "",
    businessLineId: details ? String(details.businessLineId) : "",
    businessTypeId: details ? String(details.businessTypeId) : "",
    businessSubTypeId: details ? String(details.businessSubTypeId) : "",
    area: profile.area ?? "",
    collectionArea: profile.collectionArea ?? "",
    referredBy: profile.referredBy ?? "",
    aboutProfile: profile.aboutProfile ?? "",
    emailId: profile.emailId ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    mobileNumber: profile.mobileNumber ?? "",
    alternativeContactNumber: profile.alternativeContactNumber ?? "",
    buyBrokerageCharges: details ? String(details.buyBrokerageCharges) : "",
    sellBrokerageCharges: details ? String(details.sellBrokerageCharges) : "",
    brokerageRows: (profile.buySellCharges ?? []).map((charge) => ({
      id: nextBrokerageRowId(),
      productId: String(charge.productId),
      buyCharge: String(charge.buyCharge),
      sellCharge: String(charge.sellCharge),
      meta: charge.chargeId
        ? {
            chargeId: charge.chargeId,
            createdBy: charge.createdBy,
            createdOn: charge.createdOn,
            effectiveFrom: charge.effectiveFrom,
            effectiveTo: charge.effectiveTo,
            isActive: charge.isActive,
          }
        : undefined,
    })),
    capacityRows: (profile.capacityRequirements ?? []).map((req) => ({
      id: nextCapacityRowId(),
      productId: String(req.productId),
      tonsPerDay: String(req.tonsPerDay),
      tonsPerMonth: String(req.tonsPerMonth),
      meta: req.capacityRequirementId
        ? {
            capacityRequirementId: req.capacityRequirementId,
            createdBy: req.createdBy,
            createdOn: req.createdOn,
          }
        : undefined,
    })),
    billingAddressLine1: primaryAddress?.addressLine1 ?? "",
    billingAddressLine2: primaryAddress?.addressLine2 ?? "",
    billingLandmark: primaryAddress?.landmark ?? "",
    billingPincode: primaryAddress?.pincode ?? "",
    billingCity: primaryAddress?.city ?? "",
    billingDistrict: primaryAddress?.district ?? "",
    billingStateName: primaryAddress?.stateName ?? "",
    billingGoogleLocationUrl: primaryAddress?.googleLocationUrl ?? "",
    primaryContactPerson: contactList[0]?.contactPerson ?? "",
    contacts: contactList.map((contact) => ({
      id: nextContactId(),
      contactType: contact.contactType,
      contactPerson: contact.contactPerson,
      designation: contact.designation,
      mobileNumber: contact.mobileNumber,
      alternativeContactNumber: contact.alternativeContactNumber,
      emailId: contact.emailId,
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
        stateName: address.stateName,
        googleLocationUrl: address.googleLocationUrl,
        meta: address.addressId
          ? { addressId: address.addressId, createdBy: address.createdBy, createdOn: address.createdOn }
          : undefined,
      })),
    bankAccounts: bankRows.map((row) => ({
      id: row.id,
      accountType: row.accountType,
      accountHolderName: row.accountHolderName,
      accountNumber: row.accountNumber,
      ifscCode: row.ifscCode,
      bankName: row.bankName,
      branchName: row.branchName,
      ifscError: row.ifscError,
      meta: row.meta,
    })),
    primaryBankId: primaryBank ? primaryBank.id : (bankRows[0]?.id ?? null),
    documents: (profile.documents ?? []).map((document) => ({
      id: nextDocumentId(),
      documentTypeId: String(document.documentTypeId),
      documentNumber: document.documentNumber,
      issuingAuthority: document.issuingAuthority,
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
