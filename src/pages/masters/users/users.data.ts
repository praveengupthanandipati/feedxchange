export type UserStatus = "Active" | "Inactive";

export interface MasterUser {
  id: string;
  business: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  /** yyyy-mm-dd, or "". */
  dateOfBirth: string;
  /** yyyy-mm-dd, or "". */
  dateOfAnniversary: string;
  role: string;
  status: UserStatus;
}

/** What the Create / Edit panel collects. Password is only sent, never listed. */
export type UserForm = Omit<MasterUser, "id" | "status"> & { password: string; active: boolean };

export const ROLES = ["BusinessAdmin", "Business User OWNER", "PromoterAdmin", "TransporterAdmin", "SSRTS_Admin"];
export const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: role }));

// TODO: load businesses from the businesses API once it is available.
export const BUSINESSES = [
  "Amaravati - Sri Sai Raghavendra Trader services",
  "Chilakaluripet - Eswar Industries",
  "RK",
  "Krishi",
  "Mini Transporter",
  "Oil Seeds",
  "Aqua",
  "Lakshmi Poultry Complex",
  "Sri Sai Raghavendra Trader Services",
];
export const BUSINESS_OPTIONS = BUSINESSES.map((business) => ({ value: business, label: business }));

/**
 * The signed-in admin. Only SSRTS admins may pick any business; everyone else creates users in their own.
 * TODO: read this from the auth session once login is wired up.
 */
export const CURRENT_ADMIN = { isSsrtsAdmin: false, business: "Amaravati - Sri Sai Raghavendra Trader services" };

export const EMPTY_FORM: UserForm = {
  business: CURRENT_ADMIN.isSsrtsAdmin ? "" : CURRENT_ADMIN.business,
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  altPhone: "",
  address: "",
  postalCode: "",
  city: "",
  state: "",
  country: "",
  dateOfBirth: "",
  dateOfAnniversary: "",
  role: "",
  active: true,
};

const user = (id: string, firstName: string, lastName: string, phone: string, email: string, role: string, business: string, status: UserStatus): MasterUser => ({
  id,
  business,
  firstName,
  lastName,
  email,
  phone,
  altPhone: "",
  address: "",
  postalCode: "",
  city: "",
  state: "",
  country: "",
  dateOfBirth: "",
  dateOfAnniversary: "",
  role,
  status,
});

// TODO: replace with the users API once it is available.
export const initialUsers: MasterUser[] = [
  user("1", "ESWAR KUMAR", "MUTHYALA", "7601083405", "eswar1902@yopmail.com", "BusinessAdmin", "Chilakaluripet - Eswar Industries", "Active"),
  user("2", "Praveen", "Nandipati", "7995165789", "praveennandipati@gmail.com", "Business User OWNER", "Amaravati - Sri Sai Raghavendra Trader services", "Active"),
  user("3", "Rama", "Krishna", "9865321245", "Rk@emptylabs.com", "PromoterAdmin", "RK", "Inactive"),
  user("4", "Hemavardhan", "", "9897654321", "Hema@gmail.com", "PromoterAdmin", "Krishi", "Inactive"),
  user("5", "Amar", "Bhosale", "9850881401", "jawaharroadlines@gmail.com", "TransporterAdmin", "Mini Transporter", "Active"),
  user("6", "Mithinti", "Kiran", "8499083999", "mithinti.kiran@gmail.com", "SSRTS_Admin", "Amaravati - Sri Sai Raghavendra Trader services", "Active"),
  user("7", "Jaganmohan", "Rayapudi", "9246499336", "rayapudiagrooilindustries@gmail.com", "BusinessAdmin", "Oil Seeds", "Inactive"),
  user("8", "Kiran", "Manda", "9966008138", "purnimafeeds@gmail.com", "Business User OWNER", "Aqua", "Active"),
  user("9", "Suresh", "Suresh", "9502584134", "suresh@yopmail.com", "SSRTS_Admin", "Lakshmi Poultry Complex", "Active"),
  user("10", "SSRTS", "Admin", "9502584134", "feedxchange@yopmail.com", "SSRTS_Admin", "Sri Sai Raghavendra Trader Services", "Active"),
];
