import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="font-semibold">{title}</div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
