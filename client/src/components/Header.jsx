import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Car, LogOut, User, Shield, Gavel } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AutoLux
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              Главная
            </Link>
            <Link
              to="/auctions"
              className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              <Gavel className="w-4 h-4" />
              Аукционы
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-700">
                    {user.email}
                  </span>
                  {user.role === "admin" && (
                    <Shield className="w-4 h-4 text-purple-600" />
                  )}
                </div>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="hidden sm:block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Админ
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выход</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
