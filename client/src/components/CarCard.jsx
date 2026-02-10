import { Link } from "react-router-dom";
import { Calendar, Gauge, Fuel, DollarSign, Eye, Car as CarIcon } from "lucide-react";

export default function CarCard({ car }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <Link
      to={`/cars/${car.id}`}
      className="group block card-glass overflow-hidden fade-in"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-slate-200 to-slate-300">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
            }}
          />
        ) : null}
        <div className="fallback-icon absolute inset-0 flex items-center justify-center" style={{ display: car.image_url ? 'none' : 'flex' }}>
          <CarIcon className="w-20 h-20 text-slate-400" />
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge">{car.status}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex items-center gap-2 text-white">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Подробнее</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {car.brand} {car.model}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Gauge className="w-4 h-4 text-purple-500" />
            <span>{formatPrice(car.mileage)} км</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Fuel className="w-4 h-4 text-green-500" />
            <span>{car.fuel_type}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ${formatPrice(car.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}