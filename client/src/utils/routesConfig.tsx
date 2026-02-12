import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import PrivateRoute from "./PrivateRoute";
import DashBoard from "../pages/DashBoard";
import Folders from "../pages/Folders";

const routesConfig = [
  { path: "/", component: <Home /> },
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
  {
    path: "/dashboard",
    component: (
      <PrivateRoute>
        <DashBoard />
      </PrivateRoute>
    ),
  },
  {
    path: "/folders/:id",
    component: (
      <PrivateRoute>
        <Folders />
      </PrivateRoute>
    ),
  },
];

export default routesConfig;
