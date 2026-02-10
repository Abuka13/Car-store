import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CarDetails from "../pages/CarDetails";


import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Auctions from "../pages/Auctions";
import AuctionDetails from "../pages/AuctionDetails";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCars from "../pages/admin/AdminCars";
import AdminAuctions from "../pages/admin/AdminAuctions";

import ProtectedRoute from "./ProtectedRoute";
import GuestOnly from "./GuestOnly";

export const router = createBrowserRouter([
  {
  path: "/",
  element: <MainLayout />,
  children: [
    { index: true, element: <Home /> },

    { path: "cars/:id", element: <CarDetails /> }, // ✅ ВОТ ОНО

    {
      path: "login",
      element: (
        <GuestOnly>
          <Login />
        </GuestOnly>
      ),
    },

    {
      path: "register",
      element: (
        <GuestOnly>
          <Register />
        </GuestOnly>
      ),
    },

    { path: "auctions", element: <Auctions /> },
    { path: "auctions/:id", element: <AuctionDetails /> },

    {
      path: "admin",
      element: (
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },

    {
      path: "admin/cars",
      element: (
        <ProtectedRoute adminOnly>
          <AdminCars />
        </ProtectedRoute>
      ),
    },

    {
      path: "admin/auctions",
      element: (
        <ProtectedRoute adminOnly>
          <AdminAuctions />
        </ProtectedRoute>
      ),
    },
  ],
}
,
  {
    path: "*",
    element: <div className="p-10 text-xl">404 — Страница не найдена</div>,
  },
]);
