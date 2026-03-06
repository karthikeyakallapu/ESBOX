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
import spreadComponents from "../_components/modals/spreadComponents";
import SpreadModal from "../_components/modals/SpreadModal";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, component } = useModalStore();
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="h-18 shrink-0 bg-white">
        <Navbar />
      </header>

      <div className="flex flex-1  m-2">
        {isAuthenticated && <SideNav />}

        {/* Main content */}
        <main className="flex-1 min-w-0 pl-2">
          <div className="bg-white h-full rounded-xl p-2 flex flex-col overflow-hidden">
            {isAuthenticated && (
              <div className="shrink-0">
                {location.pathname !== "/starred" &&
                  !location.pathname.includes("/s/") &&
                  location.pathname !== "/shared-links" &&
                  location.pathname !== "/trash" && (
                    <>
                      <BreadCrumb />
                      <StorageActions />
                    </>
                  )}
              </div>
            )}

            <div className="flex-1 overflow-auto">{children}</div>
          </div>
          {/* Modals */}
          {modalComponents.map((modal) => {
            if (isOpen && component === modal.name) {
              return (
                <StorageOptionModal key={modal.name} size={modal.size}>
                  {modal.component}
                </StorageOptionModal>
              );
            }
          })}

          {/* Spread Modals */}
          {spreadComponents.map((modal) => {
            if (isOpen && component === modal.name) {
              return (
                <SpreadModal key={modal.name} size={modal.size}>
                  {modal.component}
                </SpreadModal>
              );
            }
          })}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
