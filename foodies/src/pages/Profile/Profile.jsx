import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../../config";
import './Profile.css';

const Profile = () => {
    const { token } = useContext(StoreContext);
    const [data, setData] = useState({ name: '', email: '', phoneNumber: '', address: '', walletBalance: 0 });
    const [isEditing, setIsEditing] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
            setData(res.data);
        } catch { console.log('Error fetching profile'); }
    };

    const onChangeHandler = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/api/users/profile`, data, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch { toast.error('Error updating profile.'); }
    };

    useEffect(() => { if (token) fetchProfile(); }, [token]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">

                    {/* Wallet Card */}
                    <div className="card shadow mb-3 border-0"
                        style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', color: 'white' }}>
                        <div className="card-body d-flex align-items-center justify-content-between py-3 px-4">
                            <div>
                                <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>💰 Store Wallet</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                    ₹{(data.walletBalance || 0).toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                    Available for your next order
                                </div>
                            </div>
                            <div style={{ fontSize: '3rem', opacity: 0.3 }}>🏦</div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="card shadow p-4">
                        <div className="text-center mb-4">
                            <div className="profile-avatar">
                                <i className="bi bi-person-fill"></i>
                            </div>
                            <h4 className="mt-3">{data.name}</h4>
                            <p className="text-muted">{data.email}</p>
                        </div>
                        <form onSubmit={onSubmitHandler}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Full Name</label>
                                <input type="text" className="form-control" name="name"
                                    value={data.name} onChange={onChangeHandler} disabled={!isEditing} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <input type="email" className="form-control" name="email"
                                    value={data.email} disabled={true} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Phone Number</label>
                                <input type="text" className="form-control" name="phoneNumber"
                                    value={data.phoneNumber} onChange={onChangeHandler} disabled={!isEditing} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Address</label>
                                <textarea className="form-control" name="address" rows="3"
                                    value={data.address} onChange={onChangeHandler} disabled={!isEditing} />
                            </div>
                            {isEditing ? (
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary w-50">Save</button>
                                    <button type="button" className="btn btn-secondary w-50"
                                        onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            ) : (
                                <button type="button" className="btn btn-outline-primary w-100"
                                    onClick={() => setIsEditing(true)}>
                                    <i className="bi bi-pencil me-2"></i>Edit Profile
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;