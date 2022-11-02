export interface Transaction {
  memo: string;
  payee_id: string;
  payee_name: string;
  category_id: string;
  category_name: string;
  deleted: boolean;
}
