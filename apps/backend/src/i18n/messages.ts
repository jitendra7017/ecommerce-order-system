export const messages = {
  en: {
    COMMON: {
      INTERNAL_SERVER_ERROR: "Internal server error",
      INVALID_PAYLOAD: "Invalid payload",
      NOT_FOUND: "Not found",
    },
    AUTH: {
      UNAUTHORIZED: "Unauthorized",
      INVALID_TOKEN: "Invalid token",
      FORBIDDEN: "Forbidden",
      INVALID_CREDENTIALS: "Invalid credentials",
      EMAIL_ALREADY_REGISTERED: "Email already registered",
      USER_REGISTERED: "User registered",
      LOGIN_SUCCESS: "Login successful",
    },
    CATEGORY: {
      CREATED: "Category created",
      FETCHED: "Categories fetched",
    },
    PRODUCT: {
      CREATED: "Product created",
      UPDATED: "Product updated",
      DELETED: "Product deleted",
      FETCHED: "Products fetched",
    },
    CART: {
      ITEM_ADDED: "Item added to cart",
      ITEM_UPDATED: "Cart item updated",
      ITEM_REMOVED: "Cart item removed",
      FETCHED: "Cart fetched",
    },
    ORDER: {
      PLACED: "Order placed",
      FETCHED: "Orders fetched",
      CANCELLED: "Order cancelled",
      CART_EMPTY: "Cart is empty",
      INSUFFICIENT_STOCK: "Insufficient stock",
      NOT_FOUND: "Order not found",
      ALREADY_CANCELLED: "Order already cancelled",
      CANCEL_FAILED: "Failed to cancel order",
    },
  },
  hi: {
    COMMON: {
      INTERNAL_SERVER_ERROR: "Internal server error",
      INVALID_PAYLOAD: "Invalid payload",
      NOT_FOUND: "Not found",
    },
    AUTH: {
      UNAUTHORIZED: "Unauthorized",
      INVALID_TOKEN: "Invalid token",
      FORBIDDEN: "Forbidden",
      INVALID_CREDENTIALS: "Invalid credentials",
      EMAIL_ALREADY_REGISTERED: "Email already registered",
      USER_REGISTERED: "User registered",
      LOGIN_SUCCESS: "Login successful",
    },
    CATEGORY: {
      CREATED: "Category created",
      FETCHED: "Categories fetched",
    },
    PRODUCT: {
      CREATED: "Product created",
      UPDATED: "Product updated",
      DELETED: "Product deleted",
      FETCHED: "Products fetched",
    },
    CART: {
      ITEM_ADDED: "Item added to cart",
      ITEM_UPDATED: "Cart item updated",
      ITEM_REMOVED: "Cart item removed",
      FETCHED: "Cart fetched",
    },
    ORDER: {
      PLACED: "Order placed",
      FETCHED: "Orders fetched",
      CANCELLED: "Order cancelled",
      CART_EMPTY: "Cart is empty",
      INSUFFICIENT_STOCK: "Insufficient stock",
      NOT_FOUND: "Order not found",
      ALREADY_CANCELLED: "Order already cancelled",
      CANCEL_FAILED: "Failed to cancel order",
    },
  },
} as const;

export type SupportedLanguage = keyof typeof messages;
export const defaultLanguage: SupportedLanguage = "en";
