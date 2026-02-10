import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="container py-10">
      <div className="text-3xl font-black">Админ-панель</div>
      <div className="text-zinc-600 mt-1">Управляй машинами и аукционами.</div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link className="rounded-3xl bg-white border border-zinc-100 shadow-soft p-6 hover:scale-[1.01] transition" to="/admin/cars">
          <div className="text-xl font-extrabold">Cars CRUD</div>
          <div className="text-sm text-zinc-600 mt-1">Создание / обновление / удаление машин (admin JWT).</div>
        </Link>

        <Link className="rounded-3xl bg-white border border-zinc-100 shadow-soft p-6 hover:scale-[1.01] transition" to="/admin/auctions">
          <div className="text-xl font-extrabold">Auctions CRUD</div>
          <div className="text-sm text-zinc-600 mt-1">Создание аукционов по car_id и управление временем.</div>
        </Link>
      </div>
    </div>
  );
}
