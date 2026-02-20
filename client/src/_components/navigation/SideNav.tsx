import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  Trash2,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "../../store/useAuth";

const SideNav = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuthStore();

  const navItems = [
    { path: "/starred", label: "Starred", icon: Star },
    { path: "/trash", label: "Trash", icon: Trash2 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isDashboardActive = location.pathname === "/dashboard";

  return (
    <aside
      className={`relative bg-white rounded-xl  border border-gray-100
      transition-[width] duration-500 ease-in-out
      ${isOpen ? "w-64" : "w-18"} overflow-hidden`}
    >
      <nav className="h-full px-2 py-4 flex flex-col">
        {/* ---------------- Dashboard Row (Header + Toggle) ---------------- */}
        <div
          className={`relative flex items-center rounded-xl mb-4 
          transition-all duration-300 
          ${isOpen ? "px-4 py-3 justify-between" : "p-3 justify-between"}
          ${
            isDashboardActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {/* Dashboard Link */}
          <Link to="/dashboard" className="flex items-center flex-1">
            <LayoutDashboard
              size={20}
              className={`${
                isDashboardActive ? "text-blue-600" : "text-gray-400"
              }`}
            />

            {isOpen && (
              <span className="ml-3 text-sm font-medium">Dashboard</span>
            )}
          </Link>

          {/* Toggle Arrow (Always Visible) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md "
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* ---------------- Other Nav Items ---------------- */}
        <ul className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative group flex items-center rounded-xl
                  transition-all duration-300
                  ${isOpen ? "px-4 py-3" : "p-3 justify-center"}
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}

                  <Icon
                    size={20}
                    className={`transition-transform duration-300 group-hover:scale-110 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-700"
                    }`}
                  />

                  {isOpen && (
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip in collapsed state */}
                  {!isOpen && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ---------------- Profile Section ---------------- */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className={`flex items-center ${!isOpen && "justify-center"}`}>
            <div
              className="h-9 w-9 rounded-xl bg-linear-to-b from-purple-500 to-pink-500 
              flex items-center justify-center text-white text-sm font-medium shadow-md"
            >
              {user?.username.charAt(0).toUpperCase()}
            </div>

            {isOpen && (
              <>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400"> {user?.email}</p>
                </div>

                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={logout}
                >
                  <LogOut
                    size={16}
                    className="text-gray-400 hover:text-gray-700"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default SideNav;
