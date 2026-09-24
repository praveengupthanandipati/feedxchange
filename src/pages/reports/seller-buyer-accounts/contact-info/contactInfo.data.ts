// TODO: replace with real data once the reports API is wired up.

export interface AddressDetails {
  cityHeading: string;
  companyName: string;
  village: string;
  city: string;
  district: string;
  state: string;
  country: string;
  phone: string;
  tinNo: string;
  gstProvId: string;
  gstId: string;
}

export interface ContactDetails {
  contactName: string;
  designation: string;
  mobile: string;
  landline: string;
  email: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  address: string;
  phone: string;
}

export const addressDetails: AddressDetails = {
  cityHeading: "MIRYALGUDA",
  companyName: "Venkata Sai Solvent India Pvt Ltd",
  village: "Tripuram Village",
  city: "MIRYALGUDA",
  district: "Nalgonda District",
  state: "TELANGANA",
  country: "India",
  phone: "",
  tinNo: "",
  gstProvId: "",
  gstId: "36AADCV9906E1Z6",
};

export const contactDetails: ContactDetails = {
  contactName: "",
  designation: "",
  mobile: "",
  landline: "",
  email: "",
};

export const bankDetails: BankDetails = {
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  address: "",
  phone: "",
};
