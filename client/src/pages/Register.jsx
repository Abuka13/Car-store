import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { register as registerApi, login as loginApi, getMe } from "../api/auth.api";
import Input from "../components/Input";
import Button from "../components/Button";
import { UserPlus, Mail, Lock } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);

    try {
      // 1. Регистрация
      const registerData = await registerApi({
        email: formData.email,
        password: formData.password,
      });
      console.log("Register response:", registerData);

      // 2. Автоматический вход после регистрации
      const loginData = await loginApi({
        email: formData.email,
        password: formData.password,
      });
      console.log("Login response:", loginData);

      const token = loginData.access_token || loginData.token;
      
      if (!token) {
        throw new Error("Токен не получен от сервера");
      }

      // 3. Сохраняем токен
      localStorage.setItem("token", token);

      // 4. Получаем данные пользователя
      const userData = await getMe();
      console.log("User data:", userData);

      // 5. Сохраняем в контекст
      login(token, userData);
      
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      localStorage.removeItem("token");
      setError(err.message || "Ошибка регистрации. Возможно, email уже используется.");
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
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg mb-4 float">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Создать аккаунт
            </h2>
            <p className="text-slate-600">Присоединяйтесь к AutoLux</p>
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
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Пароль (минимум 6 символов)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="pl-12"
                  autoComplete="new-password"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Подтвердите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="pl-12"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}