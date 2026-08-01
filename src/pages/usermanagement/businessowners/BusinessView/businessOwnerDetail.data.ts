import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { BusinessProfileDetail } from "../../../../store/businessProfilesApi";

export interface BrokerageChargeRow {
  productId: number;
  product: string;
  buyCharge: number;
  sellCharge: number;
}

export interface CapacityRow {
  productId: number;
  product: string;
  tpd: number;
  tpm: number;
}

export interface AddressRow {
  id: string;
  officeName: string;
  tag?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapUrl: string;
}

export interface ContactRow {
  id: string;
  contactName: string;
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
  documentName: string;
  registrationNumber: string;
  issueAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface BusinessOwnerProfile {
  profileId: number;
  status: string;
  businessLegalName: string;
  tradingName: string;
  businessType: string;
  mobile: string;
  email: string;
  website: string;
  city: string;
  state: string;
  location: string;
  pincode: string;
  yearOfEstablishment: string;
  lineOfBusiness: string;
  subTypeOfBusiness: string;
  group: string;
  collectionArea: string;
  area: string;
  panNumber: string;
  gstNumber: string;
  businessDescription: string;
  brokerageCharges: BrokerageChargeRow[];
  capacity: CapacityRow[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  bankDetails: BankRow[];
  documents: DocumentRow[];
}

export function mapBusinessProfileDetail(profile: BusinessProfileDetail): BusinessOwnerProfile {
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];
  const details = profile.businessProfileDetails;

  const joinNonEmpty = (parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

  return {
    profileId: profile.profileId,
    status: profile.status ?? "",
    businessLegalName: profile.legalName ?? "",
    tradingName: profile.tradingName ?? "",
    businessType: details?.businessTypeName ?? "",
    mobile: profile.mobileNumber ?? "",
    email: profile.emailId ?? "",
    website: profile.websiteUrl ?? "",
    city: primaryAddress?.city ?? "",
    state: primaryAddress?.stateName ?? "",
    location: joinNonEmpty([primaryAddress?.addressLine1, primaryAddress?.addressLine2, primaryAddress?.landmark]),
    pincode: primaryAddress?.pincode ?? "",
    yearOfEstablishment: profile.yearOfEstablishment ?? "",
    lineOfBusiness: details?.businessLineName ?? "",
    subTypeOfBusiness: details?.businessSubTypeName ?? "",
    group: profile.groupName ?? "",
    collectionArea: profile.collectionArea ?? "",
    area: profile.area ?? "",
    panNumber: profile.panNumber ?? "",
    gstNumber: profile.gstNumber ?? "",
    businessDescription: profile.aboutProfile ?? "",
    brokerageCharges: (profile.buySellCharges ?? []).map((charge) => ({
      productId: charge.productId,
      product: charge.productName,
      buyCharge: charge.buyCharge,
      sellCharge: charge.sellCharge,
    })),
    capacity: (profile.capacityRequirements ?? []).map((req) => ({
      productId: req.productId,
      product: req.productName,
      tpd: req.tonsPerDay,
      tpm: req.tonsPerMonth,
    })),
    addresses: addressList.map((address) => ({
      id: String(address.addressId),
      officeName: address.officeName,
      tag: address.isUnloadingLocation ? "Unloading Location" : undefined,
      address: joinNonEmpty([address.addressLine1, address.addressLine2, address.landmark]),
      city: address.city,
      state: address.stateName,
      pincode: address.pincode,
      googleMapUrl:
        address.googleLocationUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.addressLine1)}`,
    })),
    contacts: (profile.contacts ?? []).map((contact) => ({
      id: String(contact.contactId),
      contactName: contact.contactPerson,
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
      documentName: document.documentTypeName,
      registrationNumber: document.documentNumber,
      issueAuthority: document.issuingAuthority,
      issueDate: document.issuedDate?.slice(0, 10) ?? "",
      fileName: document.fileName,
    })),
  };
}

export function toRecipientOptions(profile: BusinessOwnerProfile): SearchableSelectOption[] {
  return profile.contacts.map((contact) => ({ value: contact.id, label: `${contact.contactName} (${contact.designation})` }));
}
