import { useCallback, useEffect, useState } from "react";
import { api, setToken } from "../ynab/api";
import { Account } from "../ynab/models/account";
import { Budget } from "../ynab/models/budget";
import { Category } from "../ynab/models/category";
import { Payee } from "../ynab/models/payee";
import { TableItem } from "../ynab/models/table-item";
import { Transaction } from "../ynab/models/transaction";

export const useYnab = (token: string, selectedBudget: Budget | undefined) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  const getTransactions = useCallback(async (budgetId: string) => {
    const request = await api.getTransactions(budgetId);
    setTransactions(request.data.transactions.filter((x) => !x.deleted));
  }, []);

  const getCategories = useCallback(async (budgetId: string) => {
    const request = await api.getCategories(budgetId);
    setCategories(
      request.data.category_groups
        .filter((x) => !x.deleted)
        .map((x) => x.categories)
        .flat()
    );
  }, []);

  const saveTransactions = useCallback(
    async (budgetId: string, accountId: string, transactions: TableItem[]) => {
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
          category_name: transaction.category,
          payee_name: transaction.payee,
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
    getTransactions(selectedBudget.id);
    getCategories(selectedBudget.id);
  }, [getAccounts, getCategories, getPayees, getTransactions, selectedBudget]);

  return {
    budgets,
    accounts,
    payees,
    transactions,
    categories,
    saveTransactions,
  };
};
