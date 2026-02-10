import React, { useState, useEffect } from 'react';
import { Gavel, Clock, TrendingUp, Calendar } from 'lucide-react';
import { auctionsAPI, carsAPI } from '../services/api';
import { Header } from '../components/Header';

export const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [cars, setCars] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bidModal, setBidModal] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [auctionsRes, carsRes] = await Promise.all([
        auctionsAPI.getAll(),
        carsAPI.getAll()
      ]);
      
      setAuctions(auctionsRes.data || []);
      
      const carsMap = {};
      (carsRes.data || []).forEach(car => {
        carsMap[car.id] = car;
      });
      setCars(carsMap);
    } catch (err) {
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isActive = (auction) => {
    const now = new Date();
    const start = new Date(auction.start_time);
    const end = new Date(auction.end_time);
    return now >= start && now <= end;
  };

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    try {
      await auctionsAPI.placeBid(bidModal.id, parseFloat(bidAmount));
      setSuccess('Bid placed successfully!');
      setBidModal(null);
      setBidAmount('');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to place bid');
      setTimeout(() => setError(''), 3000);
    }
  };

  const activeAuctions = auctions.filter(isActive);

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Live Auctions</h1>
          <p className="page-description">
            Place your bids on premium vehicles
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {activeAuctions.length === 0 ? (
          <div className="empty-state">
            <Gavel size={64} className="empty-icon" />
            <h2 className="empty-title">No active auctions</h2>
            <p className="empty-description">
              Check back later for new auctions
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {activeAuctions.map(auction => {
              const car = cars[auction.car_id];
              if (!car) return null;

              return (
                <div key={auction.id} className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      {car.brand} {car.model}
                    </h3>
                  </div>
                  
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)' }}>{car.year}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Starting Price:
                      </span>
                      <span style={{ fontWeight: '600' }}>
                        ${auction.start_price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Time Remaining:
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
                        {getTimeRemaining(auction.end_time)}
                      </span>
                    </div>

                    <span className="badge badge-info">
                      Active Auction
                    </span>
                  </div>

                  <div className="card-footer">
                    <button 
                      onClick={() => setBidModal(auction)}
                      className="btn btn-accent"
                      style={{ width: '100%' }}
                    >
                      <Gavel size={18} />
                      Place Bid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {bidModal && (
          <div className="modal-overlay" onClick={() => setBidModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Place Your Bid</h2>
                <button onClick={() => setBidModal(null)} className="modal-close">
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {cars[bidModal.car_id]?.brand} {cars[bidModal.car_id]?.model}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Starting Price: ${bidModal.start_price?.toLocaleString()}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Bid Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid"
                    min={bidModal.start_price}
                    step="0.01"
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Minimum bid: ${bidModal.start_price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setBidModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleBid} className="btn btn-accent">
                  <Gavel size={18} />
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
