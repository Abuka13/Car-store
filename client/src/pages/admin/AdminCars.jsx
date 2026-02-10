import { useEffect, useState } from "react";
import { createCar, deleteCar, getCars, updateCar } from "../../api/cars.api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const empty = { brand: "", model: "", year: 2020, price: 10000, status: "available", is_auction_only: false };

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const load = async () => {
    try { setCars(await getCars()); }
    catch (e) { setToast({ msg: String(e.message || e), type: "error" }); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (c) => { setEditing(c); setForm({ ...c }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateCar(editing.id, form);
      else await createCar(form);
      setOpen(false);
      await load();
      setToast({ msg: "Сохранено ✅", type: "ok" });
    } catch (err) {
      setToast({ msg: String(err.message || err), type: "error" });
    }
  };

  const del = async (id) => {
    if (!confirm("Удалить машину?")) return;
    try { await deleteCar(id); await load(); setToast({ msg: "Удалено ✅", type: "ok" }); }
    catch (e) { setToast({ msg: String(e.message || e), type: "error" }); }
  };

  return (
    <div className="container py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-black">Cars CRUD</div>
          <div className="text-zinc-600 mt-1">POST/PUT/DELETE требует admin JWT.</div>
        </div>
        <Button onClick={startCreate}>+ Добавить</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white border border-zinc-100 shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Brand</th>
              <th className="text-left p-3">Model</th>
              <th className="text-left p-3">Year</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">AuctionOnly</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100">
                <td className="p-3">{c.id}</td>
                <td className="p-3 font-semibold">{c.brand}</td>
                <td className="p-3">{c.model}</td>
                <td className="p-3">{c.year}</td>
                <td className="p-3">${Number(c.price).toLocaleString()}</td>
                <td className="p-3">{c.is_auction_only ? "yes" : "no"}</td>
                <td className="p-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => startEdit(c)}>Edit</Button>
                  <Button variant="danger" onClick={() => del(c.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? `Edit Car #${editing.id}` : "Create Car"} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <Input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            <Input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>

          <Input placeholder="Status (available/sold/etc)" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_auction_only} onChange={(e) => setForm({ ...form, is_auction_only: e.target.checked })} />
            Только аукцион
          </label>

          <Button className="w-full">{editing ? "Save" : "Create"}</Button>
        </form>
      </Modal>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
