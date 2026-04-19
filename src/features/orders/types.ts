export interface OrderItemSummary {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
}

export interface OrderSummary {
  id: number;
  sessionId: string;
  userId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
  items: OrderItemSummary[];
}

export interface AdminOrderSummary extends OrderSummary {
  profileName: string | null;
  profileEmail: string | null;
}

