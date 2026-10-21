import Footer from "../footer";
import PageHeader from "../page-header";
import { Outlet, useLocation } from "react-router";

export default function BaseLayout() {
  const currentPath = useLocation().pathname;
  const wrap = !currentPath.includes("dashboard");
  return wrap ? (
    <main className="flex min-h-svh w-full flex-col">
      <PageHeader />
      <div className="mx-auto w-full max-w-7xl flex-1">
        <Outlet />
      </div>
      <Footer />
    </main>
  ) : (
    <Outlet/>
  );
}
