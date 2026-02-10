export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="container py-8 text-sm text-zinc-500 flex items-center justify-between">
        <div>© {new Date().getFullYear()} Car-Store</div>
        <div>Shop + Auctions</div>
      </div>
    </footer>
  );
}
