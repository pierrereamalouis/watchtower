export const AccountVisibility = {
  HOUSEHOLD: "household",
  PERSONAL: "personal",
} as const;

export type AccountVisibility = (typeof AccountVisibility)[keyof typeof AccountVisibility];
