export type DocumentCategory =
  | "insurance"
  | "epc"
  | "gas_safety"
  | "utility"
  | "mortgage"
  | "lease"
  | "conveyancing"
  | "other";

export type ReminderType =
  | "insurance_renewal"
  | "epc_expiry"
  | "gas_safety"
  | "utility_renewal"
  | "mortgage_review"
  | "maintenance"
  | "generic";

export interface DocumentAnalysis {
  category: DocumentCategory;
  detectedLabel: string;
  expiryDate: Date | null;
  reminders: Array<{
    type: ReminderType;
    title: string;
    description: string;
    dueDate: Date;
  }>;
}

const CATEGORY_PATTERNS: Array<{
  category: DocumentCategory;
  label: string;
  patterns: RegExp[];
  defaultValidityYears?: number;
  defaultValidityMonths?: number;
  reminderType: ReminderType;
  reminderTitle: string;
  leadDays: number[];
}> = [
  {
    category: "insurance",
    label: "Buildings / contents insurance",
    patterns: [/insurance/i, /policy/i, /buildings.?cover/i, /contents.?cover/i],
    defaultValidityYears: 1,
    reminderType: "insurance_renewal",
    reminderTitle: "Insurance renewal due",
    leadDays: [30, 7],
  },
  {
    category: "epc",
    label: "Energy Performance Certificate",
    patterns: [/epc/i, /energy.?performance/i, /efficiency.?cert/i],
    defaultValidityYears: 10,
    reminderType: "epc_expiry",
    reminderTitle: "EPC certificate expires",
    leadDays: [60, 30],
  },
  {
    category: "gas_safety",
    label: "Gas safety certificate (CP12)",
    patterns: [/gas.?safe/i, /cp12/i, /landlord.?gas/i, /boiler.?cert/i],
    defaultValidityMonths: 12,
    reminderType: "gas_safety",
    reminderTitle: "Gas safety check due",
    leadDays: [30, 7],
  },
  {
    category: "utility",
    label: "Utility contract",
    patterns: [/electric/i, /energy.?bill/i, /gas.?bill/i, /broadband/i, /utility/i, /tariff/i],
    defaultValidityMonths: 12,
    reminderType: "utility_renewal",
    reminderTitle: "Utility contract renewal",
    leadDays: [14, 3],
  },
  {
    category: "mortgage",
    label: "Mortgage agreement",
    patterns: [/mortgage/i, /loan.?agreement/i, /offer.?letter/i],
    defaultValidityMonths: 12,
    reminderType: "mortgage_review",
    reminderTitle: "Mortgage rate review",
    leadDays: [60, 30],
  },
  {
    category: "lease",
    label: "Lease / tenancy",
    patterns: [/lease/i, /tenancy/i, /rental.?agreement/i],
    defaultValidityYears: 1,
    reminderType: "generic",
    reminderTitle: "Lease renewal review",
    leadDays: [60, 30],
  },
  {
    category: "conveyancing",
    label: "Conveyancing / deeds",
    patterns: [/deed/i, /conveyanc/i, /title.?plan/i, /land.?registry/i, /tr1/i],
    reminderType: "maintenance",
    reminderTitle: "Review property deeds",
    leadDays: [365],
  },
];

const DATE_PATTERNS = [
  /(\d{4})-(\d{2})-(\d{2})/,
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
  /expir(?:y|es|ation)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  /renew(?:al)?[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function parseDateFromText(text: string): Date | null {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    if (match[0].includes("-") && match[1]?.length === 4) {
      const d = new Date(match[0]);
      if (!isNaN(d.getTime())) return d;
    }

    if (match[2] && isNaN(Number(match[2]))) {
      const d = new Date(match[0]);
      if (!isNaN(d.getTime())) return d;
    }

    const parts = match[0].split(/[\/\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      const d = a > 31 ? new Date(a, b - 1, c) : new Date(c, b - 1, a);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function inferExpiryFromUpload(
  rule: (typeof CATEGORY_PATTERNS)[0],
  uploadedAt: Date
): Date {
  if (rule.defaultValidityYears) {
    return addYears(uploadedAt, rule.defaultValidityYears);
  }
  if (rule.defaultValidityMonths) {
    return addMonths(uploadedAt, rule.defaultValidityMonths);
  }
  return addYears(uploadedAt, 1);
}

export function analyzeDocument(input: {
  filename: string;
  category?: DocumentCategory;
  expiryDate?: Date | null;
  notes?: string;
  uploadedAt?: Date;
}): DocumentAnalysis {
  const uploadedAt = input.uploadedAt ?? new Date();
  const searchText = `${input.filename} ${input.notes ?? ""}`;

  let matched = CATEGORY_PATTERNS.find((r) =>
    r.patterns.some((p) => p.test(searchText))
  );

  if (input.category && input.category !== "other") {
    matched =
      CATEGORY_PATTERNS.find((r) => r.category === input.category) ?? matched;
  }

  const category = input.category ?? matched?.category ?? "other";
  const detectedLabel = matched?.label ?? "General document";

  let expiryDate =
    input.expiryDate ??
    parseDateFromText(searchText) ??
    (matched ? inferExpiryFromUpload(matched, uploadedAt) : null);

  const reminders: DocumentAnalysis["reminders"] = [];

  if (expiryDate && matched) {
    for (const leadDays of matched.leadDays) {
      const dueDate = subtractDays(expiryDate, leadDays);
      if (dueDate > new Date()) {
        reminders.push({
          type: matched.reminderType,
          title: `${matched.reminderTitle} (${leadDays} days notice)`,
          description: `${detectedLabel} — "${input.filename}" expires ${expiryDate.toLocaleDateString("en-GB")}.`,
          dueDate,
        });
      }
    }
    reminders.push({
      type: matched.reminderType,
      title: matched.reminderTitle,
      description: `${detectedLabel} — "${input.filename}" expires today.`,
      dueDate: expiryDate,
    });
  } else if (expiryDate) {
    for (const lead of [30, 7]) {
      const dueDate = subtractDays(expiryDate, lead);
      if (dueDate > new Date()) {
        reminders.push({
          type: "generic",
          title: `Document reminder (${lead} days)`,
          description: `"${input.filename}" — action needed by ${expiryDate.toLocaleDateString("en-GB")}.`,
          dueDate,
        });
      }
    }
  } else if (matched) {
    const inferredExpiry = inferExpiryFromUpload(matched, uploadedAt);
    expiryDate = inferredExpiry;
    for (const leadDays of matched.leadDays) {
      reminders.push({
        type: matched.reminderType,
        title: `${matched.reminderTitle} (${leadDays} days notice)`,
        description: `${detectedLabel} — review "${input.filename}". Estimated expiry ${inferredExpiry.toLocaleDateString("en-GB")}.`,
        dueDate: subtractDays(inferredExpiry, leadDays),
      });
    }
  }

  return {
    category,
    detectedLabel,
    expiryDate,
    reminders: reminders.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    ),
  };
}
