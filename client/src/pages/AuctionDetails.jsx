import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuctions, placeBid } from "../api/auctions.api";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";
import Button from "../components/Button";
import Input from "../components/Input";
import {
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Gavel,
  Calendar,
  Gauge,
  Fuel,
  Car as CarIcon,
} from "lucide-react";

export default function AuctionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctions();
        const found = data.find((a) => String(a.id) === String(id));
        setAuction(found);
        if (found) {
          const minBid = found.current_price
            ? found.current_price + 100
            : found.starting_price;
          setBidAmount(minBid);
        }
      } catch (error) {
        console.error("Error fetching auction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Войдите, чтобы сделать ставку");
      return;
    }

    const minBid = auction.current_price
      ? auction.current_price + 100
      : auction.starting_price;

    if (Number(bidAmount) < minBid) {
      setMessage(`Минимальная ставка: $${formatPrice(minBid)}`);
      return;
    }

    setBidLoading(true);

    try {
      await placeBid({
        auction_id: auction.id,
        user_id: user.id,
        amount: Number(bidAmount),
      });
      setMessage("Ставка успешно размещена!");
      // Refresh auction data
      const data = await getAuctions();
      const updated = data.find((a) => String(a.id) === String(id));
      setAuction(updated);
      if (updated) {
        setBidAmount(
          (updated.current_price || updated.starting_price) + 100
        );
      }
    } catch (error) {
      setMessage(error.message || "Ошибка при размещении ставки");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Аукцион не найден
        </h2>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active:
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse",
      upcoming: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      ended: "bg-gradient-to-r from-slate-500 to-gray-500 text-white",
    };
    return styles[status] || styles.ended;
  };

  const imageUrl = auction.car?.image_url;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4 fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-200 to-slate-300">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${auction.car?.brand} ${auction.car?.model}`}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="fallback-icon absolute inset-0 flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex', minHeight: '400px' }}>
                <CarIcon className="w-32 h-32 text-slate-400" />
              </div>
              <div className="absolute top-4 right-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusBadge(
                    auction.status
                  )}`}
                >
                  {auction.status === "active" && "🔴 "} {auction.status}
                </span>
              </div>
            </div>

            {/* Car Specs */}
            {auction.car && (
              <div className="card-glass">
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  Характеристики
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-600">{auction.car.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-600">
                      {formatPrice(auction.car.mileage)} км
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Fuel className="w-4 h-4 text-green-600" />
                    <span className="text-slate-600">
                      {auction.car.fuel_type}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auction Info */}
          <div className="space-y-6 slide-in">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                {auction.car?.brand} {auction.car?.model}
              </h1>
              <p className="text-xl text-slate-600">{auction.car?.year}</p>
            </div>

            {/* Time */}
            <div className="card-glass space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-700">
                  Время аукциона
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Начало</div>
                  <div className="font-semibold text-slate-800">
                    {formatDate(auction.start_time)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Конец</div>
                  <div className="font-semibold text-slate-800">
                    {formatDate(auction.end_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card-glass space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-slate-600">Начальная цена</span>
                </div>
                <span className="text-xl font-bold text-slate-800">
                  ${formatPrice(auction.starting_price)}
                </span>
              </div>

              {auction.current_price && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-slate-600">Текущая ставка</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${formatPrice(auction.current_price)}
                  </span>
                </div>
              )}

              {auction.total_bids > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{auction.total_bids} ставок</span>
                </div>
              )}
            </div>

            {/* Bid Form */}
            {auction.status === "active" && (
              <div className="card-glass bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Gavel className="w-6 h-6 text-blue-600" />
                  Сделать ставку
                </h3>

                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <Input
                    type="number"
                    label="Ваша ставка ($)"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={
                      auction.current_price
                        ? auction.current_price + 100
                        : auction.starting_price
                    }
                    step="100"
                    required
                  />

                  {message && (
                    <div
                      className={`p-3 rounded-xl text-sm ${
                        message.includes("успешно")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={bidLoading || !user}
                    className="w-full"
                  >
                    {bidLoading
                      ? "Размещение..."
                      : user
                      ? "Разместить ставку"
                      : "Войдите для ставки"}
                  </Button>
                </form>
              </div>
            )}

            {auction.status === "ended" && (
              <div className="card-glass bg-gradient-to-br from-slate-100 to-gray-100 text-center">
                <p className="text-lg font-semibold text-slate-700">
                  Аукцион завершен
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}