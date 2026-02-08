import useAuthStore from "../store/useAuth";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login");
  }

  return children;
};

export default PrivateRoute;
