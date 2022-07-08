import { useMemo } from "react";

export interface Transaction {
  description: string;
  amount: number;
  date: Date;
}

export const useRawInput = (rawInput: string) => {
  const transactions = useMemo(() => {
    const newLocal =
      "(((\\d{2})\\.(\\d{2})\\.(\\d{4}))\\s+([^\\t]+)\\t([^\\t]+)\\s+.*\\s)";
    const regex = new RegExp(newLocal, "gm");

    let match = regex.exec(rawInput);
    const rawTransations: Transaction[] = [];

    do {
      if (!match) {
        continue;
      }

      const day = match[3];
      const month = match[4];
      const year = match[5];

      const date = new Date(`${year}-${month}-${day}`);
      const description = match[6];
      const amount = Number(match[7].replace(".", "").replace(",", "."));

      rawTransations.push({
        amount,
        description,
        date,
      });
    } while ((match = regex.exec(rawInput)) !== null);

    return rawTransations;
  }, [rawInput]);

  return transactions;
};
