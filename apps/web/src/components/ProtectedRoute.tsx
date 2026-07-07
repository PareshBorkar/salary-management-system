import { type PropsWithChildren, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getSessionToken, sessionExpiredEventName } from "../api/session";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const [token, setToken] = useState(() => getSessionToken());

  useEffect(() => {
    function handleSessionExpired() {
      setToken(getSessionToken());
    }

    window.addEventListener(sessionExpiredEventName, handleSessionExpired);

    return () => {
      window.removeEventListener(sessionExpiredEventName, handleSessionExpired);
    };
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
