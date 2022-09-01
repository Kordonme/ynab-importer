import {
  AppShell,
  Button,
  Center,
  Footer,
  Group,
  Header,
  MantineProvider,
  NativeSelect,
  Navbar,
  PasswordInput,
  Textarea,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { Transactions } from "./components/transactions";
import { useRawInput } from "./hooks/useRawInput";
import { useYnab } from "./hooks/useYnab";
import { Account } from "./ynab/models/account";
import { Budget } from "./ynab/models/budget";
import { showNotification } from "@mantine/notifications";

function App() {
  const preferredColorScheme = useColorScheme();
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveTransactions = useCallback(async () => {
    try {
      if (!selectedAccount || !selectedBudget) {
        throw new Error("Please select an account and a budget");
      }

      setIsSaving(true);
      await saveTransactions(
        selectedBudget.id,
        selectedAccount.id,
        transactions
      );
      showNotification({
        title: "Success",
        message: "Transactions imported successfully 👍",
        color: "green",
      });
      setRawInput("");
    } catch (e: any) {
      showNotification({
        title: "Error",
        message: e.message,
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  }, [saveTransactions, selectedAccount, selectedBudget, transactions]);

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: preferredColorScheme,
      }}
    >
      <NotificationsProvider position="top-center">
        <AppShell
          padding="md"
          header={
            <Header height={60}>
              <Group sx={{ height: "100%" }} px={20}>
                YNAB Importer
              </Group>
            </Header>
          }
          navbar={
            <Navbar width={{ base: 300 }}>
              <Navbar.Section m="md">
                <PasswordInput
                  label="YNAB PAT"
                  placeholder="Token"
                  onChange={(e) => setYnabToken(e.target.value)}
                />
              </Navbar.Section>
              <Navbar.Section m="md">
                <NativeSelect
                  data={budgets.map((x) => ({ value: x.id, label: x.name }))}
                  label="Budget"
                  value={selectedBudget?.id}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                />

                <NativeSelect
                  mt="xs"
                  label="Account"
                  data={accounts.map((x) => ({
                    value: x.id,
                    label: `${x.name} (${(
                      x.cleared_balance / 1000
                    ).toLocaleString("da-DK", {
                      minimumFractionDigits: 2,
                    })})`,
                  }))}
                  value={selectedAccount?.id}
                  onChange={(e) => handleAccountChange(e.target.value)}
                />
              </Navbar.Section>
              <Navbar.Section m="md">
                <Textarea
                  rows={6}
                  label="Input from Nordea"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                />
              </Navbar.Section>
            </Navbar>
          }
          footer={
            <Footer height={80}>
              <Center style={{ height: "100%" }}>
                <Button
                  size="lg"
                  onClick={handleSaveTransactions}
                  disabled={!selectedAccount || !transactions.length}
                  loading={isSaving}
                >
                  Looks good. Import now!
                </Button>
              </Center>
            </Footer>
          }
        >
          <Transactions transactions={transactions} account={selectedAccount} />
        </AppShell>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
