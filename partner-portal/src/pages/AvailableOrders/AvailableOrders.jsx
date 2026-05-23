import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './AvailableOrders.css';

const API = 'https://foodies-api-dm0f.onrender.com/api';

const AvailableOrders = ({ token, email, onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch {
      toast.error('Failed to load available orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePickup = async (orderId) => {
    try {
      setPickingUp(orderId);
      await axios.patch(
        `${API}/orders/pickup/${orderId}`,
        { partnerEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order picked up! Customer has been notified.');
      // Remove picked order from list
      setOrders(prev => prev.filter(o => o.id !== orderId));
      // Redirect to status after pickup
      setTimeout(() => navigate('/partner-status'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pick up order');
    } finally {
      setPickingUp(null);
    }
  };

  return (
    <div className="ao-page">
      <div className="ao-container">

        {/* Header */}
        <div className="ao-header">
          <div className="ao-header-left">
            <div className="ao-logo">🛵 Foodies</div>
            <h2 className="ao-title">Available Orders</h2>
          </div>
          <div className="ao-header-right">
            <button className="ao-refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
            <button className="ao-logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>

        {/* Nav */}
        <div className="ao-nav">
          <span className="ao-nav-link" onClick={() => navigate('/status')}>
            ← Back to Status
          </span>
          <span className="ao-badge">{orders.length} order{orders.length !== 1 ? 's' : ''} available</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ao-loading">
            <div className="ao-loading-icon">🛵</div>
            <p>Loading available orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="ao-empty">
            <div className="ao-empty-icon">📦</div>
            <h3>No orders available right now</h3>
            <p>Check back soon — new orders appear automatically every 15 seconds</p>
          </div>
        ) : (
          <div className="ao-list">
            {orders.map(order => (
              <div key={order.id} className="ao-card">

                {/* Order Header */}
                <div className="ao-card-header">
                  <div className="ao-order-id">Order #{order.id.slice(-6).toUpperCase()}</div>
                  <div className="ao-amount">₹{order.amount.toFixed(2)}</div>
                </div>

                {/* Items */}
                <div className="ao-section-title">Items</div>
                <div className="ao-items">
                  {order.orderedItems.map((item, idx) => (
                    <div key={idx} className="ao-item">
                      <span className="ao-item-name">{item.name}</span>
                      <span className="ao-item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="ao-section-title">Deliver To</div>
                <div className="ao-address">
                  <span>📍</span>
                  <span>{order.userAddress}</span>
                </div>

                {/* Customer Contact */}
                <div className="ao-contact">
                  <span>📞 {order.phoneNumber}</span>
                </div>

                {/* Order Time */}
                <div className="ao-time">
                  🕐 Ordered at {order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '—'}
                </div>

                {/* Pickup Button */}
                <button
                  className="ao-pickup-btn"
                  onClick={() => handlePickup(order.id)}
                  disabled={pickingUp === order.id}
                >
                  {pickingUp === order.id
                    ? 'Picking up...'
                    : '🛵 Pick Up This Order'}
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrders;
