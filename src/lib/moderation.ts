export interface ModerationResult {
  approved: boolean;
  reason?: string;
  flags: string[];
}

const SPAM_PATTERNS = [
  /\b(buy now|click here|limited offer|crypto|bitcoin|nft)\b/i,
  /(https?:\/\/[^\s]+){3,}/i,
  /(.)\1{8,}/,
];

const VEXATIOUS_PATTERNS = [
  /\b(idiot|stupid|moron|kill yourself|kys)\b/i,
  /\b(scam|fraud|liar)\b.*\b(everyone|all of you|neighbours)\b/i,
];

const LOW_EFFORT_PATTERNS = [
  /^(\.+|lol|lmao|ok|yes|no|\+1|this)$/i,
  /^.{1,5}$/,
];

export function moderateContent(
  title: string,
  body: string
): ModerationResult {
  const text = `${title} ${body}`.trim();
  const flags: string[] = [];

  if (text.length < 15) {
    return {
      approved: false,
      reason:
        "Posts must be at least 15 characters and add constructive value.",
      flags: ["too_short"],
    };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) flags.push("spam");
  }
  for (const pattern of VEXATIOUS_PATTERNS) {
    if (pattern.test(text)) flags.push("vexatious");
  }
  for (const pattern of LOW_EFFORT_PATTERNS) {
    if (pattern.test(body.trim()) || pattern.test(title.trim())) {
      flags.push("low_effort");
    }
  }

  if (title === body && text.length < 40) {
    flags.push("duplicate_content");
  }

  if (flags.includes("vexatious")) {
    return {
      approved: false,
      reason:
        "This post was flagged as vexatious or abusive. You cannot post until you review our community guidelines.",
      flags,
    };
  }

  if (flags.includes("spam")) {
    return {
      approved: false,
      reason: "This post looks like spam or promotional content.",
      flags,
    };
  }

  if (flags.includes("low_effort") || flags.includes("duplicate_content")) {
    return {
      approved: false,
      reason:
        "Please write a purposeful, constructive post. Low-effort comments are not permitted.",
      flags,
    };
  }

  return { approved: true, flags: [] };
}

export async function moderateWithAi(
  title: string,
  body: string
): Promise<ModerationResult> {
  const ruleResult = moderateContent(title, body);
  if (!ruleResult.approved) return ruleResult;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return ruleResult;

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: `${title}\n\n${body}` }),
    });

    if (!response.ok) return ruleResult;

    const data = (await response.json()) as {
      results?: Array<{ flagged: boolean; categories?: Record<string, boolean> }>;
    };

    const result = data.results?.[0];
    if (result?.flagged) {
      const categories = Object.entries(result.categories ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k);
      return {
        approved: false,
        reason:
          "This post was flagged by our moderation system. Please revise and try again.",
        flags: ["ai_flagged", ...categories],
      };
    }
  } catch {
    return ruleResult;
  }

  return ruleResult;
}

export function verifyPostcodeMatch(
  userPostcode: string,
  claimedPostcode: string
): boolean {
  const normalise = (pc: string) =>
    pc.replace(/\s+/g, "").toUpperCase();
  const user = normalise(userPostcode);
  const claimed = normalise(claimedPostcode);

  if (user === claimed) return true;

  const userSector = user.slice(0, -3);
  const claimedSector = claimed.slice(0, -3);
  return userSector === claimedSector;
}
