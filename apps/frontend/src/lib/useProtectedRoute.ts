import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useUserStore } from "../store/userStore";

type UserRole = "Admin" | "Seller" | "Buyer";

interface Options {
  roles?: UserRole[];
  redirectTo?: string;
}

export const useProtectedRoute = ({ roles, redirectTo = "/login" }: Options = {}) => {
  const router = useRouter();
  const { user, token } = useUserStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!token || !user) {
      setChecking(false);
      if (router.pathname !== redirectTo) {
        router.replace(redirectTo);
      }
      return;
    }

    if (roles && !roles.includes(user.role)) {
      setChecking(false);
      router.replace("/dashboard");
      return;
    }

    setChecking(false);
  }, [token, user, roles, redirectTo, router]);

  const allowed = useMemo(() => {
    if (!user || !token) return false;
    if (!roles) return true;
    return roles.includes(user.role);
  }, [token, user, roles]);

  return { user, token, checking, allowed } as const;
};
