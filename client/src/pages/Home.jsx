// client/src/pages/Home.jsx

import { useEffect, useMemo, useState } from "react";
import { getCars } from "../api/cars.api";
import CarCard from "../components/CarCard";
import Input from "../components/Input";
import Button from "../components/Button";


export default function Home() {
  const [cars, setCars] = useState([]);
  const [q, setQ] = useState("");
  const [shopOnly, setShopOnly] = useState(true);

  useEffect(() => {
    getCars().then(setCars);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cars
      .filter((c) => (shopOnly ? !c.is_auction_only : true))
      .filter((c) =>
        s
          ? `${c.brand} ${c.model} ${c.year}`
              .toLowerCase()
              .includes(s)
          : true
      );
  }, [cars, q, shopOnly]);

  return (
    <div className="container py-10 space-y-8">
      <div className="rounded-3xl bg-white border border-zinc-100 shadow p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Магазин автомобилей</h1>
            <p className="text-zinc-600 mt-1">
              Выбирай авто или участвуй в аукционах
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="w-full md:w-72">
              <Input
                placeholder="Поиск: BMW, Audi, 2020..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button
              variant={shopOnly ? "primary" : "ghost"}
              onClick={() => setShopOnly((v) => !v)}
            >
              {shopOnly ? "Только магазин" : "Все"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((car) => (
          <CarCard key={car.id} car={car} onOpen={() => {}} />
        ))}
      </div>
    </div>
  );
}
