import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router";
import QueryProvider from "./context/query-provider";
import { AuthProvider } from "./context/auth-context";
import { Toaster } from "./components/ui/sooner";
import BaseLayout from "./components/layouts/base-layout";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryProvider>
        <BaseLayout>
        <RouterProvider router={router} />
        </BaseLayout>
        <Toaster/>
      </QueryProvider>
    </AuthProvider>
  </StrictMode>,
);
