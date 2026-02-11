import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { favoritesAPI, ordersAPI } from '../services/api';
import { Header } from '../components/Header';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data || []);
    } catch (err) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (carId) => {
    try {
      await favoritesAPI.remove(carId);
      setFavorites(favorites.filter(fav => fav.id !== carId));
      setSuccess('Removed from favorites');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to remove favorite');
      setTimeout(() => setError(''), 3000);
    }
  };

  const buyCar = async (carId) => {
    if (!window.confirm('Are you sure you want to buy this car?')) return;

    try {
      await ordersAPI.buy(carId);
      setSuccess('Car purchased successfully!');
      loadFavorites();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to purchase car');
      setTimeout(() => setError(''), 3000);
    }
  };

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
          <h1 className="page-title">My Favorites</h1>
          <p className="page-description">
            Your saved vehicles
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {favorites.length === 0 ? (
          <div className="empty-state">
            <Heart size={64} className="empty-icon" />
            <h2 className="empty-title">No favorites yet</h2>
            <p className="empty-description">
              Start adding cars to your favorites
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {favorites.map(car => (
              <div key={car.id} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title">
                      {car.brand} {car.model}
                    </h3>
                    <button
                      onClick={() => removeFavorite(car.id)}
                      className="btn btn-icon btn-outline"
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Year: </span>
                    <span style={{ fontWeight: '500' }}>{car.year}</span>
                  </div>

                  {!car.is_auction_only && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        ${car.price?.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <span className={`badge ${
                    car.status === 'available' ? 'badge-success' :
                    car.status === 'sold' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {car.is_auction_only ? 'Auction Only' : car.status}
                  </span>
                </div>

                {car.status === 'available' && !car.is_auction_only && (
                  <div className="card-footer">
                    <button 
                      onClick={() => buyCar(car.id)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <ShoppingCart size={18} />
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
