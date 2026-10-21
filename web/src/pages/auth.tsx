import { Navigate, useSearchParams } from "react-router";
import LoginPage from "../components/auth/login-page";
import SignUp from "../components/auth/sign-up";
import { useAuth } from "@/context/auth-context";

type AuthPage = "login" | "register";

// Only same-app paths: "/x" yes, "//evil.com" or "https://evil.com" no.
const safeNext = (next: string | null, fallback = "/dashboard") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;

export default function Auth() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page: AuthPage = searchParams.get("page") === "register" ? "register" : "login";
  const next = searchParams.get("_next");

  const changePage = (newPage: AuthPage) =>
    setSearchParams({ page: newPage, ...(next ? { _next: next } : {}) });

  // Already signed in: nothing to do here.
  if (user) return <Navigate to={safeNext(next)} replace />;

  return (
    <div className="flex justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-sm space-y-6">
        {page === "register" ? (
          <SignUp changePage={changePage} next={safeNext(next)} />
        ) : (
          <LoginPage changePage={changePage} next={safeNext(next)} />
        )}
      </div>
    </div>
  );
}
