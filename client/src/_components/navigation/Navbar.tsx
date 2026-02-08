import Logo from "./Logo";
import useAuthStore from "../../store/useAuth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full items-center justify-between px-4">
      <Logo />

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="hidden sm:inline">{user?.username}</span>
        {isAuthenticated && (
          <>
            <div className="h-8 w-8 rounded-full bg-slate-200"></div>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}

        {!isAuthenticated && (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
