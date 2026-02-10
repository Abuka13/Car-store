export default function Toast({ msg, type = "info" }) {
  if (!msg) return null;
  const map = {
    info: "bg-zinc-900 text-white",
    error: "bg-red-600 text-white",
    ok: "bg-emerald-600 text-white",
  };
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-xl shadow-soft ${map[type]}`}>
      {msg}
    </div>
  );
}
