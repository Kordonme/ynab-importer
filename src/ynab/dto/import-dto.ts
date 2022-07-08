type ClearedType = "cleared" | "uncleared" | "reconciled";

interface ImportTransaction {
  account_id: string;
  date: string;
  amount: number;
  memo: string;
  approved: boolean;
  cleared: ClearedType;
}

export interface ImportDto {
  transactions: ImportTransaction[];
}
