import { Link } from "react-router-dom";
import { Clock, DollarSign, Users, TrendingUp, Car as CarIcon } from "lucide-react";

export default function AuctionCard({ auction }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "from-green-500 to-emerald-500",
      upcoming: "from-blue-500 to-cyan-500",
      ended: "from-slate-500 to-gray-500",
    };
    return colors[status] || "from-slate-500 to-gray-500";
  };

  const imageUrl = auction.car?.image_url;

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group block card-glass overflow-hidden slide-in"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-slate-200 to-slate-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${auction.car?.brand} ${auction.car?.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
            }}
          />
        ) : null}
        <div className="fallback-icon absolute inset-0 flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
          <CarIcon className="w-20 h-20 text-slate-400" />
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(
              auction.status
            )} text-white shadow-lg`}
          >
            {auction.status}
          </span>
        </div>
        {auction.status === "active" && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            🔴 LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {auction.car?.brand} {auction.car?.model} {auction.car?.year}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Начало</span>
              <span className="font-medium">{formatDate(auction.start_time)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Конец</span>
              <span className="font-medium">{formatDate(auction.end_time)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              Начальная цена
            </span>
            <span className="font-bold text-slate-800">
              ${formatPrice(auction.starting_price)}
            </span>
          </div>
          {auction.current_price && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Текущая ставка
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${formatPrice(auction.current_price)}
              </span>
            </div>
          )}
          {auction.total_bids > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{auction.total_bids} ставок</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}