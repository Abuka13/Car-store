import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { login as loginApi, getMe } from "../api/auth.api";
import Input from "../components/Input";
import Button from "../components/Button";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Логин - получаем токен
      const loginData = await loginApi({ email, password });
      console.log("Login response:", loginData);
      
      const token = loginData.access_token || loginData.token;
      
      if (!token) {
        throw new Error("Токен не получен от сервера");
      }
      
      // 2. Сохраняем токен
      localStorage.setItem("token", token);
      
      // 3. Получаем данные пользователя
      const userData = await getMe();
      console.log("User data:", userData);
      
      // 4. Сохраняем пользователя в контекст
      login(token, userData);
      
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      localStorage.removeItem("token"); // Удаляем токен если что-то пошло не так
      setError(err.message || "Ошибка входа. Проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="card-glass p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4 float">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Добро пожаловать
            </h2>
            <p className="text-slate-600">Войдите в свой аккаунт</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12"
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}