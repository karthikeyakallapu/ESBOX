import Logo from "./Logo";
import useAuthStore from "../../store/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6 bg-white border-b border-gray-100">
      <Logo />

      <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-600">
        {isAuthenticated && (
          <>
            {/* Username - Hidden on mobile */}
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {user?.username}
            </span>

            {/* Profile Avatar with Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-9 w-9 rounded-xl bg-linear-to-b from-purple-500 to-pink-500 
                flex items-center justify-center text-white text-sm font-medium shadow-md 
                hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Profile menu"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} className="text-gray-400" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
