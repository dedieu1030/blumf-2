export interface SignatureData {
  points: Array<{x: number, y: number}>;
  width: number;
  height: number;
}

export interface Invoice {
  id: string;
  number: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  client?: string;
  amount: string;
  date: string;
  dueDate?: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  paymentUrl?: string;
  total_amount?: number;
}
