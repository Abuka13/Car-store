// client/src/components/Input.jsx

export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
    />
  );
}
