export interface RedisCartItem {
  productId: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface RedisCart {
  items: RedisCartItem[];
  subtotal: number;
  total: number;
}