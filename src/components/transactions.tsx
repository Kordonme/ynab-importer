import { Table } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { Transaction } from "../hooks/useRawInput";
import { Account } from "../ynab/models/account";

type TransactionsProps = {
  transactions: Transaction[];
  account: Account | undefined;
};

export const Transactions = (props: TransactionsProps) => {
  const { transactions, account } = props;

  const reversedTransactions = useMemo(() => {
    return [...transactions].reverse();
  }, [transactions]);

  const runningBalance = useCallback(
    (currentTransaction: Transaction) => {
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

  const balance = useMemo(() => {
    if (!account) {
      return undefined;
    }

    return account.cleared_balance / 1000;
  }, [account]);

  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction, index) => (
          <tr key={`${index}`}>
            <td>{transaction.date.toDateString()}</td>
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
          <td colSpan={3}></td>
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
