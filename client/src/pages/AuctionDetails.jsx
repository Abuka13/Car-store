// client/src/pages/AuctionDetails.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCarById } from "../api/cars.api";
import { getAuctions, placeBid } from "../api/auctions.api";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AuctionDetails() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    getCarById(id).then(setCar);

    getAuctions().then((a) => {
      const found = a.find((x) => x.car_id === Number(id));
      setAuction(found || null);
    });
  }, [id]);

  const bid = async () => {
    await placeBid(auction.id, Number(amount));
    setAmount("");
    const refreshed = await getAuctions();
    setAuction(refreshed.find((x) => x.car_id === Number(id)));
  };

  if (!car) return null;

  return (
    <div className="container py-10 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-zinc-200 h-80" />

        <div className="space-y-4">
          <h1 className="text-3xl font-black">
            {car.brand} {car.model}
          </h1>

          <div className="text-zinc-500">
            {car.year} · {car.status || "available"}
          </div>

          <div className="text-2xl font-black">
            ${Number(car.price || 0).toLocaleString()}
          </div>

          {auction && (
            <div className="rounded-2xl border p-4 space-y-3">
              <div className="font-semibold">
                Текущая ставка: $
                {Number(auction.current_bid || 0).toLocaleString()}
              </div>

              <Input
                type="number"
                placeholder="Ваша ставка"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              

              <Button onClick={bid} className="w-full">
                Сделать ставку
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
