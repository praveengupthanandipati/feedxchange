import type { AddPromoterProfilePayload, PromoterProfileDetail } from "../../../../store/promotersApi";
import type { PromoterDraft } from "./PromoterWizardContext";
import { nextDocumentId } from "./DocumentsSection";
import { nextRegionId } from "./RegionSection";


export function buildPromoterProfilePayload(
  draft: PromoterDraft,
  currentUserId: number,
): AddPromoterProfilePayload {
  const now = new Date().toISOString();

  return {
    profileTypeId: 3, 
    profilePictureUrl: "",
    firstName: "",
    lastName: "",
    legalName: draft.promoterName,
    tradingName: draft.tradingName,
    yearOfEstablishment: draft.yearOfEstablishment,
    panNumber: draft.panNumber,
    gstNumber: draft.gstNumber,
    emailId: draft.emailAddress,
    mobileNumber: draft.mobileNumber,
    alternativeContactNumber: draft.alternativeContactNumber,
    websiteUrl: draft.websiteUrl,
    groupName: draft.groupName,
    collectionArea: draft.collectionArea,
    area: draft.area,
    referredBy: draft.referredBy,
    aboutProfile: draft.aboutProfile,
    status: "Active",
    createdBy: currentUserId,
    promoterProfileDetails: {
      promoterCode: draft.promoterCode,
      companyName: draft.companyName,
      designation: draft.designation,
      commissionStructure: draft.commissionStructure,
      commissionRate: Number(draft.commissionRateValue) || 0,
      paymentFrequency: draft.paymentFrequency,
      internalNotes: "",
      remarks: draft.remarks,
      totalReferrals: 0,
      totalActiveReferrals: 0,
      isVerified: false,
      verifiedBy: 0,
      verifiedOn: now,
      createdBy: currentUserId,
      createdOn: now,
    },
  };
}

export function hydrateDraftFromPromoterProfile(profile: PromoterProfileDetail): PromoterDraft {
  const details = profile.promoterProfileDetails;
  const addressList = profile.addresses ?? [];
  const primaryAddress = addressList.find((address) => address.isPrimary) ?? addressList[0];

  return {
    promoterCode: details?.promoterCode ?? "",
    promoterName: profile.legalName,
    companyName: details?.companyName ?? "",
    tradingName: profile.tradingName,
    yearOfEstablishment: profile.yearOfEstablishment,
    panNumber: profile.panNumber,
    gstNumber: profile.gstNumber,
    mobileNumber: profile.mobileNumber,
    alternativeContactNumber: profile.alternativeContactNumber,
    emailAddress: profile.emailId,
    websiteUrl: profile.websiteUrl,
    designation: details?.designation ?? "",
    addressLine1: primaryAddress?.addressLine1 ?? "",
    addressLine2: primaryAddress?.addressLine2 ?? "",
    landmark: primaryAddress?.landmark ?? "",
    pinCode: primaryAddress?.pincode ?? "",
    city: primaryAddress?.city ?? "",
    district: primaryAddress?.district ?? "",
    state: primaryAddress?.stateName ?? "",
    groupName: profile.groupName,
    area: profile.area,
    collectionArea: profile.collectionArea,
    referredBy: profile.referredBy,
    aboutProfile: profile.aboutProfile,
    associatedProducts: "",
    regions: (profile.promoterRegions ?? []).map((region) => ({
      id: nextRegionId(),
      stateName: region.stateName,
      districtName: region.districtName,
      cityName: region.cityName,
      meta: region.regionId
        ? { regionId: region.regionId, createdBy: region.createdBy, createdOn: region.createdOn }
        : undefined,
    })),
    commissionStructure: details?.commissionStructure ?? "",
    commissionRateValue: details ? String(details.commissionRate) : "",
    paymentFrequency: details?.paymentFrequency ?? "",
    termsAndConditions: "",
    remarks: details?.remarks ?? "",
    documents: (profile.documents ?? []).map((document) => ({
      id: nextDocumentId(),
      documentType: String(document.documentTypeId),
      documentNumber: document.documentNumber,
      issuingAuthorityName: document.issuingAuthority,
      dateOfIssue: document.issuedDate.slice(0, 10),
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
