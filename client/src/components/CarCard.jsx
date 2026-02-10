// client/src/components/CarCard.jsx (ИЗМЕНЕНИЕ)

import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function CarCard({ car }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white border shadow hover:shadow-lg transition overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-zinc-200 to-zinc-300" />

      <div className="p-4 space-y-2">
        <div className="font-bold text-lg">
          {car.brand} {car.model}
        </div>

        <div className="text-sm text-zinc-500">
          {car.year} · {car.status || "available"}
        </div>

        <div className="text-xl font-black">
          ${Number(car.price || 0).toLocaleString()}
        </div>

        {car.is_auction_only && (
          <div className="text-xs font-semibold text-amber-700">
            Только аукцион
          </div>
        )}

        <Button
          onClick={() => navigate(`/cars/${car.id}`)}
          className="w-full"
        >
          Подробнее
        </Button>
      </div>
    </div>
  );
}
