import { useEffect, useState } from "react";
import { createAuction, deleteAuction, getAuctions, updateAuction } from "../../api/auctions.api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

const empty = {
  car_id: 1,
  start_price: 1000,
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600_000).toISOString(),
};

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const load = async () => {
    try { setAuctions(await getAuctions()); }
    catch (e) { setToast({ msg: String(e.message || e), type: "error" }); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (a) => { setEditing(a); setForm({ ...a }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        car_id: Number(form.car_id),
        start_price: Number(form.start_price),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      };
      if (editing) await updateAuction(editing.id, payload);
      else await createAuction(payload);

      setOpen(false);
      await load();
      setToast({ msg: "Сохранено ✅", type: "ok" });
    } catch (err) {
      setToast({ msg: String(err.message || err), type: "error" });
    }
  };

  const del = async (id) => {
    if (!confirm("Удалить аукцион?")) return;
    try { await deleteAuction(id); await load(); setToast({ msg: "Удалено ✅", type: "ok" }); }
    catch (e) { setToast({ msg: String(e.message || e), type: "error" }); }
  };

  return (
    <div className="container py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-black">Auctions CRUD</div>
          <div className="text-zinc-600 mt-1">Бэк не защищает, но UI доступен только админам.</div>
        </div>
        <Button onClick={startCreate}>+ Добавить</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white border border-zinc-100 shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">CarID</th>
              <th className="text-left p-3">Start</th>
              <th className="text-left p-3">StartTime</th>
              <th className="text-left p-3">EndTime</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((a) => (
              <tr key={a.id} className="border-t border-zinc-100">
                <td className="p-3">{a.id}</td>
                <td className="p-3 font-semibold">{a.car_id}</td>
                <td className="p-3">${Number(a.start_price).toLocaleString()}</td>
                <td className="p-3">{new Date(a.start_time).toLocaleString()}</td>
                <td className="p-3">{new Date(a.end_time).toLocaleString()}</td>
                <td className="p-3 text-right space-x-2">
                  <Button variant="ghost" onClick={() => startEdit(a)}>Edit</Button>
                  <Button variant="danger" onClick={() => del(a.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? `Edit Auction #${editing.id}` : "Create Auction"} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={save}>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="car_id" value={form.car_id} onChange={(e) => setForm({ ...form, car_id: e.target.value })} />
            <Input placeholder="start_price" value={form.start_price} onChange={(e) => setForm({ ...form, start_price: e.target.value })} />
          </div>
          <Input placeholder="start_time ISO" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input placeholder="end_time ISO" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <Button className="w-full">{editing ? "Save" : "Create"}</Button>
        </form>
      </Modal>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
