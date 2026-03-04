import "./App.css";
import MainLayout from "./pages/MainLayout";
import { Toaster } from "react-hot-toast";
import routesConfig from "./utils/routesConfig";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/useAuth";
import { SWRConfig } from "swr";
import { Suspense } from "react";
import Loading from "./_components/loaders/Loading";

function App() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return (
    <>
      <SWRConfig
        value={{
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          revalidateIfStale: true,
          refreshInterval: 0,
          refreshWhenHidden: false,
          refreshWhenOffline: false,
          dedupingInterval: Infinity,
        }}
      >
        <Suspense fallback={<Loading />}>
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
        </Suspense>
        <Toaster />
      </SWRConfig>
    </>
  );
}

export default App;
