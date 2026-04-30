import { createBrowserRouter } from "react-router-dom";
import MeetingsPage from "../features/meetings/pages/MeetingPage";
import MeetingDetailPage from "../features/meetings/pages/MeetingDetailPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MeetingsPage />,
      },
      {
        path: "/meeting/:id",
        element: <MeetingDetailPage />,
      },
    ],
  },
]);