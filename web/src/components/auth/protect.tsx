import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
export type UserRoles = "Admin" | "User" | "Writer" | "Moderator";
type Props = {
  children: React.ReactNode;
  role?: UserRoles;
  notAuthorized?: React.ReactNode;
};
export default function Protect({ children, role, notAuthorized }: Props) {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentPath = useLocation();
  const nextPath = currentPath.pathname;

  useEffect(() => {
    if (!auth.user) {
      navigate("/auth?_next=" + encodeURIComponent(nextPath), { replace: true });
    }
  }, [auth.user, navigate, nextPath]);

  if (!auth.user) {
    return null;
  }
  if (role && auth.user.user.role !== role) {
    return notAuthorized ?? null;
  }
  return <>{children}</>;
}
