import "./App.css";
import MainLayout from "./pages/MainLayout";
import { Toaster } from "react-hot-toast";
import routesConfig from "./utils/routesConfig";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/useAuth";
import { SWRConfig } from "swr";

function App() {
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, [isAuthenticated]);
  return (
    <>
      <SWRConfig
        value={{
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          revalidateIfStale: false,
          refreshInterval: 0,
          refreshWhenHidden: false,
          refreshWhenOffline: false,
          dedupingInterval: Infinity,
        }}
      >
        <Router>
          <MainLayout>
            <Routes>
              {routesConfig.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.component}
                />
              ))}
            </Routes>
          </MainLayout>
        </Router>
        <Toaster />
      </SWRConfig>
    </>
  );
}

export default App;
