import { useCallback, useEffect, useState } from "react";
import { api, setToken } from "../ynab/api";
import { Account } from "../ynab/models/account";
import { Budget } from "../ynab/models/budget";
import { Payee } from "../ynab/models/payee";
import { Transaction } from "./useRawInput";

export const useYnab = (token: string, selectedBudget: Budget | undefined) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [peyees, setPayees] = useState<Payee[]>([]);

  const getAccounts = useCallback(async (budgetId: string) => {
    const request = await api.getAccounts(budgetId);
    setAccounts(request.data.accounts.filter((x) => !x.deleted && !x.closed));
  }, []);

  const getBudgets = useCallback(async () => {
    const request = await api.getBudgets();
    setBudgets(request.data.budgets);
  }, []);

  const getPayees = useCallback(async (budgetId: string) => {
    const request = await api.getPayees(budgetId);
    setPayees(request.data.payees.filter((x) => !x.deleted));
  }, []);

  const saveTransactions = useCallback(
    async (
      budgetId: string,
      accountId: string,
      transactions: Transaction[]
    ) => {
      if (!transactions.length) {
        throw new Error("No transactions to import");
      }

      await api.importTransactions(budgetId, {
        transactions: transactions.map((transaction) => ({
          amount: Math.round(transaction.amount * 1000),
          account_id: accountId,
          approved: true,
          cleared: "cleared",
          date: transaction.date.toISOString(),
          memo: transaction.description,
        })),
      });
    },
    []
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    setToken(token);
    getBudgets();
  }, [getBudgets, getPayees, token]);

  useEffect(() => {
    if (!selectedBudget) {
      return;
    }

    getAccounts(selectedBudget.id);
    getPayees(selectedBudget.id);
  }, [getAccounts, getPayees, selectedBudget]);

  return { budgets, accounts, peyees, saveTransactions };
};
