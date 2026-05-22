import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:8080/api/delivery-partners';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const StarRating = ({ value }) => (
  <div className="d-flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} style={{
        fontSize: '1.4rem',
        color: star <= value ? '#f59e0b' : '#d1d5db',
        userSelect: 'none',
      }}>★</span>
    ))}
  </div>
);

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAvailable, setFilterAvailable] = useState('all');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const endpoint = filterAvailable === 'available'
        ? `${API_BASE}/available`
        : API_BASE;
      const res = await axios.get(endpoint, getAuthHeaders());
      setPartners(res.data);
    } catch {
      toast.error('Failed to load delivery partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, [filterAvailable]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from delivery partners?`)) return;
    try {
      await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
      toast.success(`${name} removed`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete partner');
    }
  };

  const availableCount = partners.filter((p) => p.available).length;

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="mb-0 fw-bold">Delivery Partners</h3>
          <small className="text-muted">
            Partners join via the Partner Portal and appear here after approval
          </small>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success fs-6 px-3 py-2">{availableCount} Available</span>
          <span className="badge bg-secondary fs-6 px-3 py-2">{partners.length} Total</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-info-circle-fill"></i>
        <span>
          New delivery partners join via the <strong>Partner Portal</strong> and appear here after admin approval in the <strong>Applications</strong> tab.
        </span>
      </div>

      {/* Partners List */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0">All Partners</h5>
          <div className="btn-group btn-group-sm">
            {['all', 'available'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn ${filterAvailable === opt ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setFilterAvailable(opt)}
              >
                {opt === 'all' ? 'All' : 'Available Only'}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-dark" />
              <p className="mt-2 text-muted">Loading partners...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🛵</div>
              <p className="mt-2">No delivery partners found</p>
              <small>Approve applications from the Applications tab to add partners</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Partner</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: 38, height: 38, fontSize: '0.9rem', flexShrink: 0 }}
                          >
                            {partner.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold">{partner.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{partner.phoneNumber}</td>
                      <td className="text-muted">{partner.email}</td>
                      <td><StarRating value={Math.round(partner.rating)} /></td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${
                          partner.available ? 'bg-success' : 'bg-warning text-dark'
                        }`}>
                          {partner.available ? 'Available' : 'On Delivery'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(partner.id, partner.name)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartners;