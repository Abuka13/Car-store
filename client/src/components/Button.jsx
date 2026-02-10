export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "btn-gradient",
    outline: "btn-outline",
    danger: "bg-red-600 text-white hover:bg-red-700 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
