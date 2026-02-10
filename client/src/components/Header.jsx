import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, isAuth, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <header className="border-b bg-white">
      <div className="container py-4 flex justify-between items-center">
        <div className="flex gap-4 font-semibold">
          <Link to="/">CAR-STORE</Link>
          <Link to="/auctions">Аукционы</Link>
        </div>

        {!isAuth ? (
          <div className="flex gap-4">
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <span className="text-sm text-zinc-600">{user.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg bg-zinc-900 text-white"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
