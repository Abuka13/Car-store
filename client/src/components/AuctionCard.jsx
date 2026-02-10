import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function AuctionCard({ auction }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white border shadow hover:shadow-lg transition overflow-hidden">
      {/* Фото */}
      <div className="h-40 bg-gradient-to-br from-amber-200 to-orange-300" />

      <div className="p-4 space-y-3">
        <div className="font-bold text-lg">
          {auction.car.brand} {auction.car.model}
        </div>

        <div className="text-sm text-zinc-500">
          {auction.car.year} · Аукцион
        </div>

        <div className="text-xl font-black text-amber-600">
          ${Number(auction.current_price).toLocaleString()}
        </div>

        <div className="text-xs text-zinc-500">
          Завершение: {new Date(auction.ends_at).toLocaleString()}
        </div>

        <Button
          onClick={() => navigate(`/auctions/${auction.id}`)}
          className="w-full"
        >
          Участвовать
        </Button>
      </div>
    </div>
  );
}
