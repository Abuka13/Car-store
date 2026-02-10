import { useEffect, useState } from "react";
import { getAuctions } from "../api/auctions.api";
import AuctionCard from "../components/AuctionCard";
import Loader from "../components/Loader";
import { Search, Filter } from "lucide-react";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getAuctions();
        setAuctions(data);
        setFilteredAuctions(data);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    let result = auctions;

    if (filter !== "all") {
      result = result.filter((auction) => auction.status === filter);
    }

    if (searchQuery) {
      result = result.filter((auction) =>
        `${auction.car?.brand} ${auction.car?.model}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAuctions(result);
  }, [filter, searchQuery, auctions]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12 fade-in">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Аукционы
          </span>
        </h1>
        <p className="text-xl text-slate-600">
          Участвуйте в торгах и выигрывайте автомобиль мечты
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по марке или модели..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="upcoming">Предстоящие</option>
              <option value="ended">Завершенные</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-600">
          Найдено: {filteredAuctions.length} {filteredAuctions.length === 1 ? "аукцион" : "аукционов"}
        </div>
      </div>

      {/* Auctions Grid */}
      {loading ? (
        <Loader />
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Аукционы не найдены
          </h3>
          <p className="text-slate-600">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
