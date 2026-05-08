import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/reviews/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(response.data);
        } catch (error) {
            console.log('Error fetching reviews', error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i}>{i < rating ? '⭐' : '☆'}</span>
        ));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Customer Reviews</h2>
            {reviews.length > 0 ? (
                <div className="row">
                    {reviews.map((review, index) => (
                        <div key={index} className="col-md-6 mb-4">
                            <div className="card p-3 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{review.userName}</strong>
                                        <div>{renderStars(review.rating)}</div>
                                    </div>
                                    <small className="text-muted">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <p className="mt-2 mb-1 text-muted" style={{fontSize: '0.85rem'}}>
                                    Food ID: {review.foodId}
                                </p>
                                <p className="mb-0">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted">No reviews yet.</p>
            )}
        </div>
    );
};

export default Reviews;