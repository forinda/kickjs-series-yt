import { createBrowserRouter } from "react-router";
import Home from "./pages/home";
import Auth from "./pages/auth";
import DashboardLayout from "./components/layouts/dashboard-layout";
import DashboardIndex from "./pages/dashboard-index";
import DashboardArticles from "./pages/dashboard-articles";
import BaseLayout from "./components/layouts/base-layout";
import SingleBlogPage from "./pages/single-blog-page";
import AccountProfile from "./pages/account-profile";
import DashboardPostEditor from "./pages/dashboard-post-editor";
import DashboardCategories from "./pages/dashboard-categories";
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
            path: "/dashboard/articles",
            element: <DashboardArticles />,
          },
          {
            path: "/dashboard/articles/new",
            element: <DashboardPostEditor />,
          },
          {
            path: "/dashboard/articles/:id/edit",
            element: <DashboardPostEditor key="edit" />,
          },
          {
            path: "/dashboard/categories",
            element: <DashboardCategories />,
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
