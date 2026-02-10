export default function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      </div>
    </div>
  );
}
