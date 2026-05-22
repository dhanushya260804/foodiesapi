import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = 'http://localhost:8080/api/delivery-partners';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED'];

const STATUS_COLORS = {
  PENDING:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  APPROVED: { bg: '#f0faf5', color: '#2d6a4f', border: '#b7dfc9' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/status/${filter}`, getAuthHeaders());
      setApplications(res.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await axios.patch(`${API}/approve/${id}`, {}, getAuthHeaders());
      toast.success('Partner approved successfully');
      setSelected(null);
      fetchApplications();
    } catch {
      toast.error('Failed to approve partner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }
    try {
      setActionLoading(true);
      await axios.patch(`${API}/reject/${id}`, { reason: rejectReason }, getAuthHeaders());
      toast.success('Application rejected');
      setSelected(null);
      setRejectReason('');
      fetchApplications();
    } catch {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="mb-0 fw-bold">Partner Applications</h3>
          <small className="text-muted">Review and manage delivery partner applications</small>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="btn-group mb-4" role="group">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            className={`btn ${filter === f ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => { setFilter(f); setSelected(null); }}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="row g-4">

        {/* Applications List */}
        <div className={selected ? 'col-lg-5' : 'col-12'}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-dark" />
              <p className="mt-2 text-muted">Loading...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>📋</div>
              <p className="mt-2">No {filter.toLowerCase()} applications</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {applications.map(app => {
                const sc = STATUS_COLORS[app.status];
                const isSelected = selected?.id === app.id;
                return (
                  <div
                    key={app.id}
                    className="card border-0 shadow-sm"
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #212529' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => { setSelected(app); setRejectReason(''); }}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 44, height: 44, background: '#212529', fontSize: '1rem', flexShrink: 0 }}
                          >
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{app.name}</div>
                            <div className="text-muted small">{app.email}</div>
                            <div className="text-muted small">{app.phoneNumber}</div>
                          </div>
                        </div>
                        <div className="text-end">
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                          >
                            {app.status}
                          </span>
                          <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                            Attempt {app.applicationCount}/3
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between py-3">
                <h5 className="mb-0">{selected.name}</h5>
                <button className="btn btn-sm btn-outline-light" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="card-body">

                {/* Details Grid */}
                <h6 className="fw-bold mb-3">Applicant Details</h6>
                <div className="row g-2 mb-4">
                  {[
                    { label: 'Email',      value: selected.email },
                    { label: 'Phone',      value: selected.phoneNumber },
                    { label: 'Vehicle No.',value: selected.vehicleNumber },
                    { label: 'License No.',value: selected.licenseNumber },
                    { label: 'Applied On', value: selected.appliedAt
                        ? new Date(selected.appliedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—' },
                    { label: 'Attempts',   value: `${selected.applicationCount} / 3` },
                  ].map(({ label, value }) => (
                    <div className="col-6" key={label}>
                      <div className="bg-light rounded p-2">
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{label}</div>
                        <div className="fw-semibold small">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <h6 className="fw-bold mb-3">Submitted Documents</h6>
                <div className="row g-2 mb-4">
                  {[
                    { label: '📷 Photo',           url: selected.photoUrl },
                    { label: '🪪 ID Proof',         url: selected.idProofUrl },
                    { label: '📄 Driving License',  url: selected.licenseUrl },
                  ].map(({ label, url }) => (
                    <div className="col-4" key={label}>
                      <div className="border rounded p-2 text-center" style={{ background: '#f8f9fa' }}>
                        <div className="small fw-semibold mb-1">{label}</div>
                        {url ? (
                          <>
                            <img
                              src={url}
                              alt={label}
                              className="rounded mb-1"
                              style={{ width: '100%', height: 72, objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                            <a href={url} target="_blank" rel="noreferrer"
                              className="d-block text-dark small" style={{ fontSize: '0.75rem' }}>
                              View ↗
                            </a>
                          </>
                        ) : (
                          <span className="text-muted small">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rejection reason if rejected */}
                {selected.status === 'REJECTED' && selected.rejectionReason && (
                  <div className="alert alert-danger py-2 small mb-4">
                    <strong>Rejection reason:</strong> {selected.rejectionReason}
                  </div>
                )}

                {/* Actions — only for PENDING */}
                {selected.status === 'PENDING' && (
                  <>
                    <h6 className="fw-bold mb-3">Take Action</h6>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Rejection Reason <span className="text-muted">(required if rejecting)</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="e.g. Documents are not clear, License is expired..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-3">
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={() => handleApprove(selected.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? <span className="spinner-border spinner-border-sm" />
                          : '✓ Approve Partner'}
                      </button>
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => handleReject(selected.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? <span className="spinner-border spinner-border-sm" />
                          : '✕ Reject Application'}
                      </button>
                    </div>
                  </>
                )}

                {selected.status === 'APPROVED' && (
                  <div className="alert alert-success py-2 text-center">
                    ✅ This partner has been approved and is active
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;