export const departments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Operations",
  "Product",
  "Sales",
  "Support"
];

export const countries = ["US", "IN", "GB", "DE", "CA", "AU", "SG"];

export const roles = [
  "Engineer",
  "Analyst",
  "HR Partner",
  "Operations Lead",
  "Product Manager",
  "Account Executive",
  "Support Specialist"
];

export const levels = ["Junior", "Mid", "Senior", "Lead", "Principal"];

const countryLabels: Record<string, string> = {
  AU: "Australia",
  CA: "Canada",
  DE: "Germany",
  GB: "United Kingdom",
  IN: "India",
  SG: "Singapore",
  US: "United States"
};

export function formatCountry(country: string | null) {
  if (!country) {
    return "-";
  }

  return countryLabels[country] ?? country;
}
