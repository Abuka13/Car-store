import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { Header } from '../components/Header';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getMy();
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="page-title">My Orders</h1>
          <p className="page-description">
            Your purchase history
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={64} className="empty-icon" />
            <h2 className="empty-title">No orders yet</h2>
            <p className="empty-description">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Car</th>
                  <th>Total Price</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Package size={18} color="var(--text-secondary)" />
                        #{order.id}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {order.car_brand} {order.car_model}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {order.car_year}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        ${order.total_price?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        order.source === 'auction' ? 'badge-info' : 'badge-success'
                      }`}>
                        {order.source}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
