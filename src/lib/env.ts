export function isClerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}

export function isStripeEnabled(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PREMIUM_PRICE_ID
  );
}

export function isEpcEnabled(): boolean {
  return Boolean(process.env.EPC_API_EMAIL && process.env.EPC_API_KEY);
}

export function isOpenAiModerationEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
