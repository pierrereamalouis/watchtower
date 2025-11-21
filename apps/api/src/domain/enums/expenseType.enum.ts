export const ExpenseType = {
  ANTICIPATED: "anticipated",
  OCCURRED: "occurred",
};

export type ExpenseType = (typeof ExpenseType)[keyof typeof ExpenseType];
