import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import PrivateRoute from "./PrivateRoute";
import DashBoard from "../pages/DashBoard";
import Folders from "../pages/Folders";
import TelegramLink from "../_components/telegram/TelegramLink";
import StreamPlayer from "../pages/StreamPlayer";

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
  {
    path: "/telegram-link",
    component: (
      <PrivateRoute>
        <TelegramLink />
      </PrivateRoute>
    ),
  },
  {
    path: "/stream",
    component: (
      <PrivateRoute>
        <StreamPlayer />
      </PrivateRoute>
    ),
  },
];

export default routesConfig;
