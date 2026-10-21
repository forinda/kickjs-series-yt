import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import QueryProvider from "./context/query-provider";
import { AuthProvider } from "./context/auth-context";
import { Toaster } from "./components/ui/sooner";
import { TooltipProvider } from "./components/ui/tooltip";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
        <Toaster closeButton />
      </QueryProvider>
    </AuthProvider>
  </StrictMode>,
);
