import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Car, DollarSign, Calendar, Check, X, Trash2, ExternalLink } from 'lucide-react';
import { tradeInsAPI, carsAPI } from '../services/api';
import { Header } from '../components/Header';

export const TradeIn = () => {
  const [tradeIns, setTradeIns] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const [formData, setFormData] = useState({
    offered_brand: '',
    offered_model: '',
    year: new Date().getFullYear(),
    mileage: '',
    desired_car_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tradeInsRes, carsRes] = await Promise.all([
        tradeInsAPI.getMy(),
        carsAPI.getAll(),
      ]);
      setTradeIns(tradeInsRes.data || []);
      setCars(carsRes.data || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.offered_brand || !formData.offered_model || !formData.mileage || !formData.desired_car_id) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await tradeInsAPI.create({
        offered_brand: formData.offered_brand,
        offered_model: formData.offered_model,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        desired_car_id: parseInt(formData.desired_car_id),
      });
      
      setSuccess('Trade-in request submitted successfully!');
      setShowModal(false);
      setFormData({
        offered_brand: '',
        offered_model: '',
        year: new Date().getFullYear(),
        mileage: '',
        desired_car_id: '',
      });
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to submit trade-in request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSetPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) < 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      const response = await tradeInsAPI.setPayment(paymentModal.id, parseFloat(paymentAmount));
      setSuccess('Payment set successfully!');
      
      if (response.data?.kolesa_search_url) {
        window.open(response.data.kolesa_search_url, '_blank');
      }
      
      setPaymentModal(null);
      setPaymentAmount('');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to set payment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this trade-in offer?')) {
      return;
    }

    try {
      await tradeInsAPI.reject(id);
      setSuccess('Trade-in offer rejected');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject trade-in');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trade-in request?')) {
      return;
    }

    try {
      await tradeInsAPI.delete(id);
      setSuccess('Trade-in request deleted');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete trade-in');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: 'badge-warning' },
      evaluated: { text: 'Evaluated', class: 'badge-info' },
      accepted: { text: 'Accepted', class: 'badge-success' },
      rejected: { text: 'Rejected', class: 'badge-error' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getCarById = (carId) => cars.find(c => c.id === carId);

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
          <h1 className="page-title">Trade-In Requests</h1>
          <p className="page-description">
            Exchange your old car for a new one from our inventory
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <ArrowLeftRight size={18} />
            New Trade-In Request
          </button>
        </div>

        {tradeIns.length === 0 ? (
          <div className="empty-state">
            <ArrowLeftRight size={64} className="empty-icon" />
            <h2 className="empty-title">No trade-in requests</h2>
            <p className="empty-description">
              Submit a trade-in request to exchange your car
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {tradeIns.map(tradeIn => {
              const desiredCar = getCarById(tradeIn.desired_car_id);
              
              return (
                <div key={tradeIn.id} className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      {tradeIn.offered_brand} {tradeIn.offered_model}
                    </h3>
                    {getStatusBadge(tradeIn.status)}
                  </div>
                  
                  <div className="card-body">
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Your Car:
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Car size={16} color="var(--text-secondary)" />
                        <span>{tradeIn.offered_brand} {tradeIn.offered_model}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} color="var(--text-secondary)" />
                        <span style={{ color: 'var(--text-secondary)' }}>{tradeIn.year}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Mileage: {tradeIn.mileage?.toLocaleString()} km
                        </span>
                      </div>
                    </div>

                    {desiredCar && (
                      <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Desired Car:
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Car size={16} color="var(--accent)" />
                          <span style={{ fontWeight: '600' }}>
                            {desiredCar.brand} {desiredCar.model} ({desiredCar.year})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={16} color="var(--text-secondary)" />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Price: ${desiredCar.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {tradeIn.status === 'evaluated' && (
                      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--success-bg)', borderRadius: '8px' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={18} color="var(--success)" />
                          <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                            Evaluated
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Your car value:
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                            ${tradeIn.estimated_price?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            You need to pay:
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent)' }}>
                            ${(desiredCar?.price - tradeIn.estimated_price)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {tradeIn.status === 'accepted' && tradeIn.user_payment !== null && (
                      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--success-bg)', borderRadius: '8px' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={18} color="var(--success)" />
                          <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                            Trade-In Accepted!
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Your payment:
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                            ${tradeIn.user_payment?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="flex gap-2" style={{ width: '100%' }}>
                      {tradeIn.status === 'evaluated' && (
                        <>
                          <button 
                            onClick={() => setPaymentModal(tradeIn)}
                            className="btn btn-success"
                            style={{ flex: 1 }}
                          >
                            <Check size={18} />
                            Accept Offer
                          </button>
                          <button 
                            onClick={() => handleReject(tradeIn.id)}
                            className="btn btn-error"
                            style={{ flex: 1 }}
                          >
                            <X size={18} />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {tradeIn.status === 'pending' && (
                        <button 
                          onClick={() => handleDelete(tradeIn.id)}
                          className="btn btn-secondary"
                          style={{ width: '100%' }}
                        >
                          <Trash2 size={18} />
                          Delete Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">New Trade-In Request</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Your Car Brand</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.offered_brand}
                      onChange={(e) => setFormData({...formData, offered_brand: e.target.value})}
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Car Model</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.offered_model}
                      onChange={(e) => setFormData({...formData, offered_model: e.target.value})}
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mileage (km)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.mileage}
                      onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                      placeholder="e.g., 50000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Desired Car</label>
                    <select
                      className="form-input"
                      value={formData.desired_car_id}
                      onChange={(e) => setFormData({...formData, desired_car_id: e.target.value})}
                      required
                    >
                      <option value="">Select a car</option>
                      {cars.filter(car => car.status === 'available').map(car => (
                        <option key={car.id} value={car.id}>
                          {car.brand} {car.model} ({car.year}) - ${car.price?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <ArrowLeftRight size={18} />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModal && (
          <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Accept Trade-In Offer</h2>
                <button onClick={() => setPaymentModal(null)} className="modal-close">
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Trade-In Summary
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Your car value:</span>
                      <span style={{ fontWeight: '600' }}>
                        ${paymentModal.estimated_price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Desired car price:</span>
                      <span style={{ fontWeight: '600' }}>
                        ${getCarById(paymentModal.desired_car_id)?.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: '600' }}>You need to pay:</span>
                      <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--accent)' }}>
                        ${(getCarById(paymentModal.desired_car_id)?.price - paymentModal.estimated_price)?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Payment Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    min="0"
                    step="0.01"
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Enter the amount you agree to pay to complete the trade-in
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setPaymentModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSetPayment} className="btn btn-success">
                  <Check size={18} />
                  Confirm Trade-In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
