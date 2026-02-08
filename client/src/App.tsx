import "./App.css";
import MainLayout from "./pages/MainLayout";
import { Toaster } from "react-hot-toast";
import routesConfig from "./utils/routesConfig";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/useAuth";

function App() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return (
    <>
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
    </>
  );
}

export default App;
