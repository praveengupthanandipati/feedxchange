// TODO: replace with real data once the reports API is wired up.

export interface ProfileData {
  seller: string;
  sellerCity: string;
  group: string;
  area: string;
  collectionArea: string;
  referredBy: string;
  businessType: string;
  products: string;
  productionCapacityPerMonth: string;
  preferedCourier: string;
  tinNumber: string;
  panNumber: string;
  cstNumber: string;
  vatNumber: string;
  gstProvId: string;
  gstId: string;
  hsnCodes: string;
  mobile: string;
  alternativeContactNumber: string;
  email: string;
  brokerageRate: string;
  autoSmsForContract: boolean;
  autoSmsForPayment: boolean;
  paymentDoneEntry: boolean;
  contractEntry: boolean;
  remarks: string;
  notes: string;
}

export const profileData: ProfileData = {
  seller: "Venkata Sai Solvent India Pvt Ltd",
  sellerCity: "Miryalguda",
  group: "Telangana",
  area: "Telangana",
  collectionArea: "Miryalaguda",
  referredBy: "Mr. Ramesh",
  businessType: "Manufacturer",
  products: "Soybean Meal",
  productionCapacityPerMonth: "0",
  preferedCourier: "Blue Dart",
  tinNumber: "1234567890",
  panNumber: "AABCV1234D",
  cstNumber: "9876543210",
  vatNumber: "VAT1234567",
  gstProvId: "36AADCV9906E1Z5",
  gstId: "36AADCV9906E1Z6",
  hsnCodes: "23099020",
  mobile: "9876543210",
  alternativeContactNumber: "9123456789",
  email: "venkatasaisolvents@gmail.com",
  brokerageRate: "50",
  autoSmsForContract: true,
  autoSmsForPayment: true,
  paymentDoneEntry: true,
  contractEntry: true,
  remarks: "Trusted partner",
  notes: "All payments on time",
};
