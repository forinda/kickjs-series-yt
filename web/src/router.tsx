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
import DashboardUsers from "./pages/dashboard-users";
import DashboardWriterRequests from "./pages/dashboard-writer-requests";
import DashboardWriterAccess from "./pages/dashboard-writer-access";
import DashboardManageArticles from "./pages/dashboard-manage-articles";
import DashboardBookmarks from "./pages/dashboard-bookmarks";
import Protect from "./components/auth/protect";
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
            element: (
              <Protect permission="WRITE">
                <DashboardArticles />
              </Protect>
            ),
          },
          {
            path: "/dashboard/articles/new",
            element: (
              <Protect permission="WRITE">
                <DashboardPostEditor />
              </Protect>
            ),
          },
          {
            path: "/dashboard/articles/:id/edit",
            element: (
              <Protect permission="WRITE">
                <DashboardPostEditor key="edit" />
              </Protect>
            ),
          },
          {
            path: "/dashboard/categories",
            element: (
              <Protect permission="ADMIN">
                <DashboardCategories />
              </Protect>
            ),
          },
          {
            path: "/dashboard/users",
            element: (
              <Protect permission="ADMIN">
                <DashboardUsers />
              </Protect>
            ),
          },
          {
            path: "/dashboard/writer-requests",
            element: (
              <Protect permission="ADMIN">
                <DashboardWriterRequests />
              </Protect>
            ),
          },
          {
            path: "/dashboard/manage/articles",
            element: (
              <Protect permission="MODERATE">
                <DashboardManageArticles />
              </Protect>
            ),
          },
          {
            path: "/dashboard/bookmarks",
            element: <DashboardBookmarks />,
          },
          {
            path: "/dashboard/writer-access",
            element: <DashboardWriterAccess />,
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
