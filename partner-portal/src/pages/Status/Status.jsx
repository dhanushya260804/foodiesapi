import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Status.css';

const PARTNER_API = 'http://localhost:8080/api/delivery-partners';
const ORDER_API   = 'http://localhost:8080/api/orders';

const STATUS_CONFIG = {
  PENDING: {
    icon: '⏳', className: 'status-pending',
    title: 'Application Under Review',
    message: 'Your application is being reviewed by our team. This usually takes 1-2 business days.',
  },
  APPROVED: {
    icon: '✅', className: 'status-approved',
    title: 'Application Approved!',
    message: 'Congratulations! You are now an active delivery partner.',
  },
  REJECTED: {
    icon: '❌', className: 'status-rejected',
    title: 'Application Rejected',
    message: 'Unfortunately your application was not approved this time.',
  },
};

const Status = ({ token, email, onLogout }) => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(false);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${PARTNER_API}/my-status?email=${email}`, headers);
      setPartner(res.data);

      // If on delivery, fetch all orders and find the active one
      if (!res.data.available && res.data.status === 'APPROVED') {
        const ordersRes = await axios.get(`${ORDER_API}/all`, headers);
        const active = ordersRes.data.find(
          o => o.deliveryPartnerId === res.data.id &&
               o.orderStatus === 'Out for Delivery'
        );
        setActiveOrder(active || null);
      } else {
        setActiveOrder(null);
      }
    } catch {
      toast.error('Failed to load your status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, [email, token]);

  const handleMarkDelivered = async () => {
    if (!activeOrder) return;
    try {
      setDelivering(true);
      await axios.patch(
        `${ORDER_API}/delivered/${activeOrder.id}`,
        { partnerEmail: email },
        headers
      );
      toast.success('Order marked as delivered! You are now available again.');
      setActiveOrder(null);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setDelivering(false);
    }
  };

  if (loading) {
    return (
      <div className="status-page">
        <div className="loading-box">
          <div className="loading-icon">🛵</div>
          <p>Loading your status...</p>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const config = STATUS_CONFIG[partner.status] || STATUS_CONFIG.PENDING;
  const attemptsLeft = 3 - partner.applicationCount;

  return (
    <div className="status-page">
      <div className="status-card">

        <div className="status-header">
          <div className="status-logo">🛵 Foodies</div>
          <h2 className="status-title">My Dashboard</h2>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>

        {/* Status Banner */}
        <div className={`status-banner ${config.className}`}>
          <div className="status-icon">{config.icon}</div>
          <div className="status-content">
            <div className="status-banner-title">{config.title}</div>
            <div className="status-banner-msg">{config.message}</div>
            {partner.status === 'REJECTED' && partner.rejectionReason && (
              <div className="rejection-reason">
                <strong>Reason:</strong> {partner.rejectionReason}
              </div>
            )}
          </div>
        </div>

        <div className="status-body">

          {/* Active Delivery Card */}
          {partner.status === 'APPROVED' && activeOrder && (
            <div className="active-delivery-card">
              <div className="active-delivery-title">🚚 Active Delivery</div>
              <div className="active-delivery-info">
                <div className="active-delivery-row">
                  <span>Order ID</span>
                  <strong>#{activeOrder.id.slice(-6).toUpperCase()}</strong>
                </div>
                <div className="active-delivery-row">
                  <span>Amount</span>
                  <strong>₹{activeOrder.amount?.toFixed(2)}</strong>
                </div>
                <div className="active-delivery-row">
                  <span>Deliver To</span>
                  <strong>{activeOrder.userAddress}</strong>
                </div>
                <div className="active-delivery-row">
                  <span>Customer Phone</span>
                  <strong>{activeOrder.phoneNumber}</strong>
                </div>
                <div className="active-delivery-row">
                  <span>Status</span>
                  <strong className="text-available">{activeOrder.orderStatus}</strong>
                </div>
              </div>
              <button
                className="mark-delivered-btn"
                onClick={handleMarkDelivered}
                disabled={delivering}
              >
                {delivering ? 'Updating...' : '✅ Mark as Delivered'}
              </button>
            </div>
          )}

          {/* Action buttons for approved partners */}
          {partner.status === 'APPROVED' && !activeOrder && (
            <button className="start-delivering-btn" onClick={() => navigate('/available-orders')}>
              🛵 View Available Orders
            </button>
          )}

          {/* Partner Details */}
          <h3 className="section-title">Your Details</h3>
          <div className="details-grid">
            <Detail label="Name"        value={partner.name} />
            <Detail label="Email"       value={partner.email} />
            <Detail label="Phone"       value={partner.phoneNumber} />
            <Detail label="Vehicle No." value={partner.vehicleNumber} />
            <Detail label="License No." value={partner.licenseNumber} />
            <Detail label="Applied On"  value={partner.appliedAt
              ? new Date(partner.appliedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '—'} />
          </div>

          {/* Documents */}
          <h3 className="section-title" style={{ marginTop: 24 }}>Submitted Documents</h3>
          <div className="docs-grid">
            <DocCard label="Photo"           url={partner.photoUrl} />
            <DocCard label="ID Proof"        url={partner.idProofUrl} />
            <DocCard label="Driving License" url={partner.licenseUrl} />
          </div>

          {/* Attempts */}
          <div className="attempts-box">
            <span>📋 Application attempts used: </span>
            <strong>{partner.applicationCount} / 3</strong>
            {partner.status === 'REJECTED' && attemptsLeft > 0 && (
              <span className="attempts-left"> — You can reapply {attemptsLeft} more time{attemptsLeft > 1 ? 's' : ''}</span>
            )}
            {partner.status === 'REJECTED' && attemptsLeft === 0 && (
              <span className="attempts-none"> — Maximum attempts reached</span>
            )}
          </div>

          {partner.status === 'REJECTED' && attemptsLeft > 0 && (
            <a href="/apply" className="reapply-btn">Reapply Now →</a>
          )}

          {partner.status === 'APPROVED' && (
            <div className="approved-box">
              <div className="approved-row">
                <span>⭐ Rating</span>
                <strong>{partner.rating > 0 ? partner.rating : 'Not rated yet'}</strong>
              </div>
              <div className="approved-row">
                <span>🟢 Status</span>
                <strong className={partner.available ? 'text-available' : 'text-unavailable'}>
                  {partner.available ? 'Available' : 'On Delivery'}
                </strong>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="detail-item">
    <div className="detail-label">{label}</div>
    <div className="detail-value">{value || '—'}</div>
  </div>
);

const DocCard = ({ label, url }) => (
  <div className="doc-card">
    <div className="doc-label">{label}</div>
    {url
      ? <a href={url} target="_blank" rel="noreferrer" className="doc-link">View Document ↗</a>
      : <span className="doc-empty">Not uploaded</span>
    }
  </div>
);

export default Status;