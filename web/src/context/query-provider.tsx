import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KickClientError } from "@forinda/kickjs-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry network blips and 5xx, but not 4xx: a 401/403/404 won't change on retry,
      // and retrying a 401 just delays the sign-out the API client already triggered.
      retry: (failureCount, error) =>
        !(error instanceof KickClientError && error.status >= 400 && error.status < 500) && failureCount < 3,
    },
  },
});

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
