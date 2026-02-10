import { useEffect, useMemo, useState } from "react";
import { getAuctions } from "../api/auctions.api";
import { getCars } from "../api/cars.api";
import AuctionCard from "../components/AuctionCard";
import Input from "../components/Input";
import Toast from "../components/Toast";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [cars, setCars] = useState([]);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "info" });

  useEffect(() => {
    Promise.all([getAuctions(), getCars()])
      .then(([a, c]) => {
        setAuctions(a);
        setCars(c);
      })
      .catch((e) => setToast({ msg: String(e.message || e), type: "error" }));
  }, []);

  const carById = useMemo(() => {
    const m = new Map();
    cars.forEach((c) => m.set(c.id, c));
    return m;
  }, [cars]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return auctions;
    return auctions.filter((a) => {
      const car = carById.get(a.car_id);
      const title = car ? `${car.brand} ${car.model} ${car.year}` : `car ${a.car_id}`;
      return title.toLowerCase().includes(s);
    });
  }, [auctions, q, carById]);

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-3xl font-black">Аукционы</div>
          <div className="text-zinc-600 mt-1">Делай ставки. Бэк ограничивает: максимум 3 ставки в минуту.</div>
        </div>
        <div className="w-full md:w-80">
          <Input placeholder="Поиск по аукционам..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((a) => (
          <AuctionCard key={a.id} auction={a} car={carById.get(a.car_id)} />
        ))}
      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
