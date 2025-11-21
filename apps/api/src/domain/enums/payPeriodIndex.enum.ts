export const PayPeriodIndex = {
  ONE: "1",
  TWO: "2",
} as const;

export type PayPeriodIndex = (typeof PayPeriodIndex)[keyof typeof PayPeriodIndex];
