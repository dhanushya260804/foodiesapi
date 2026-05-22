import React, { useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import './ApplicantLogin.css';

const API = 'http://localhost:8080/api/delivery-partners';

const ApplicantLogin = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: ''});
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
            const response = await axios.post(`${API}/login`, form);
            onLogin(response.data.token, form.email);
            toast.success('Logged in successfully');
            navigate('/applicant-status');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="al-page">
            <div className="al-card">

                <div className="al-header">
                    <div className="al-logo">🛵 Foodies</div>
                    <h2 className="al-title">Track Application</h2>
                    <p className="al-subtitle">Check you application status</p>
                </div>

                <div className="al-body">
                    <div className="al-field">
                        <label className="al-label">Email Address</label>
                        <input 
                        className="al-input"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        />
                    </div>

                    <div className="al-field">
                        <label className="al-label">Password</label>
                        <input
                        className="al-input"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Your Password"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    <button className="al-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Logged in...' : 'Check Status'}
                    </button>
                </div>

                <div className="al-footer">
                    New Applicant?{' '}
                    <span className="al-link" onClick={() => navigate('/apply')}>Apply here</span>
                </div>
            
            <div className="al-back">
                <span className="al-link" onClick={() => navigate('/')}>← Back to Home</span>
            </div>
            
            </div>
        </div>
    );
};

export default ApplicantLogin;