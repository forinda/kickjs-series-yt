import { useSearchParams } from "react-router";
import LoginPage from "../components/auth/login-page";
import SignUp from "../components/auth/sign-up";

type AuthPage = "login" | "register";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") as AuthPage;
  const nextPage = searchParams.get("_next") as AuthPage;
  const changePage = (newPage: AuthPage) => {
    setSearchParams({ page: newPage, ...(nextPage ? { _next: nextPage } : {}) });
  };
  console.log("Current page:", page);

  return (
    <div>
      {page === "register" ? (
        <SignUp changePage={changePage} />
      ) : (
        <LoginPage changePage={changePage} />
      )}
    </div>
  );
}
