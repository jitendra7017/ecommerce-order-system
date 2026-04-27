export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  status: "pending" | "placed" | "confirmed" | "cancelled";
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}
