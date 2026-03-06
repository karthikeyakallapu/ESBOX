import Logo from "./Logo";
import useAuthStore from "../../store/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Search, Mic } from "lucide-react";
import { useState, useRef } from "react";
import useModalStore from "../../store/useModal";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalStore();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearchClick = () => {
    openModal("fileSearch", null);
  };

  return (
    <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <Logo />

        {/* Clean, noticeable searchbox */}
        <div className="flex-1 max-w-4xl ml-16">
          <div
            onClick={handleSearchClick}
            className="relative group cursor-pointer"
          >
            {/* Main search container */}
            <div className="relative flex items-center">
              {/* Search Icon */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Search
                  size={22}
                  className="text-gray-400 group-hover:text-purple-500 transition-colors"
                />
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Files..."
                className="w-full h-14 pl-12 pr-28 
                  bg-gray-100
                  border-2 border-transparent
                  rounded-xl
                  text-base text-gray-700
                  placeholder-gray-500
                  transition-all duration-200
                  focus:outline-none focus:bg-white focus:border-purple-400
                  group-hover:bg-white group-hover:border-gray-300
                  group-hover:shadow-md
                  "
                readOnly
                onClick={handleSearchClick}
              />

              {/* Right side elements */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Voice Search Button */}
                <div className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Mic size={18} className="text-gray-500" />
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300"></div>

                {/* Search Hint */}
                <span className="text-sm text-gray-500 font-medium px-2">
                  ⌘K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-600">
        {isAuthenticated && (
          <>
            {/* Username */}
            <span className="hidden sm:inline text-sm font-medium text-gray-600">
              {user?.username}
            </span>

            {/* Profile Avatar */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-9 w-9 rounded-lg bg-linear-to-b from-purple-500 to-pink-500 
                flex items-center justify-center text-white text-sm font-medium shadow-sm 
                hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Profile menu"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
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
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User size={16} className="text-gray-400" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
