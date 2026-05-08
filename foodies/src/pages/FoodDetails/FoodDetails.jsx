import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodDetails } from '../../service/foodService';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import BASE_URL from '../../config';

const FoodDetails = () => {
    const {id} = useParams();
    const {increaseQty} = useContext(StoreContext);
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const loadFoodDetails = async () => {
            try {
                const foodData = await fetchFoodDetails(id);
                setData(foodData);
            } catch (error) {
                toast.error('Error displaying the food details.');
            }
        }
        loadFoodDetails();
        fetchReviews();
    }, [id]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/reviews/food/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.log('Error fetching reviews', error);
        }
    };

    const addToCart = () => {
        increaseQty(data.id);
        navigate("/cart");
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} style={{fontSize: '1.2rem'}}>
                {i < rating ? '⭐' : '☆'}
            </span>
        ));
    };

    return (
        <section className="py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    <div className="col-md-6">
                        <img className="card-img-top mb-5 mb-md-0" src={data.imageUrl} alt="..." />
                    </div>
                    <div className="col-md-6">
                        <div className="fs-5 mb-1">Category: <span className='badge text-bg-warning'>{data.category}</span></div>
                        <h1 className="display-5 fw-bolder">{data.name}</h1>
                        <div className="fs-5 mb-2">
                            <span>&#8377;{data.price}.00</span>
                        </div>
                        <p className="lead">{data.description}</p>
                        <div className="d-flex">
                            <button className="btn btn-outline-dark flex-shrink-0" type="button" onClick={addToCart}>
                                <i className="bi-cart-fill me-1"></i>
                                Add to cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-5">
                    <h3 className="mb-4">Customer Reviews</h3>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="card mb-3 p-3">
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
                        ))
                    ) : (
                        <p className="text-muted">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FoodDetails;