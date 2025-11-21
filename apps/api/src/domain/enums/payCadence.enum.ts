export const PayCadence = {
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
} as const;

export type PayCadence = (typeof PayCadence)[keyof typeof PayCadence];
