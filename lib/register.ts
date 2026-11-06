/** Shared by the register route handlers and the wizard. */
export const TICKET_COOKIE = "od_reg_ticket";

export const TRADES = ["Construction", "Interiors", "Electrical", "Plumbing", "Painting", "Fabrication", "Facility services", "Other"] as const;
export const TEAM_SIZES = ["1–10", "11–25", "26–50", "51–100", "100+"] as const;
export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

/** The first word of the business name, lowercased, letters and digits only: "Sharma Builders" → "sharma". */
export function suggestPrefix(businessName: string): string {
  const first = businessName.trim().split(/\s+/)[0] ?? "";
  return first.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
}

/** Why a prefix cannot be used, before asking the API; null when it looks fine. */
export function prefixProblem(prefix: string): string | null {
  if (!/^[a-z]/.test(prefix)) return "Start with a letter.";
  if (!/^[a-z0-9]+$/.test(prefix)) return "Use only lowercase letters and numbers.";
  if (prefix.length < 3) return "Use at least 3 characters.";
  if (prefix.length > 30) return "Use 30 characters or fewer.";
  return null;
}
