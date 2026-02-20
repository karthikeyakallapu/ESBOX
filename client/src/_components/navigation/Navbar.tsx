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
            <div
              className="h-9 w-9 rounded-xl bg-linear-to-b from-purple-500 to-pink-500 
              flex items-center justify-center text-white text-sm font-medium shadow-md"
            >
              {user?.username.charAt(0).toUpperCase()}
            </div>
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
