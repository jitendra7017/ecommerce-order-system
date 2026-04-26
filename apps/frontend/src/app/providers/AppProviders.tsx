import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type PropsWithChildren } from "react";
import { ToastProvider } from "@/shared/ui/toast/ToastProvider";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </ToastProvider>
    </QueryClientProvider>
  );
}

