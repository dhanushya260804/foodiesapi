import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ name, description, id, imageURL, price, veg, quantityPerSet, unit }) => {
    const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);

    const hasQuantityInfo = quantityPerSet > 1 && unit;

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
            <div className="card h-100 shadow-sm" style={{ maxWidth: '320px' }}>
                <Link to={`/food/${id}`}>
                    <img 
                        src={imageURL} 
                        className="card-img-top" 
                        alt={name} 
                        style={{ height: '200px', objectFit: 'cover' }} 
                    />
                </Link>
                <div className="card-body">
                    <div className="mb-2">
                        <span className={`badge ${veg ? 'bg-success' : 'bg-danger'}`}>
                            {veg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                    </div>
                    <h5 className="card-title">{name}</h5>
                    <p className="card-text text-muted small">{description}</p>

                    <div className="mt-2">
                        <div className="fw-bold text-success">
                            ₹{price}
                        </div>
                        {hasQuantityInfo && (
                            <div className="text-muted small">
                                {quantityPerSet} {unit}{quantityPerSet > 1 ? 's' : ''} per set
                            </div>
                        )}
                    </div>

                    <div className="mt-2">
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-fill text-warning"></i>
                        <i className="bi bi-star-half text-warning"></i>
                        <small className="text-muted ms-1">(4.5)</small>
                    </div>
                </div>

                <div className="card-footer bg-transparent d-flex justify-content-between">
                    <Link className="btn btn-outline-primary btn-sm" to={`/food/${id}`}>
                        View Details
                    </Link>
                    {quantities[id] > 0 ? (
                        <div className="d-flex align-items-center gap-2">
                            <button 
                                className="btn btn-outline-danger btn-sm" 
                                onClick={() => decreaseQty(id)}
                            >
                                <i className="bi bi-dash"></i>
                            </button>
                            <span className="fw-bold">{quantities[id]}</span>
                            <button 
                                className="btn btn-outline-success btn-sm" 
                                onClick={() => increaseQty(id)}
                            >
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => increaseQty(id)}
                        >
                            <i className="bi bi-cart-plus"></i> Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodItem;