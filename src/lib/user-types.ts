export interface AppUser {
  id: string;
  name: string;
  email: string;
  postcode: string;
  tier: "free" | "premium";
}
