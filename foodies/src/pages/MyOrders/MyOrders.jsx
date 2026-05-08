import React, { useContext, useEffect, useState, useRef } from 'react';
import {StoreContext} from '../../context/StoreContext'
import axios from 'axios';
import { assets } from '../../assets/assets';
import './MyOrders.css';
import BASE_URL from '../../config';
import { toast } from 'react-toastify';

const MyOrders = () => {
    const {token} = useContext(StoreContext);
    const [data, setData] = useState([]);
    const intervalRef = useRef(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [review, setReview] = useState({ rating: 5, comment: '' });

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/orders`, {headers: {'Authorization': `Bearer ${token}`}});
            setData(response.data);
        } catch (error) {
            console.log('Error fetching orders', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
            intervalRef.current = setInterval(fetchOrders, 10000);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [token]);

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'preparing': return 'text-warning';
            case 'out for delivery': return 'text-primary';
            case 'delivered': return 'text-success';
            default: return 'text-secondary';
        }
    };

    const openReviewModal = (item) => {
        setSelectedItem(item);
        setReview({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        try {
            await axios.post(`${BASE_URL}/api/reviews`, {
                foodId: selectedItem.foodId,
                rating: review.rating,
                comment: review.comment
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Review submitted successfully!');
            setShowReviewModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting review.');
        }
    };

    return (
        <div className="container">
            <div className="py-5 row justify-content-center">
                <div className="col-11 card">
                    <table className="table table-responsive">
                        <tbody>
                            {data.map((order, index) => (
                                <tr key={index}>
                                    <td>
                                        <img src={assets.delivery} alt="" height={48} width={48} />
                                    </td>
                                    <td>{order.orderedItems.map((item, idx) => {
                                        if (idx === order.orderedItems.length - 1) {
                                            return item.name + " x " + item.quantity;
                                        } else {
                                            return item.name + " x " + item.quantity + ", ";
                                        }
                                    })}</td>
                                    <td>&#x20B9;{order.amount.toFixed(2)}</td>
                                    <td>Items: {order.orderedItems.length}</td>
                                    <td className={`fw-bold text-capitalize ${getStatusColor(order.orderStatus)}`}>
                                        &#x25cf; {order.orderStatus}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={fetchOrders}>
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                        {order.orderStatus?.toLowerCase() === 'delivered' && (
                                            order.orderedItems.map((item, idx) => (
                                                <button key={idx} className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => openReviewModal(item)}>
                                                    ⭐ Review {item.name}
                                                </button>
                                            ))
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Review {selectedItem?.name}</h5>
                                <button className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Rating</label>
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} style={{fontSize: '2rem', cursor: 'pointer'}}
                                                onClick={() => setReview(prev => ({...prev, rating: star}))}>
                                                {star <= review.rating ? '⭐' : '☆'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Comment</label>
                                    <textarea className="form-control" rows="4" placeholder="Write your review..."
                                        value={review.comment}
                                        onChange={(e) => setReview(prev => ({...prev, comment: e.target.value}))}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={submitReview}>Submit Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default MyOrders;