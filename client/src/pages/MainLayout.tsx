import Navbar from "../_components/navigation/Navbar";
import SideNav from "../_components/navigation/SideNav";
import type { ReactNode } from "react";
import useAuthStore from "../store/useAuth";
import BreadCrumb from "../_components/navigation/BreadCrumb";
import StorageActions from "../_components/storage/StorageActions";
import { useLocation } from "react-router-dom";
import modalComponents from "../_components/modals/modalComponents";
import useModalStore from "../store/useModal";
import StorageOptionModal from "../_components/modals/StorageOptionModal";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, component } = useModalStore();
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
                {location.pathname !== "/starred" &&
                  location.pathname !== "/trash" && <StorageActions />}
              </>
            )}

            {children}
          </div>

          {/* Modals */}
          {modalComponents.map((modal) => {
            if (isOpen && component === modal.name) {
              return (
                <StorageOptionModal key={modal.name}>
                  {modal.component}
                </StorageOptionModal>
              );
            }
          })}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
