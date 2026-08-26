// UK SIC 2007 → industry mapping (sections A–U, keyed by 2-digit division code)
// Reference: https://www.ons.gov.uk/methodology/classificationsandstandards/ukstandardindustrialclassificationofsic
export const SIC_TO_INDUSTRY: Record<string, string> = {
  // Section A — Agriculture, forestry and fishing
  "01": "Agriculture",
  "02": "Agriculture",
  "03": "Agriculture",
  // Section B — Mining and quarrying
  "05": "Mining & Quarrying",
  "06": "Mining & Quarrying",
  "07": "Mining & Quarrying",
  "08": "Mining & Quarrying",
  "09": "Mining & Quarrying",
  // Section C — Manufacturing (divisions 10–33)
  "10": "Manufacturing", "11": "Manufacturing", "12": "Manufacturing", "13": "Manufacturing",
  "14": "Manufacturing", "15": "Manufacturing", "16": "Manufacturing", "17": "Manufacturing",
  "18": "Manufacturing", "19": "Manufacturing", "20": "Manufacturing", "21": "Manufacturing",
  "22": "Manufacturing", "23": "Manufacturing", "24": "Manufacturing", "25": "Manufacturing",
  "26": "Manufacturing", "27": "Manufacturing", "28": "Manufacturing", "29": "Manufacturing",
  "30": "Manufacturing", "31": "Manufacturing", "32": "Manufacturing", "33": "Manufacturing",
  // Section D — Electricity, gas, steam and air conditioning supply
  "35": "Energy & Utilities",
  // Section E — Water supply; sewerage, waste management and remediation
  "36": "Utilities & Waste",
  "37": "Utilities & Waste",
  "38": "Utilities & Waste",
  "39": "Utilities & Waste",
  // Section F — Construction
  "41": "Construction",
  "42": "Construction",
  "43": "Construction",
  // Section G — Wholesale and retail trade (incl. motor vehicles)
  "45": "Retail",
  "46": "Retail",
  "47": "Retail",
  // Section H — Transportation and storage
  "49": "Transport & Logistics",
  "50": "Transport & Logistics",
  "51": "Transport & Logistics",
  "52": "Transport & Logistics",
  "53": "Transport & Logistics",
  // Section I — Accommodation and food service activities
  "55": "Hospitality",
  "56": "Hospitality",
  // Section J — Information and communication
  "58": "Media & Creative",
  "59": "Media & Creative",
  "60": "Media & Creative",
  "61": "Telecoms",
  "62": "Technology & IT",
  "63": "Technology & IT",
  // Section K — Financial and insurance activities
  "64": "Financial Services",
  "65": "Financial Services",
  "66": "Financial Services",
  // Section L — Real estate activities
  "68": "Real Estate",
  // Section M — Professional, scientific and technical activities
  "69": "Professional Services",
  "70": "Professional Services",
  "71": "Professional Services",
  "72": "Professional Services",
  "73": "Professional Services",
  "74": "Professional Services",
  "75": "Professional Services",
  // Section N — Administrative and support service activities
  "77": "Business Services",
  "78": "Business Services",
  "79": "Business Services",
  "80": "Business Services",
  "81": "Business Services",
  "82": "Business Services",
  // Section O — Public administration and defence
  "84": "Public Sector",
  // Section P — Education
  "85": "Education",
  // Section Q — Human health and social work activities
  "86": "Healthcare",
  "87": "Healthcare",
  "88": "Healthcare",
  // Section R — Arts, entertainment and recreation
  "90": "Arts & Entertainment",
  "91": "Arts & Entertainment",
  "92": "Arts & Entertainment",
  "93": "Arts & Entertainment",
  // Section S — Other service activities
  "94": "Other Services",
  "95": "Other Services",
  "96": "Other Services",
  // Section T — Activities of households as employers
  "97": "Household Services",
  "98": "Household Services",
  // Section U — Activities of extraterritorial organisations and bodies
  "99": "International Organisations",
};

/**
 * Map a list of SIC codes (2-digit divisions or full 5-digit codes like "62012")
 * to a single industry label. Returns the first mappable code's industry, or "Other".
 */
export function sicToIndustry(sicCodes: string[]): string {
  for (const raw of sicCodes || []) {
    const digits = String(raw ?? "").replace(/\D/g, "");
    if (digits.length < 2) continue;
    const division = digits.slice(0, 2);
    const industry = SIC_TO_INDUSTRY[division];
    if (industry) return industry;
  }
  return "Other";
}
