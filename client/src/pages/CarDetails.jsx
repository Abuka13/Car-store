import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCarById } from "../api/cars.api";
import Button from "../components/Button";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCarById(id)
      .then(setCar)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-zinc-500">
        Загрузка...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container py-20 text-center text-red-600 text-lg">
        Машина не найдена
      </div>
    );
  }

  return (
    <div className="container py-14 max-w-5xl">
      {/* 🔙 Назад */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-zinc-500 hover:text-black"
      >
        ← Назад к списку
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* 🖼 Фото */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 h-80 shadow" />

        {/* 📋 Инфо */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black leading-tight">
              {car.brand} {car.model}
            </h1>
            <p className="text-zinc-500 mt-1">
              {car.year} · {car.status || "available"}
            </p>
          </div>

          <div className="text-3xl font-black">
            ${Number(car.price || 0).toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Spec label="Год" value={car.year} />
            <Spec label="Статус" value={car.status || "available"} />
            <Spec label="Тип" value={car.is_auction_only ? "Аукцион" : "Магазин"} />
          </div>

          {/* 🔘 Кнопки */}
          <div className="flex gap-3 pt-4">
            {!car.is_auction_only && (
              <Button className="flex-1">Купить</Button>
            )}
            {car.is_auction_only && (
              <Button variant="ghost" className="flex-1">
                Перейти к аукциону
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🧩 Мелкий компонент характеристики */
function Spec({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3">
      <div className="text-zinc-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
