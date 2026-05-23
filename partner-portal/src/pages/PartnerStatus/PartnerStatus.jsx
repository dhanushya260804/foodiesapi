import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './PartnerStatus.css';

const PARTNER_API = 'https://foodies-api-dm0f.onrender.com/api/delivery-partners';
const ORDER_API   = 'https://foodies-api-dm0f.onrender.com/api/orders';

const PartnerStatus = ({ token, email, onLogout }) => {
  const navigate = useNavigate();
  const [partner, setPartner]         = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [deliveries, setDeliveries]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [delivering, setDelivering]   = useState(false);
  const [tab, setTab]                 = useState('dashboard');

  // COD OTP
  const [otpInput, setOtpInput]       = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [partnerRes, deliveriesRes] = await Promise.all([
        axios.get(`${PARTNER_API}/my-status?email=${email}`, headers),
        axios.get(`${ORDER_API}/my-deliveries?partnerEmail=${email}`, headers),
      ]);
      setPartner(partnerRes.data);
      setDeliveries(deliveriesRes.data);

      if (!partnerRes.data.available && partnerRes.data.status === 'APPROVED') {
        const ordersRes = await axios.get(`${ORDER_API}/all`, headers);
        const active = ordersRes.data.find(
          o => o.deliveryPartnerId === partnerRes.data.id &&
               o.orderStatus === 'Out for Delivery'
        );
        setActiveOrder(active || null);
      } else {
        setActiveOrder(null);
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [email, token]);

  // Mark delivered (online payment orders)
  const handleMarkDelivered = async () => {
    if (!activeOrder) return;
    try {
      setDelivering(true);
      await axios.patch(
        `${ORDER_API}/delivered/${activeOrder.id}`,
        { partnerEmail: email },
        headers
      );
      toast.success('Order delivered! Earnings added.');
      setActiveOrder(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setDelivering(false);
    }
  };

  // Verify COD OTP
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 4) {
      toast.warning('Please enter the 4-digit OTP');
      return;
    }
    try {
      setVerifyingOtp(true);
      await axios.post(
        `${ORDER_API}/verify-otp/${activeOrder.id}`,
        { otp: otpInput, partnerEmail: email },
        headers
      );
      toast.success('OTP verified! Order marked as delivered. Earnings added.');
      setOtpInput('');
      setActiveOrder(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Revenue calculations
  const today   = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const todayEarnings = deliveries
    .filter(d => d.deliveredAt && new Date(d.deliveredAt).toDateString() === today)
    .reduce((sum, d) => sum + (d.deliveryEarnings || 0), 0);

  const weekEarnings = deliveries
    .filter(d => d.deliveredAt && new Date(d.deliveredAt) >= weekAgo)
    .reduce((sum, d) => sum + (d.deliveryEarnings || 0), 0);

  const totalEarnings = deliveries.reduce((sum, d) => sum + (d.deliveryEarnings || 0), 0);
  const todayCount    = deliveries.filter(d => d.deliveredAt && new Date(d.deliveredAt).toDateString() === today).length;

  if (loading) {
    return (
      <div className="ps-page">
        <div className="ps-loading">
          <div className="ps-loading-icon">🛵</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isCodOrder = activeOrder?.paymentMethod === 'cod';

  return (
    <div className="ps-page">
      <div className="ps-container">

        {/* Header */}
        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-logo">🛵 Foodies</div>
            <div className="ps-welcome">Welcome, {partner?.name}!</div>
          </div>
          <button className="ps-logout" onClick={onLogout}>Logout</button>
        </div>

        {/* Status Card */}
        <div className="ps-status-card">
          <div className="ps-status-left">
            <div className="ps-avatar">{partner?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="ps-name">{partner?.name}</div>
              <div className="ps-email">{partner?.email}</div>
              <div className="ps-phone">{partner?.phoneNumber}</div>
            </div>
          </div>
          <div className="ps-status-right">
            <div className={`ps-availability ${partner?.available ? 'available' : 'busy'}`}>
              {partner?.available ? '🟢 Available' : '🔴 On Delivery'}
            </div>
            <div className="ps-rating">⭐ {partner?.rating > 0 ? partner.rating : 'No rating'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ps-tabs">
          <button className={`ps-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            📦 Dashboard
          </button>
          <button className={`ps-tab ${tab === 'earnings' ? 'active' : ''}`} onClick={() => setTab('earnings')}>
            💰 Earnings
          </button>
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <>
            {/* Active Delivery */}
            {activeOrder && (
              <div className="ps-active-card">
                <h3 className="ps-section-title">
                  🚚 Active Delivery
                  {isCodOrder && <span className="ps-cod-badge">💵 COD</span>}
                </h3>

                <div className="ps-order-details">
                  <div className="ps-order-row">
                    <span>Order ID</span>
                    <strong>#{activeOrder.id.slice(-6).toUpperCase()}</strong>
                  </div>
                  <div className="ps-order-row">
                    <span>Order Value</span>
                    <strong>₹{activeOrder.amount?.toFixed(2)}</strong>
                  </div>
                  {isCodOrder && (
                    <div className="ps-order-row">
                      <span>Collect from customer</span>
                      <strong className="ps-cod-amount">₹{activeOrder.amount?.toFixed(2)} cash</strong>
                    </div>
                  )}
                  <div className="ps-order-row">
                    <span>Your Earnings</span>
                    <strong className="ps-earn-preview">
                      ₹{(30 + 0.08 * activeOrder.amount + (isCodOrder ? 15 : 0)).toFixed(2)}
                      {isCodOrder && <span className="ps-cod-bonus"> (+₹15 COD bonus)</span>}
                    </strong>
                  </div>
                  <div className="ps-order-row">
                    <span>Deliver To</span>
                    <strong>{activeOrder.userAddress}</strong>
                  </div>
                  <div className="ps-order-row">
                    <span>Customer Phone</span>
                    <strong>{activeOrder.phoneNumber}</strong>
                  </div>
                </div>

                {/* COD OTP Verification */}
                {isCodOrder ? (
                  <div className="ps-otp-section">
                    <div className="ps-otp-info">
                      Ask the customer for their 4-digit OTP after collecting
                      <strong> ₹{activeOrder.amount?.toFixed(2)}</strong> in cash
                    </div>
                    <div className="ps-otp-input-row">
                      <input
                        type="number"
                        className="ps-otp-input"
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        maxLength={4}
                        onChange={e => setOtpInput(e.target.value.slice(0, 4))}
                      />
                      <button
                        className="ps-otp-btn"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpInput.length !== 4}
                      >
                        {verifyingOtp ? 'Verifying...' : '✓ Verify & Deliver'}
                      </button>
                    </div>
                    {activeOrder.otpAttempts > 0 && (
                      <div className="ps-otp-attempts">
                        ⚠️ {3 - activeOrder.otpAttempts} attempt(s) remaining
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="ps-deliver-btn"
                    onClick={handleMarkDelivered}
                    disabled={delivering}
                  >
                    {delivering ? 'Updating...' : '✅ Mark as Delivered'}
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="ps-actions">
              {partner?.available && (
                <button className="ps-pickup-btn" onClick={() => navigate('/available-orders')}>
                  🛵 View Available Orders
                </button>
              )}
              {!partner?.available && !activeOrder && (
                <div className="ps-info-box">Complete your active delivery to get new orders.</div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="ps-stats">
              <div className="ps-stat">
                <div className="ps-stat-value">₹{todayEarnings.toFixed(0)}</div>
                <div className="ps-stat-label">Today</div>
              </div>
              <div className="ps-stat">
                <div className="ps-stat-value">{todayCount}</div>
                <div className="ps-stat-label">Deliveries Today</div>
              </div>
              <div className="ps-stat">
                <div className="ps-stat-value">₹{totalEarnings.toFixed(0)}</div>
                <div className="ps-stat-label">All Time</div>
              </div>
            </div>
          </>
        )}

        {/* Earnings Tab */}
        {tab === 'earnings' && (
          <div className="ps-earnings">
            <div className="ps-earn-cards">
              <div className="ps-earn-card">
                <div className="ps-earn-icon">📅</div>
                <div className="ps-earn-amount">₹{todayEarnings.toFixed(2)}</div>
                <div className="ps-earn-label">Today's Earnings</div>
                <div className="ps-earn-sub">{todayCount} deliveries</div>
              </div>
              <div className="ps-earn-card">
                <div className="ps-earn-icon">📆</div>
                <div className="ps-earn-amount">₹{weekEarnings.toFixed(2)}</div>
                <div className="ps-earn-label">This Week</div>
                <div className="ps-earn-sub">
                  {deliveries.filter(d => d.deliveredAt && new Date(d.deliveredAt) >= weekAgo).length} deliveries
                </div>
              </div>
              <div className="ps-earn-card ps-earn-card-total">
                <div className="ps-earn-icon">💰</div>
                <div className="ps-earn-amount">₹{totalEarnings.toFixed(2)}</div>
                <div className="ps-earn-label">All Time</div>
                <div className="ps-earn-sub">{deliveries.length} deliveries</div>
              </div>
            </div>

            <div className="ps-earn-info">
              💡 Online: <strong>₹30 + 8% of order</strong> &nbsp;|&nbsp;
              COD: <strong>₹30 + 8% + ₹15 bonus</strong>
            </div>

            <h3 className="ps-section-title" style={{ marginTop: 20 }}>Delivery History</h3>
            {deliveries.length === 0 ? (
              <div className="ps-empty">
                <div style={{ fontSize: '2.5rem' }}>📦</div>
                <p>No deliveries yet. Start delivering to earn!</p>
              </div>
            ) : (
              <div className="ps-history">
                {[...deliveries].reverse().map((d, i) => (
                  <div key={i} className="ps-history-item">
                    <div className="ps-history-left">
                      <div className="ps-history-id">
                        #{d.id.slice(-6).toUpperCase()}
                        {d.paymentMethod === 'cod' && (
                          <span className="ps-cod-tag">COD</span>
                        )}
                      </div>
                      <div className="ps-history-date">
                        {d.deliveredAt
                          ? new Date(d.deliveredAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </div>
                      <div className="ps-history-order">Order: ₹{d.amount?.toFixed(2)}</div>
                    </div>
                    <div className="ps-history-earn">
                      +₹{d.deliveryEarnings?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerStatus;
