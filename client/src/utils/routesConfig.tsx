import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import PrivateRoute from "./PrivateRoute";
import DashBoard from "../pages/DashBoard";
import Folders from "../pages/Folders";
import TelegramLink from "../_components/telegram/TelegramLink";
import Starred from "../pages/Starred";
import Trash from "../pages/Trash";
import PublicRoute from "./PublicRoute";
import StreamPlayer from "../pages/StreamPlayer";

const routesConfig = [
  {
    path: "/",
    component: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    component: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    component: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
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
    path: "/starred",
    component: (
      <PrivateRoute>
        <Starred />
      </PrivateRoute>
    ),
  },
  {
    path: "/trash",
    component: (
      <PrivateRoute>
        <Trash />
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
