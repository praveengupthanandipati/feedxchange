export interface Driver {
  driverId: number;
  driverName: string;
  mobileNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  dateOfBirth: string;
  address: string;
  licenseType: string;
  licenseIssuedDate: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  bloodGroup: string;
  experienceYears: number;
  aadharNumber: string;
  panNumber: string;
  actionPerformedBy: number;
  // TODO: not part of the payload shared by the backend team yet — needed for
  // the State/Transporter filters below. Confirm field names once the driver
  // summary API is available.
  stateName: string;
  transporterName: string;
}
