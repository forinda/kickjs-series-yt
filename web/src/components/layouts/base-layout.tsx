import Footer from "../footer";
import PageHeader from "../page-header";
import { Outlet, useLocation } from "react-router";

export default function BaseLayout() {
  const currentPath = useLocation().pathname;
  const wrap = !currentPath.includes("dashboard");
  // const auth = useAuth();
  return wrap ? (
    <main className="w-full">
      <PageHeader />
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
      <Footer />
    </main>
  ) : (
    <Outlet/>
  );
}
