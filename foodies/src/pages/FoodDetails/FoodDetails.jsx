import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodDetails } from '../../service/foodService';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import BASE_URL from '../../config';
import AddOnsModal from '../../components/AddOnsModal/AddOnsModal';

const FoodDetails = () => {
    const { id } = useParams();
    const { increaseQty } = useContext(StoreContext);
    const navigate = useNavigate();
    const [data, setData]       = useState({});
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const foodData = await fetchFoodDetails(id);
                setData(foodData);
            } catch { toast.error('Error displaying food details.'); }
        };
        load();
        fetchReviews();
    }, [id]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/reviews/food/${id}`);
            setReviews(res.data);
        } catch { console.log('Error fetching reviews'); }
    };

    const handleAddToCart = () => {
        if (data.addOnsEnabled && ((data.addOns?.length > 0) || (data.preferences?.length > 0))) {
            setShowModal(true);
        } else {
            increaseQty(data.id);
            navigate('/cart');
        }
    };

    const handleModalConfirm = (customization) => {
        setShowModal(false);
        increaseQty(data.id, customization);
        navigate('/cart');
    };

    const renderStars = (rating) =>
        [...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: '1.2rem' }}>{i < rating ? '⭐' : '☆'}</span>
        ));

    const hasQuantityInfo = data.quantityPerSet > 1 && data.unit;

    return (
        <section className="py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    <div className="col-md-6">
                        <img className="card-img-top mb-5 mb-md-0" src={data.imageUrl} alt={data.name} />
                    </div>
                    <div className="col-md-6">
                        <div className="fs-5 mb-1">
                            Category: <span className="badge text-bg-warning">{data.category}</span>
                        </div>
                        <h1 className="display-5 fw-bolder">{data.name}</h1>

                        <div className="fs-5 mb-2 d-flex align-items-center gap-3">
                            <span className="fw-bold">₹{data.price}</span>
                            {hasQuantityInfo && (
                                <span className="badge bg-light text-dark border" style={{ fontSize: '0.9rem' }}>
                                    {data.quantityPerSet} {data.unit}{data.quantityPerSet > 1 ? 's' : ''} per set
                                </span>
                            )}
                        </div>

                        {hasQuantityInfo && (
                            <div className="text-muted small mb-2">
                                ₹{(data.price / data.quantityPerSet).toFixed(1)} per {data.unit}
                            </div>
                        )}

                        <p className="lead mb-3">{data.description}</p>

                        {/* Add-ons preview */}
                        {data.addOnsEnabled && (
                            <div className="alert alert-info py-2 mb-3">
                                🧩 <strong>Customisable</strong> — add-ons & preferences available
                            </div>
                        )}

                        <button className="btn btn-outline-dark" onClick={handleAddToCart}>
                            <i className="bi-cart-fill me-1"></i>
                            {data.addOnsEnabled ? 'Customise & Add to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>

                {/* Reviews */}
                <div className="mt-5">
                    <h3 className="mb-4">Customer Reviews</h3>
                    {reviews.length > 0 ? reviews.map((review, i) => (
                        <div key={i} className="card mb-3 p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{review.userName}</strong>
                                    <div>{renderStars(review.rating)}</div>
                                </div>
                                <small className="text-muted">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                            <p className="mt-2 mb-0">{review.comment}</p>
                        </div>
                    )) : (
                        <p className="text-muted">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>

            {/* Add-ons Modal */}
            {showModal && (
                <AddOnsModal
                    food={data}
                    onConfirm={handleModalConfirm}
                    onClose={() => setShowModal(false)}
                />
            )}
        </section>
    );
};

export default FoodDetails;