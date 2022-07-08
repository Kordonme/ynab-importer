import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { TextInput } from "./components/input/TextInput/TextInput";
import { TextInputLabel } from "./components/input/TextInputLabel/TextInputLabel";
import { Transaction, useRawInput } from "./hooks/useRawInput";
import { useYnab } from "./hooks/useYnab";
import { Account } from "./ynab/models/account";
import { Budget } from "./ynab/models/budget";

function App() {
  const [ynabToken, setYnabToken] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<Budget>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const { budgets, accounts, saveTransactions } = useYnab(
    ynabToken,
    selectedBudget
  );
  const [rawInput, setRawInput] = useState("");
  const transactions = useRawInput(rawInput);

  useEffect(() => {
    setSelectedBudget(budgets?.[0]);
  }, [budgets]);

  useEffect(() => {
    setSelectedAccount(accounts?.[0]);
  }, [accounts]);

  const handleBudgetChange = (id: string | undefined) => {
    setSelectedBudget(budgets?.find((x) => x.id === id));
  };

  const handleAccountChange = (id: string | undefined) => {
    setSelectedAccount(accounts?.find((x) => x.id === id));
  };

  const reversedTransactions = useMemo(() => {
    return [...transactions].reverse();
  }, [transactions]);

  const runningBalance = useCallback(
    (currentTransaction: Transaction) => {
      if (!selectedAccount) {
        return 0;
      }

      let total = selectedAccount.cleared_balance / 1000;

      for (const transaction of reversedTransactions) {
        total += transaction.amount;

        if (transaction === currentTransaction) {
          break;
        }
      }

      return total;
    },
    [reversedTransactions, selectedAccount]
  );

  const handleSaveTransactions = useCallback(() => {
    if (!selectedAccount || !selectedBudget) {
      return;
    }

    saveTransactions(selectedBudget.id, selectedAccount.id, transactions);
  }, [saveTransactions, selectedAccount, selectedBudget, transactions]);

  const balance = useMemo(() => {
    if (!selectedAccount) {
      return undefined;
    }

    return selectedAccount.cleared_balance / 1000;
  }, [selectedAccount]);

  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div>
        <div className="space-y-2">
          <div>
            <TextInputLabel htmlFor="ynab-pat">YNAB PAT</TextInputLabel>
            <TextInput
              id="ynab-pat"
              placeholder="Token"
              onChange={(e) => setYnabToken(e.target.value)}
            />
          </div>
          <div>
            <TextInputLabel htmlFor="budget">Budget</TextInputLabel>
            <select
              id="budget"
              value={selectedBudget?.id}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {budgets?.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="account"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Account
            </label>
            <select
              id="account"
              value={selectedAccount?.id}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => handleSaveTransactions()}
          disabled={!selectedAccount || !transactions.length}
          className="w-full mt-10 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Looks good. Let's go!
        </button>
      </div>
      <div>
        <div>
          <label
            htmlFor="raw"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Raw Input
          </label>
          <textarea
            id="raw"
            rows={6}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-8">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={`${index}`}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4">{transaction.date.toDateString()}</td>
                <td className="px-6 py-4">{transaction.description}</td>
                <td
                  className={`px-6 py-4 text-right ${
                    transaction.amount >= 0 ? "text-green-700" : ""
                  }`}
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
        </table>
      </div>
    </div>
  );
}

export default App;
