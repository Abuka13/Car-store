// client/src/components/Button.jsx

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition";

  const styles = {
    primary: "bg-black text-white hover:bg-zinc-800",
    ghost: "border border-zinc-200 hover:bg-zinc-100",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
