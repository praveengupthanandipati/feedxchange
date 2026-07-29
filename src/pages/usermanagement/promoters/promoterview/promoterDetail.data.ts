import type { SearchableSelectOption } from "../../../../components/dropdown/SearchableSelect";
import type { PromoterProfileDetail } from "../../../../store/promotersApi";

export interface DocumentRow {
  id: string;
  sno: number;
  documentName: string;
  registrationNumber: string;
  issueAuthority: string;
  issueDate: string;
  fileName: string;
}

export interface RegionRow {
  id: string;
  stateName: string;
  districtName: string;
  cityName: string;
}

export interface PromoterProfile {
  promoterCode: string;
  promoterName: string;
  status: string;
  mobileNumber: string;
  emailId: string;
  completeAddress: string;
  companyName: string;
  designation: string;
  commissionStructure: string;
  commissionRateValue: string;
  paymentFrequency: string;
  totalReferrals: string;
  remarks: string;
  regions: RegionRow[];
  documents: DocumentRow[];
}

export function mapPromoterProfileDetail(profile: PromoterProfileDetail): PromoterProfile {
  const details = profile.promoterProfileDetails;
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];
  const joinNonEmpty = (parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

  return {
    promoterCode: details?.promoterCode ?? "",
    promoterName: profile.legalName,
    status: profile.status,
    mobileNumber: profile.mobileNumber,
    emailId: profile.emailId,
    completeAddress: joinNonEmpty([
      primaryAddress?.addressLine1,
      primaryAddress?.addressLine2,
      primaryAddress?.city,
      primaryAddress?.district,
      primaryAddress?.stateName,
      primaryAddress?.pincode,
    ]),
    companyName: details?.companyName ?? "",
    designation: details?.designation ?? "",
    commissionStructure: details?.commissionStructure ?? "",
    commissionRateValue: details ? String(details.commissionRate) : "",
    paymentFrequency: details?.paymentFrequency ?? "",
    totalReferrals: details ? String(details.totalReferrals) : "",
    remarks: details?.remarks ?? "",
    regions: (profile.promoterRegions ?? []).map((region) => ({
      id: String(region.regionId),
      stateName: region.stateName,
      districtName: region.districtName,
      cityName: region.cityName,
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

export function toRecipientOptions(profile: PromoterProfile): SearchableSelectOption[] {
  return [{ value: profile.promoterCode, label: profile.promoterName }];
}
