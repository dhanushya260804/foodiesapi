import React from "react"; 
import { useNavigate } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="ph-page">
            <div className="ph-container">

                <div className="ph-header">
                    <div className="ph-logo">🛵</div>
                    <h1 className="ph-title">Foodies Partner Portal</h1>
                    <p className="ph-subtitle">Your gateway to delivering happiness</p>
                </div>

                <div className="ph-cards">

                    {/* New Applicant */}
                    <div className="ph-card ph-card-applicant">
                        <div className="ph-card-icon">📋</div>
                        <h2 className="ph-card-title">New Applicant</h2>
                        <p className="ph-card-desc">
                            Want to join our delivery fleet? Apply now and track your applications status.
                        </p>
                        <div className="ph-card-actions">
                            <button className="ph-btn ph-btn-primary" onClick={() => navigate('/apply')}>
                                APPLY NOW
                            </button>
                            <button className="ph-btn ph-btn-outline" onClick={() => navigate('/applicant-login')}>
                                TRACK APPLICATION
                            </button>
                        </div>
                    </div>

                    {/* Active Partner */}
                    <div className="ph-card ph-card-partner">
                        <div className="ph-card-icon">🛵</div>
                        <h2 className="ph-card-title">Active Partner</h2>
                        <p className="ph-card-desc">
                            Already approved? Login to see available orders and start delivering.
                        </p>
                        <div className="ph-card-actions">
                            <button className="ph-btn ph-btn-green" onClick={() => navigate('/partner-login')}>
                                PARTNER LOGIN
                            </button>
                        </div>
                    </div>

                </div>

                <div className="ph-footer">© 2026 Foodies · Partner Portal</div>
            
            </div>
        </div>
    );
};

export default Home;