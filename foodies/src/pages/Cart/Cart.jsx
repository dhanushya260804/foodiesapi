import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Cart.css';
import { Link, useNavigate } from 'react-router-dom';
import { calculateCartTotals } from '../../util/cartUtils';

const Cart = () => {
    const navigate = useNavigate();
    const { foodList, increaseQty, decreaseQty, quantities, removeFromCart, cartCustomizations } =
        useContext(StoreContext);

    const cartItems = foodList.filter(food => quantities[food.id] > 0);

    // Include add-ons price in subtotal calculation
    const subtotal = cartItems.reduce((sum, food) => {
        const custom = cartCustomizations[food.id];
        const addOnsPrice = custom ? custom.addOnsPrice : 0;
        const variantPrice = custom?.variantPrice || food.price;
        return sum + (variantPrice + addOnsPrice) * quantities[food.id];
    }, 0);

    const shipping = subtotal > 0 ? 40 : 0;
    const tax      = subtotal * 0.05;
    const total    = subtotal + shipping + tax;

    return (
        <div className="container py-5">
            <h1 className="mb-5">Your Shopping Cart</h1>
            <div className="row">
                <div className="col-lg-8">
                    {cartItems.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <div className="card mb-4">
                            <div className="card-body">
                                {cartItems.map((food) => {
                                    const custom = cartCustomizations[food.id];
                                    const addOnsPrice = custom ? custom.addOnsPrice : 0;
                                    const variantPrice = custom?.variantPrice || food.price;
                                    const itemTotal = (variantPrice + addOnsPrice) * quantities[food.id];

                                    return (
                                        <div key={food.id} className="row cart-item mb-3">
                                            <div className="col-md-3">
                                                <img src={food.imageUrl} alt={food.name}
                                                    className="img-fluid rounded" width={100} />
                                            </div>
                                            <div className="col-md-5">
                                                <h5 className="card-title">{food.name}</h5>
                                                <p className="text-muted mb-1">Category: {food.category}</p>

                                            {custom?.selectedVariant && (
                                            <span className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                                                 📐 {custom.selectedVariant}
                                            </span>
)}

                                                {/* Add-ons */}
                                                {custom?.selectedAddOns?.length > 0 && (
                                                    <div className="mb-1">
                                                        {custom.selectedAddOns.map((a, i) => (
                                                            <span key={i} className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                                                                🧩 {a}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Preferences */}
                                                {custom?.selectedPreferences?.length > 0 && (
                                                    <div>
                                                        {custom.selectedPreferences.map((p, i) => (
                                                            <span key={i} className="badge bg-secondary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                                                                ⚙️ {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-2">
                                                <div className="input-group">
                                                    <button className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => decreaseQty(food.id)}>-</button>
                                                    <input style={{ maxWidth: '50px' }} type="text"
                                                        className="form-control form-control-sm text-center"
                                                        value={quantities[food.id]} readOnly />
                                                    <button className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => increaseQty(food.id)}>+</button>
                                                </div>
                                                {addOnsPrice > 0 && (
                                                    <small className="text-muted d-block mt-1">
                                                        +₹{addOnsPrice} add-ons
                                                    </small>
                                                )}
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <p className="fw-bold">₹{itemTotal.toFixed(2)}</p>
                                                <button className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeFromCart(food.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                            <hr />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="text-start mb-4">
                        <Link to="/" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card cart-summary">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Shipping</span>
                                <span>₹{subtotal === 0 ? '0.00' : shipping.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <strong>Total</strong>
                                <strong>₹{subtotal === 0 ? '0.00' : total.toFixed(2)}</strong>
                            </div>
                            <button className="btn btn-primary w-100"
                                disabled={cartItems.length === 0}
                                onClick={() => navigate('/order')}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;