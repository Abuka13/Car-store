// client/src/layouts/MainLayout.jsx

import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        <Outlet />
      </main>
    </>
  );
}
