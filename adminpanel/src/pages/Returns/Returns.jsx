import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = 'https://foodies-api-dm0f.onrender.com/api/returns';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const STATUS_COLORS = {
  PENDING:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  APPROVED: { bg: '#f0faf5', color: '#2d6a4f', border: '#b7dfc9' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const Returns = () => {
  const [returns, setReturns]   = useState([]);
  const [filter, setFilter]     = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [reason, setReason]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/status/${filter}`, getHeaders());
      setReturns(res.data);
    } catch { toast.error('Failed to load returns'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); setSelected(null); }, [filter]);

  const handleApprove = async () => {
    if (!reason.trim()) { toast.warning('Please provide a reason/note'); return; }
    try {
      setActing(true);
      await axios.patch(`${API}/approve/${selected.id}`, { reason }, getHeaders());
      toast.success('Return approved & refund initiated');
      setSelected(null); setReason(''); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.warning('Please provide rejection reason'); return; }
    try {
      setActing(true);
      await axios.patch(`${API}/reject/${selected.id}`, { reason }, getHeaders());
      toast.success('Return rejected');
      setSelected(null); setReason(''); fetch();
    } catch { toast.error('Failed'); }
    finally { setActing(false); }
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="mb-0 fw-bold">Return Requests</h3>
          <small className="text-muted">Review and process customer return requests</small>
        </div>
      </div>

      {/* Filter */}
      <div className="btn-group mb-4">
        {['PENDING','APPROVED','REJECTED'].map(f => (
          <button key={f} type="button"
            className={`btn ${filter === f ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {/* List */}
        <div className={selected ? 'col-lg-5' : 'col-12'}>
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-dark" /></div>
          ) : returns.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🔄</div>
              <p>No {filter.toLowerCase()} return requests</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {returns.map(r => {
                const sc = STATUS_COLORS[r.status];
                return (
                  <div key={r.id} className="card border-0 shadow-sm"
                    style={{ cursor: 'pointer', border: selected?.id === r.id ? '2px solid #212529' : '2px solid transparent' }}
                    onClick={() => { setSelected(r); setReason(''); }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">Order #{r.orderId?.slice(-6).toUpperCase()}</div>
                          <div className="text-muted small">{r.reason}</div>
                          <div className="text-muted small">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                            &nbsp;·&nbsp; Refund: {r.refundMethod}
                            &nbsp;·&nbsp; ₹{r.refundAmount?.toFixed(2)}
                          </div>
                          {r.reorderRequested && <span className="badge bg-info mt-1">Re-order requested</span>}
                        </div>
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white d-flex justify-content-between py-3">
                <h5 className="mb-0">Return #{selected.id.slice(-6).toUpperCase()}</h5>
                <button className="btn btn-sm btn-outline-light" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="card-body">

                {/* Details */}
                <div className="row g-2 mb-4">
                  {[
                    { label: 'Order ID',      value: selected.orderId },
                    { label: 'Reason',        value: selected.reason },
                    { label: 'Refund Method', value: selected.refundMethod },
                    { label: 'Refund Amount', value: `₹${selected.refundAmount?.toFixed(2)}` },
                    { label: 'Re-order',      value: selected.reorderRequested ? 'Yes' : 'No' },
                    { label: 'Requested At',  value: selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN') : '—' },
                  ].map(({ label, value }) => (
                    <div className="col-6" key={label}>
                      <div className="bg-light rounded p-2">
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{label}</div>
                        <div className="fw-semibold small">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Photo proof */}
                <h6 className="fw-bold mb-2">📷 Photo Proof</h6>
                {selected.photoUrl ? (
                  <div className="mb-4">
                    <img src={selected.photoUrl} alt="proof"
                      className="rounded w-100"
                      style={{ maxHeight: 220, objectFit: 'cover' }} />
                    <a href={selected.photoUrl} target="_blank" rel="noreferrer"
                      className="d-block text-center small mt-1">View full image ↗</a>
                  </div>
                ) : <p className="text-muted small mb-4">No photo</p>}

                {/* Admin reason if already actioned */}
                {selected.adminReason && (
                  <div className={`alert alert-${selected.status === 'APPROVED' ? 'success' : 'danger'} py-2 small mb-4`}>
                    <strong>Admin note:</strong> {selected.adminReason}
                  </div>
                )}

                {/* Actions for PENDING */}
                {selected.status === 'PENDING' && (
                  <>
                    <h6 className="fw-bold mb-2">Take Action</h6>
                    <textarea className="form-control mb-3" rows={3}
                      placeholder="Add a note or reason (required)..."
                      value={reason} onChange={e => setReason(e.target.value)} />
                    <div className="d-flex gap-3">
                      <button className="btn btn-success flex-grow-1" onClick={handleApprove} disabled={acting}>
                        {acting ? <span className="spinner-border spinner-border-sm" /> : '✓ Approve & Refund'}
                      </button>
                      <button className="btn btn-danger flex-grow-1" onClick={handleReject} disabled={acting}>
                        {acting ? <span className="spinner-border spinner-border-sm" /> : '✕ Reject'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;
