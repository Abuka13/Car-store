import { Car, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">AutoLux</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Лучшие автомобили премиум-класса и эксклюзивные аукционы для настоящих ценителей.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="text-slate-300 hover:text-white transition-colors">
                  Аукционы
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Войти
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4" />
                <span>+7 (777) 123-45-67</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4" />
                <span>info@autolux.kz</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>Астана, Казахстан</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Новости</h3>
            <p className="text-slate-300 text-sm mb-4">
              Подпишитесь на наши новости и получайте эксклюзивные предложения
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-400"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                ОК
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by AutoLux Team
          </p>
          <p className="text-slate-400 text-sm">
            © 2026 AutoLux. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
