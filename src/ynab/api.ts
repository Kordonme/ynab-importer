import axios, { AxiosResponse } from "axios";
import { AccountsDto } from "./dto/accounts-dto";
import { BudgetsDto } from "./dto/budgets-dto";
import { CategoriesDto } from "./dto/categories-dto";
import { ImportDto } from "./dto/import-dto";
import { PayeesDto } from "./dto/payees-dto";
import { TransactionsDto } from "./dto/transactions-dto";
import { YnabResponse } from "./ynabResponse";

let ynabToken = "";

const axiosInstance = axios.create({
  baseURL: "https://api.youneedabudget.com/v1",
});

axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  config.headers.Authorization = `Bearer ${ynabToken}`;

  return config;
});

const requests = {
  get: <T>(url: string) => axiosInstance.get<YnabResponse<T>>(url),
  post: <T>(url: string, data: any) =>
    axiosInstance.post<YnabResponse<T>>(url, data),
};

const unwrapAxiosResponse = async <T>(
  response: Promise<AxiosResponse<YnabResponse<T>>>
) => {
  return (await response).data;
};

export const setToken = (token: string) => {
  ynabToken = token;
};

const getBudgets = () =>
  unwrapAxiosResponse<BudgetsDto>(requests.get<BudgetsDto>("/budgets"));

const getAccounts = (budgetId: string) =>
  unwrapAxiosResponse<AccountsDto>(
    requests.get<AccountsDto>(`/budgets/${budgetId}/accounts`)
  );

const getPayees = (budgetId: string) =>
  unwrapAxiosResponse<PayeesDto>(
    requests.get<PayeesDto>(`/budgets/${budgetId}/payees`)
  );

const getTransactions = (budgetId: string) =>
  unwrapAxiosResponse<TransactionsDto>(
    requests.get<TransactionsDto>(
      `/budgets/${budgetId}/transactions?since_date=2022-01-01`
    )
  );

const getCategories = (budgetId: string) =>
  unwrapAxiosResponse<CategoriesDto>(
    requests.get<CategoriesDto>(`/budgets/${budgetId}/categories`)
  );

const importTransactions = async (budgetId: string, importDto: ImportDto) => {
  requests.post(`/budgets/${budgetId}/transactions`, importDto);
};

export const api = {
  getBudgets,
  getAccounts,
  getPayees,
  getTransactions,
  getCategories,
  importTransactions,
};
