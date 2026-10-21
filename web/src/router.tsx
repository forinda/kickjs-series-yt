import { createBrowserRouter } from "react-router";
import Home from "./pages/home";
import Auth from "./pages/auth";
import DashboardLayout from "./components/layouts/dashboard-layout";
import DashboardIndex from "./pages/dashboard-index";
import BaseLayout from "./components/layouts/base-layout";
import SingleBlogPage from "./pages/single-blog-page";
import AccountProfile from "./pages/account-profile";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/blogs/:id",
        element: <SingleBlogPage />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },

      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardIndex />,
          },
          {
            path:'/dashboard/profile',
            element: <AccountProfile />
          }
        ],
      },
    ],
  },
]);
