import { Autocomplete, Table } from "@mantine/core";
import { useCallback, useEffect, useMemo } from "react";
import { Transaction as RawInputTransaction } from "../hooks/useRawInput";
import { Account } from "../ynab/models/account";
import { Category } from "../ynab/models/category";
import { Payee } from "../ynab/models/payee";
import { TableItem } from "../ynab/models/table-item";
import { Transaction } from "../ynab/models/transaction";

type TransactionsProps = {
  rawInputTransactions: RawInputTransaction[];
  account: Account | undefined;
  payees: Payee[];
  categories: Category[];
  ynabTransactions: Transaction[];
  onChange: (items: TableItem[]) => void;
};

export const Transactions = (props: TransactionsProps) => {
  const {
    rawInputTransactions,
    account,
    ynabTransactions,
    categories,
    payees,
    onChange,
  } = props;

  const slugify = (text: string) => {
    return text;
    return ((text ?? "").replace(/[^a-zA-Z]+/g, "") ?? "").toLocaleLowerCase();
  };

  const balance = useMemo(() => {
    if (!account) {
      return undefined;
    }

    return account.cleared_balance / 1000;
  }, [account]);

  const tableItems = useMemo<TableItem[]>(() => {
    const map = new Map<string, { payee: string; category: string }>();

    for (const ynabTransaction of ynabTransactions) {
      map.set(slugify(ynabTransaction.memo), {
        payee: ynabTransaction.payee_name,
        category: ynabTransaction.category_name,
      });
    }

    map.forEach((mapItem, key) => {
      if (
        [
          "Transfer",
          "Starting Balance",
          "Manual Balance Adjustment",
          "Reconciliation Balance Adjustment",
        ].find((x) => (mapItem.payee ?? "")?.startsWith(x))
      ) {
        map.delete(slugify(key));
      }
    });

    const t = rawInputTransactions.map((x) => ({
      ...x,
      ...map.get(slugify(x.description)),
    }));

    return t;
  }, [rawInputTransactions, ynabTransactions]);

  const reversedTransactions = useMemo(() => {
    return [...tableItems].reverse();
  }, [tableItems]);

  const runningBalance = useCallback(
    (currentTransaction: TableItem) => {
      if (!account) {
        return 0;
      }

      let total = account.cleared_balance / 1000;

      for (const transaction of reversedTransactions) {
        total += transaction.amount;

        if (transaction === currentTransaction) {
          break;
        }
      }

      return total;
    },
    [reversedTransactions, account]
  );

  useEffect(() => {
    onChange(tableItems);
  }, [onChange, tableItems]);

  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Payee</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {tableItems.map((transaction, index) => (
          <tr key={`${index}`}>
            <td>{transaction.date.toDateString()}</td>
            <td>{transaction.payee}</td>
            <td>{transaction.description}</td>
            <td
              className={transaction.amount >= 0 ? "text-green-700" : undefined}
            >
              {transaction.amount.toLocaleString("da-DK", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="px-6 py-4 text-right">
              {runningBalance(transaction).toLocaleString("da-DK", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={4}></td>
          <td className="px-6 py-4 text-right">
            {balance?.toLocaleString("da-DK", {
              minimumFractionDigits: 2,
            })}
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
