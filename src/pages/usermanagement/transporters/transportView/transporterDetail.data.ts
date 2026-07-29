import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { TransporterProfileDetail } from "../../../../store/transportersApi";

export interface AddressRow {
  id: string;
  officeName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapUrl: string;
}

export interface ContactRow {
  id: string;
  contactName: string;
  isPrimary: boolean;
  designation: string;
  email: string;
  phone: string;
  additionalPhone: string;
}

export interface BankRow {
  id: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchIfsc: string;
  isPrimary: boolean;
}

export interface DocumentRow {
  id: string;
  sno: number;
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface TransporterProfile {
  status: string;
  transporterLegalName: string;
  transporterOwnerName: string;
  tradingName: string;
  mobile: string;
  alternativeContact: string;
  email: string;
  website: string;
  city: string;
  state: string;
  yearOfEstablishment: string;
  panNumber: string;
  gstNumber: string;
  transporterLineId: string;
  transporterTypeId: string;
  group: string;
  referralBy: string;
  googleMapLocation: string;
  transporterDescription: string;
  addresses: AddressRow[];
  contacts: ContactRow[];
  bankDetails: BankRow[];
  documents: DocumentRow[];
}

export function mapTransporterProfileDetail(profile: TransporterProfileDetail): TransporterProfile {
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];
  const contactList = profile.contacts ?? [];

  const joinNonEmpty = (parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

  return {
    status: profile.status,
    transporterLegalName: profile.legalName,
    transporterOwnerName: contactList[0]?.contactPerson ?? "",
    tradingName: profile.tradingName,
    mobile: profile.mobileNumber,
    alternativeContact: profile.alternativeContactNumber,
    email: profile.emailId,
    website: profile.websiteUrl,
    city: primaryAddress?.city ?? "",
    state: primaryAddress?.stateName ?? "",
    yearOfEstablishment: profile.yearOfEstablishment,
    panNumber: profile.panNumber,
    gstNumber: profile.gstNumber,
    transporterLineId: profile.transporterProfileDetails
      ? String(profile.transporterProfileDetails.transporterLineId)
      : "",
    transporterTypeId: profile.transporterProfileDetails
      ? String(profile.transporterProfileDetails.transporterTypeId)
      : "",
    group: profile.groupName,
    referralBy: profile.referredBy,
    googleMapLocation: primaryAddress?.googleLocationUrl ?? "",
    transporterDescription: profile.aboutProfile,
    addresses: addressList.map((address) => ({
      id: String(address.addressId),
      officeName: address.officeName,
      address: joinNonEmpty([address.addressLine1, address.addressLine2, address.landmark]),
      city: address.city,
      state: address.stateName,
      pincode: address.pincode,
      googleMapUrl:
        address.googleLocationUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.addressLine1)}`,
    })),
    contacts: contactList.map((contact, index) => ({
      id: String(contact.contactId),
      contactName: contact.contactPerson,
      isPrimary: index === 0,
      designation: contact.designation,
      email: contact.emailId,
      phone: contact.mobileNumber,
      additionalPhone: contact.alternativeContactNumber,
    })),
    bankDetails: (profile.bankAccounts ?? []).map((account) => ({
      id: String(account.bankAccountId),
      accountType: account.accountType,
      accountName: account.accountHolderName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      branchIfsc: joinNonEmpty([account.branchName, account.ifscCode]),
      isPrimary: account.isPrimaryAccount,
    })),
    documents: (profile.documents ?? []).map((document, index) => ({
      id: String(document.documentId),
      sno: index + 1,
      documentType: document.documentTypeName,
      documentNumber: document.documentNumber,
      issuingAuthority: document.issuingAuthority,
      issueDate: document.issuedDate?.slice(0, 10) ?? "",
      fileName: document.fileName,
    })),
  };
}

export function toRecipientOptions(profile: TransporterProfile): SearchableSelectOption[] {
  return profile.contacts.map((contact) => ({
    value: contact.id,
    label: `${contact.contactName} (${contact.designation})`,
  }));
}
