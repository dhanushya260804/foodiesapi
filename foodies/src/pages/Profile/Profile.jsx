import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../../config";
import './Profile.css';

const Profile = () => {
    const { token } = useContext(StoreContext);
    const [data, setData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.log('Error fetching profile', error);
        }
    };

    const onChangeHandler = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmitHandler = async (e) =>  {
        e.preventDefault();
        try {
            await axios.put(`${BASE_URL}/api/users/profile`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Error updating profile.')
        }
    };

    useEffect(() => {
        if (token) fetchProfile();
    }, [token]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
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
                                    value={data.email} onChange={onChangeHandler} disabled={true} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Phone Numbet</label>
                                <input type="text" className="form-control" name="phoneNumber"
                                    value={data.phoneNumber} onChange={onChangeHandler} disabled={!isEditing} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Address</label>
                                <textarea className="form-control" name="address" rows="3"
                                    value={data.address} onChange={onChangeHandler} disabled={!isEditing}></textarea>
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