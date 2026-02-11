import React, { useState, useEffect } from 'react';
import { Car, Heart, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { carsAPI, favoritesAPI, ordersAPI } from '../services/api';
import { Header } from '../components/Header';

export const Cars = () => {
  const [cars, setCars] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carsRes, favsRes] = await Promise.all([
        carsAPI.getAll(),
        favoritesAPI.getAll().catch(() => ({ data: [] }))
      ]);
      
      setCars(carsRes.data || []);
      setFavorites(favsRes.data?.map(f => f.id) || []);
    } catch (err) {
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (carId) => {
    try {
      if (favorites.includes(carId)) {
        await favoritesAPI.remove(carId);
        setFavorites(favorites.filter(id => id !== carId));
        setSuccess('Removed from favorites');
      } else {
        await favoritesAPI.add(carId);
        setFavorites([...favorites, carId]);
        setSuccess('Added to favorites');
      }
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data || 'Failed to update favorites');
      setTimeout(() => setError(''), 3000);
    }
  };

  const buyCar = async (carId) => {
    if (!window.confirm('Are you sure you want to buy this car?')) return;

    try {
      await ordersAPI.buy(carId);
      setSuccess('Car purchased successfully!');
      loadData(); // Reload to update status
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to purchase car');
      setTimeout(() => setError(''), 3000);
    }
  };

  const availableCars = cars.filter(car => 
    car.status === 'available' && !car.is_auction_only
  );

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
          <h1 className="page-title">Available Cars</h1>
          <p className="page-description">
            Browse our collection of premium vehicles
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {availableCars.length === 0 ? (
          <div className="empty-state">
            <Car size={64} className="empty-icon" />
            <h2 className="empty-title">No cars available</h2>
            <p className="empty-description">
              Check back later for new listings
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {availableCars.map(car => (
              <div key={car.id} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title">
                      {car.brand} {car.model}
                    </h3>
                    <button
                      onClick={() => toggleFavorite(car.id)}
                      className="btn btn-icon btn-outline"
                      style={{ 
                        color: favorites.includes(car.id) ? 'var(--error)' : 'inherit' 
                      }}
                    >
                      <Heart 
                        size={18} 
                        fill={favorites.includes(car.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} color="var(--text-secondary)" />
                    <span style={{ color: 'var(--text-secondary)' }}>{car.year}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                      ${car.price?.toLocaleString()}
                    </span>
                  </div>

                  <span className="badge badge-success">
                    {car.status}
                  </span>
                </div>

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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
