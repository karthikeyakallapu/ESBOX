import useAuthStore from "../store/useAuth";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Loading from "../_components/loaders/Loading";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
