import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../config';

const REASONS = ['Wrong order', 'Spoiled food', 'Missing items'];

const ReturnModal = ({ order, token, onClose, onSuccess }) => {
  const [reason, setReason]           = useState('');
  const [photo, setPhoto]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [reorder, setReorder]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [timeLeft, setTimeLeft]       = useState(null);

  useEffect(() => {
    if (!order.deliveredAt) return;
    const deliveredAtStr = order.deliveredAt.endsWith('Z') ? order.deliveredAt : order.deliveredAt + 'Z';
    const delivered = new Date(deliveredAtStr);
    const expiry    = new Date(delivered.getTime() + 15 * 60 * 1000);

    const tick = () => {
      const remaining = Math.max(0, expiry - new Date());
      setTimeLeft(remaining);
      if (remaining === 0) onClose();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order.deliveredAt]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!reason)  { toast.warning('Please select a reason'); return; }
    if (!photo)   { toast.warning('Photo proof is required'); return; }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('orderId', order.id);
      formData.append('reason', reason);
      formData.append('photo', photo);
      formData.append('reorder', reorder.toString());

      await axios.post(`${BASE_URL}/api/returns/raise`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Return request submitted! Admin will review shortly.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header" style={{ background: '#fef2f2' }}>
            <div>
              <h5 className="modal-title fw-bold">🔄 Return Request</h5>
              <small className="text-muted">Order #{order.id.slice(-6).toUpperCase()}</small>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {timeLeft !== null && (
              <div className={`alert py-2 text-center mb-3 ${timeLeft < 60000 ? 'alert-danger' : 'alert-warning'}`}>
                ⏱️ Return window closes in <strong>{formatTime(timeLeft)}</strong>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold">Reason for Return</label>
              {REASONS.map(r => (
                <div key={r} className="form-check">
                  <input className="form-check-input" type="radio" name="reason"
                    id={r} value={r} checked={reason === r}
                    onChange={() => setReason(r)} />
                  <label className="form-check-label" htmlFor={r}>{r}</label>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Photo Proof <span className="text-danger">*</span></label>
              {preview && (
                <img src={preview} alt="proof"
                  className="d-block rounded mb-2"
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
              )}
              <input type="file" className="form-control" accept="image/*" onChange={handlePhoto} />
              <small className="text-muted">Take a clear photo of the issue</small>
            </div>

            <div className="alert alert-info py-2 small mb-3">
    <strong>Refund method: </strong>
    💰 Store wallet credit (usable on next order)
</div>

            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="reorder"
                checked={reorder} onChange={e => setReorder(e.target.checked)} />
              <label className="form-check-label" htmlFor="reorder">
                <strong>Re-order instead of refund</strong>
                <div className="text-muted small">
                  Get the same items redelivered at food cost only (no shipping/tax/COD charges)
                </div>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;