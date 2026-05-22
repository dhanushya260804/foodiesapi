import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './PartnerLogin.css';

const API = 'http://localhost:8080/api/delivery-partners';

const PartnerLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.warning('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/login`, form);

      // Check if partner is approved
      const statusRes = await axios.get(`${API}/my-status?email=${form.email}`, {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });

      if (statusRes.data.status !== 'APPROVED') {
        toast.error('Only approved partners can access this portal. Please use the Applicant login instead.');
        return;
      }

      onLogin(res.data.token, form.email);
      toast.success('Welcome back!');
      navigate('/partner-status');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-page">
      <div className="pl-card">

        <div className="pl-header">
          <div className="pl-logo">🛵 Foodies</div>
          <h2 className="pl-title">Active Partner Login</h2>
          <p className="pl-subtitle">For approved delivery partners only</p>
        </div>

        <div className="pl-body">
          <div className="pl-field">
            <label className="pl-label">Email Address</label>
            <input
              className="pl-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="pl-field">
            <label className="pl-label">Password</label>
            <input
              className="pl-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className="pl-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="pl-footer">
          Not approved yet?{' '}
          <span className="pl-link" onClick={() => navigate('/applicant-login')}>
            Track your application
          </span>
        </div>

        <div className="pl-back">
          <span className="pl-link" onClick={() => navigate('/')}>← Back to Home</span>
        </div>

      </div>
    </div>
  );
};

export default PartnerLogin;