import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API = 'https://foodies-api-whrh.onrender.com/api/delivery-partners';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: ''});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if(!form.email.trim() || !form.password.trim()) {
            toast.warning('Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${API}/login`, form);
            onLogin(res.data.token, form.email);
            toast.success('Logged in successfully');
            navigate('/status');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-header">
                    <div className="login-logo">🛵Foodies</div>
                    <h2 className="login-title">Partner Login</h2>
                    <p className="login-subtitle">CHeck your application status</p>
                </div>

                <div className="login-body">
                    <div className="field-group">
                        <label className="field-label">Email Address</label>
                        <input 
                        className="field-input"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ravi@email.com"
                        />
                      </div>

                    <div className="field-group">
                        <label className="field-label">Password</label>
                        <input 
                        className="field-input"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Your password"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                      </div>

                      <button
                      style={{ color: 'white' }}
                      className="login-btn"
                      onClick={handleSubmit}
                      disabled={loading}
                      >
                        {loading ? 'Logged in...' : 'Login'}
                      </button>
                </div>

                <div className="login-footer">
                    New here?{' '}
                    <span className="link" onClick={() => navigate('/apply')}>
                        Apply as a Partner
                    </span>
                </div>

            </div>
        </div>
    );
};

export default Login;
