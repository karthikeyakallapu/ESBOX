import { lazy } from "react";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Home = lazy(() => import("../pages/Home"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const DashBoard = lazy(() => import("../pages/DashBoard"));
const Folders = lazy(() => import("../pages/Folders"));
const TelegramLink = lazy(() => import("../_components/telegram/TelegramLink"));
const Starred = lazy(() => import("../pages/Starred"));
const Trash = lazy(() => import("../pages/Trash"));
const PublicRoute = lazy(() => import("./PublicRoute"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const StreamPlayer = lazy(() => import("../pages/StreamPlayer"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ResendVerification = lazy(
  () => import("../pages/auth/ResendVerification"),
);
const SharedFile = lazy(() => import("../pages/SharedFile"));
const AllSharedLinks = lazy(() => import("../pages/AllSharedLinks"));
const Archive = lazy(() => import("../pages/Archive"));

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
    path: "/archive",
    component: (
      <PrivateRoute>
        <Archive />
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
  {
    path: "/forgot-password",
    component: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    component: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email",
    component: (
      <PublicRoute>
        <VerifyEmail />
      </PublicRoute>
    ),
  },
  {
    path: "/resend-verification",
    component: (
      <PublicRoute>
        <ResendVerification />
      </PublicRoute>
    ),
  },
  {
    path: "/s/:token",
    component: <SharedFile />,
  },
  {
    path: "/shared-links",
    component: <AllSharedLinks />,
  },
];

export default routesConfig;
