import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCars } from "../api/cars.api";
import { getAuctions } from "../api/auctions.api";
import CarCard from "../components/CarCard";
import AuctionCard from "../components/AuctionCard";
import Loader from "../components/Loader";
import { Car, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsData, auctionsData] = await Promise.all([
          getCars(),
          getAuctions(),
        ]);
        setCars(carsData.slice(0, 6));
        setAuctions(auctionsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 fade-in">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-slate-700">
                Премиум автомобили с 2024
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Найдите автомобиль
              </span>
              <br />
              <span className="text-slate-800">своей мечты</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Эксклюзивная коллекция премиум автомобилей и уникальные аукционы. 
              Проверенные продавцы, гарантия качества.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/auctions" className="btn-gradient px-8 py-4 text-lg">
                Аукционы
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </Link>
              <Link to="#cars" className="btn-outline px-8 py-4 text-lg">
                Каталог авто
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-10">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-slate-600 mt-1">Автомобилей</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-sm text-slate-600 mt-1">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-slate-600 mt-1">Поддержка</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-glass text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg float">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Гарантия качества</h3>
            <p className="text-slate-600">
              Все автомобили проходят строгую проверку и сертификацию
            </p>
          </div>

          <div className="card-glass text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg float" style={{ animationDelay: '0.2s' }}>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Лучшие цены</h3>
            <p className="text-slate-600">
              Конкурентные цены и выгодные предложения на аукционах
            </p>
          </div>

          <div className="card-glass text-center space-y-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl shadow-lg float" style={{ animationDelay: '0.4s' }}>
              <Car className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Широкий выбор</h3>
            <p className="text-slate-600">
              Огромная коллекция автомобилей премиум-класса
            </p>
          </div>
        </div>
      </section>

      {/* Active Auctions */}
      {auctions.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-2">
                Активные аукционы
              </h2>
              <p className="text-slate-600">Сделайте ставку на автомобиль мечты</p>
            </div>
            <Link
              to="/auctions"
              className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
            >
              Все аукционы
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/auctions" className="btn-gradient">
              Все аукционы
            </Link>
          </div>
        </section>
      )}

      {/* Featured Cars */}
      <section id="cars" className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              Избранные автомобили
            </h2>
            <p className="text-slate-600">Лучшие предложения для вас</p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="card-glass bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white text-center py-16 px-8">
          <h2 className="text-4xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-xl mb-8 text-white/90">
            Присоединяйтесь к тысячам счастливых владельцев автомобилей
          </p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Зарегистрироваться сейчас
          </Link>
        </div>
      </section>
    </div>
  );
}
