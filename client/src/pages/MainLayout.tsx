import Navbar from "../_components/navigation/Navbar";
import SideNav from "../_components/navigation/SideNav";
import type { ReactNode } from "react";
import useAuthStore from "../store/useAuth";
import BreadCrumb from "../_components/navigation/BreadCrumb";
import StorageActions from "../_components/storage/StorageActions";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="h-16 shrink-0 bg-white">
        <Navbar />
      </header>

      <div className="flex flex-1 overflow-hidden m-2">
        {isAuthenticated && <SideNav />}

        {/* Main content */}
        <main className="flex-1 overflow-hidden pl-2">
          <div className="bg-white h-[99.9%]  rounded-xl  p-2">
            {isAuthenticated && (
              <>
                <BreadCrumb />
                {location.pathname !== "/starred" && <StorageActions />}
              </>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
