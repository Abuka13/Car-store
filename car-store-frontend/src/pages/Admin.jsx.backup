import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Car, Gavel } from 'lucide-react';
import { carsAPI, auctionsAPI } from '../services/api';
import { Header } from '../components/Header';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [carModal, setCarModal] = useState(null);
  const [auctionModal, setAuctionModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carsRes, auctionsRes] = await Promise.all([
        carsAPI.getAll(),
        auctionsAPI.getAll()
      ]);
      setCars(carsRes.data || []);
      setAuctions(auctionsRes.data || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Car Management
  const CarForm = ({ car, onClose }) => {
    const [formData, setFormData] = useState({
      brand: car?.brand || '',
      model: car?.model || '',
      year: car?.year || new Date().getFullYear(),
      price: car?.price || 0,
      status: car?.status || 'available',
      is_auction_only: car?.is_auction_only || false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (car) {
          await carsAPI.update(car.id, formData);
          setSuccess('Car updated successfully');
        } else {
          await carsAPI.create(formData);
          setSuccess('Car created successfully');
        }
        loadData();
        onClose();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data || 'Operation failed');
        setTimeout(() => setError(''), 3000);
      }
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{car ? 'Edit Car' : 'Add New Car'}</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_auction_only}
                    onChange={(e) => setFormData({ ...formData, is_auction_only: e.target.checked })}
                  />
                  <span className="form-label" style={{ margin: 0 }}>Auction Only</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {car ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Auction Management
  const AuctionForm = ({ auction, onClose }) => {
    const [formData, setFormData] = useState({
      car_id: auction?.car_id || '',
      start_price: auction?.start_price || 0,
      start_time: auction?.start_time ? new Date(auction.start_time).toISOString().slice(0, 16) : '',
      end_time: auction?.end_time ? new Date(auction.end_time).toISOString().slice(0, 16) : ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = {
          ...formData,
          car_id: parseInt(formData.car_id),
          start_price: parseFloat(formData.start_price),
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString()
        };

        if (auction) {
          await auctionsAPI.update(auction.id, data);
          setSuccess('Auction updated successfully');
        } else {
          await auctionsAPI.create(data);
          setSuccess('Auction created successfully');
        }
        loadData();
        onClose();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data || 'Operation failed');
        setTimeout(() => setError(''), 3000);
      }
    };

    const availableCars = cars.filter(car => car.status === 'available');

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{auction ? 'Edit Auction' : 'Create Auction'}</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Car</label>
                <select
                  className="form-select"
                  value={formData.car_id}
                  onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                  required
                  disabled={!!auction}
                >
                  <option value="">Select a car</option>
                  {availableCars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Starting Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.start_price}
                  onChange={(e) => setFormData({ ...formData, start_price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {auction ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const deleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await carsAPI.delete(id);
      setSuccess('Car deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete car');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteAuction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;
    
    try {
      await auctionsAPI.delete(id);
      setSuccess('Auction deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete auction');
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
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">Manage cars and auctions</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
            onClick={() => setActiveTab('cars')}
          >
            <Car size={18} />
            Cars ({cars.length})
          </button>
          <button
            className={`tab ${activeTab === 'auctions' ? 'active' : ''}`}
            onClick={() => setActiveTab('auctions')}
          >
            <Gavel size={18} />
            Auctions ({auctions.length})
          </button>
        </div>

        {activeTab === 'cars' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Cars</h2>
              <button onClick={() => setCarModal({})} className="btn btn-primary">
                <Plus size={18} />
                Add Car
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Auction Only</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car.id}>
                      <td>#{car.id}</td>
                      <td>{car.brand}</td>
                      <td>{car.model}</td>
                      <td>{car.year}</td>
                      <td>${car.price?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          car.status === 'available' ? 'badge-success' :
                          car.status === 'sold' ? 'badge-error' : 'badge-warning'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td>{car.is_auction_only ? 'Yes' : 'No'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCarModal(car)}
                            className="btn btn-sm btn-outline"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteCar(car.id)}
                            className="btn btn-sm btn-outline"
                            style={{ color: 'var(--error)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Auctions</h2>
              <button onClick={() => setAuctionModal({})} className="btn btn-primary">
                <Plus size={18} />
                Create Auction
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Car</th>
                    <th>Start Price</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map(auction => {
                    const car = cars.find(c => c.id === auction.car_id);
                    return (
                      <tr key={auction.id}>
                        <td>#{auction.id}</td>
                        <td>{car ? `${car.brand} ${car.model}` : 'Unknown'}</td>
                        <td>${auction.start_price?.toLocaleString()}</td>
                        <td>{new Date(auction.start_time).toLocaleString()}</td>
                        <td>{new Date(auction.end_time).toLocaleString()}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setAuctionModal(auction)}
                              className="btn btn-sm btn-outline"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteAuction(auction.id)}
                              className="btn btn-sm btn-outline"
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {carModal && <CarForm car={carModal.id ? carModal : null} onClose={() => setCarModal(null)} />}
        {auctionModal && <AuctionForm auction={auctionModal.id ? auctionModal : null} onClose={() => setAuctionModal(null)} />}
      </div>
    </div>
  );
};
