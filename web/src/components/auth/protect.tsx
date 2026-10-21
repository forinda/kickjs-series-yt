import { useAuth } from "@/context/auth-store";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { can, type PermissionKey } from "@/lib/permissions";

type Props = {
  children: React.ReactNode;
  /** Also require this permission; signed-in users without it see `notAuthorized`. */
  permission?: PermissionKey;
  notAuthorized?: React.ReactNode;
};

export default function Protect({ children, permission, notAuthorized }: Props) {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentPath = useLocation();
  const nextPath = currentPath.pathname + currentPath.search;

  useEffect(() => {
    if (!auth.user) {
      navigate("/auth?_next=" + encodeURIComponent(nextPath), { replace: true });
    }
  }, [auth.user, navigate, nextPath]);

  if (!auth.user) {
    return null;
  }
  if (permission && !can(auth.user.user, permission)) {
    return (
      notAuthorized ?? (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-semibold">You don't have access to this page</h1>
          <p className="mt-2 text-muted-foreground">Ask an administrator if you think you should.</p>
        </div>
      )
    );
  }
  return <>{children}</>;
}
