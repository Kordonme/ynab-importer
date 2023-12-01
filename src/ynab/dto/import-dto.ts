type ClearedType = "cleared" | "uncleared" | "reconciled";

interface ImportTransaction {
  account_id: string;
  date: string;
  amount: number;
  memo: string;
  approved: boolean;
  payee_name: string | undefined;
  // category_name: string | undefined;
  cleared: ClearedType;
}

export interface ImportDto {
  transactions: ImportTransaction[];
}
