export interface PincodeLocation {
  city: string;
  district: string;
  state: string;
}

interface PostOffice {
  Name?: string;
  District?: string;
  Block?: string;
  State?: string;
}

interface PincodeApiResult {
  Status?: string;
  PostOffice?: PostOffice[] | null;
}

// India-only public lookup: given a 6-digit pincode, resolves the city/
// district/state so forms can auto-fill those fields instead of making the
// user type them. Returns null for anything shorter than 6 digits, an
// unrecognized pincode, or a network failure.
export async function fetchLocationFromPincode(pincode: string): Promise<PincodeLocation | null> {
  if (!pincode || pincode.length !== 6) return null;

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data: PincodeApiResult[] = await response.json();
    const postOffice = data?.[0]?.PostOffice?.[0];

    if (data?.[0]?.Status !== "Success" || !postOffice) return null;

    // City is the town / taluk (Block; a block of "NA" is not a place, so the post office name or the district is used);
    // District is the district.
    const block = postOffice.Block && postOffice.Block.trim().toUpperCase() !== "NA" ? postOffice.Block : "";
    return {
      city: block || postOffice.Name || postOffice.District || "",
      district: postOffice.District || "",
      state: postOffice.State || "",
    };
  } catch (err) {
    console.error("Failed to fetch location for pincode:", pincode, err);
    return null;
  }
}
