export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceInr: 1999,
    flashIncluded: 'unlimited',
    proIncludedTokens: 3_000_000,
    description: 'Unlimited V4 Flash + 3M V4 Pro tokens / month',
    durationDays: 30,
  },
} as const;

export const TOPUPS = {
  small:  { id: 'small',  name: '1M Pro tokens',   priceInr: 500,  proTokens: 1_000_000  },
  medium: { id: 'medium', name: '2.5M Pro tokens', priceInr: 1000, proTokens: 2_500_000 },
  large:  { id: 'large',  name: '15M Pro tokens',  priceInr: 5000, proTokens: 15_000_000 },
} as const;

export type TopupId = keyof typeof TOPUPS;
