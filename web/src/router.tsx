import { createBrowserRouter } from "react-router";
import Home from "./pages/home";
import Auth from "./pages/auth";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/auth",
    element: <Auth />
  }
]);