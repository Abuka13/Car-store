import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCarById } from "../api/cars.api";
import Loader from "../components/Loader";
import {
  Calendar,
  Gauge,
  Fuel,
  DollarSign,
  Palette,
  Car as CarIcon,
} from "lucide-react";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await getCarById(id);
        setCar(data);
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) return <Loader />;

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Автомобиль не найден
        </h2>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const specs = [
    { icon: Calendar, label: "Год", value: car.year },
    { icon: Gauge, label: "Пробег", value: `${formatPrice(car.mileage)} км` },
    { icon: Fuel, label: "Топливо", value: car.fuel_type },
    { icon: Palette, label: "Цвет", value: car.color },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4 fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-200 to-slate-300">
              {car.image_url ? (
                <img
                  src={car.image_url}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="fallback-icon absolute inset-0 flex items-center justify-center" style={{ display: car.image_url ? 'none' : 'flex', minHeight: '400px' }}>
                <CarIcon className="w-32 h-32 text-slate-400" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="badge text-lg px-4 py-2">{car.status}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8 slide-in">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-xl text-slate-600">{car.year} год</p>
            </div>

            {/* Price */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <span className="text-lg text-slate-600">Цена</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                ${formatPrice(car.price)}
              </div>
            </div>

            {/* Specs */}
            <div className="card-glass">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Характеристики
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <spec.icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-slate-500">{spec.label}</div>
                      <div className="font-semibold text-slate-800">
                        {spec.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="card-glass">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Описание
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {car.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <button className="w-full btn-gradient py-4 text-lg">
              Связаться с продавцом
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}