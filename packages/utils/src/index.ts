export interface TotalLineItem {
  quantity: number;
  unitPrice: number;
}

export const calculateTotal = (items: TotalLineItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createSuccessResponse = <T>(message: string, data: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (message: string): ApiResponse<null> => ({
  success: false,
  message,
  data: null,
});

export const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return parsed > 0 && Math.floor(parsed) === parsed ? parsed : fallback;
};

export const formatDateTime = (
  value: string | Date,
  locale = "en-IN",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  },
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
};
