import React, { useContext, useState, useEffect } from 'react';
import "./PlaceOrder.css";
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { calculateCartTotals } from '../../util/cartUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RAZORPAY_KEY } from '../../util/contants';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../config';

const COD_CHARGE = 10;

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token, cartCustomizations } = useContext(StoreContext); // added cartCustomizations
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletDeduction, setWalletDeduction] = useState(0);

  const [data, setData] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', address: '', state: '', city: '', zip: ''
  });

  // Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWalletBalance(res.data.walletBalance || 0);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchWallet();
  }, [token]);

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const cartItems = foodList.filter(food => quantities[food.id] > 0);
  const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities, cartCustomizations); // added cartCustomizations

  console.log('cartCustomizations:', cartCustomizations);
  console.log('cartItems:', cartItems);

  // Calculate final total with wallet deduction
  const codExtra = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const orderTotal = total + codExtra;
  let walletUsedAmount = 0;
  let finalTotal = orderTotal;

  if (useWallet && walletBalance > 0) {
    walletUsedAmount = Math.min(walletBalance, orderTotal);
    finalTotal = orderTotal - walletUsedAmount;
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderData = {
      userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.state}, ${data.city}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map(item => ({
        foodId: item.id,
        quantity: quantities[item.id],
        price: (item.price + (cartCustomizations[item.id]?.addOnsPrice || 0)) * quantities[item.id], // added cartCustomizations add-ons price
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name,
      })),
      amount: orderTotal,  // Send original total, backend will handle wallet deduction
      orderStatus: 'Food Processing',
      paymentMethod: paymentMethod,
      useWallet: useWallet,
      walletAmountUsed: walletUsedAmount
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/orders/create`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201) {
        if (finalTotal <= 0) {
          // Fully paid by wallet
          toast.success('Order placed successfully using wallet balance!');
          await clearCart();
          navigate('/myorders');
        } else if (paymentMethod === 'cod') {
          // COD payment
          await axios.post(`${BASE_URL}/api/orders/verify`, {
            razorpay_order_id: response.data.razorpayOrderId || '',
            razorpay_payment_id: 'cod',
            razorpay_signature: 'cod',
            order_id: response.data.id,
          }, { headers: { Authorization: `Bearer ${token}` } });

          toast.success('Order placed! Your OTP is shown in My Orders.');
          await clearCart();
          navigate('/myorders');
        } else {
          initiateRazorpayPayment(response.data);
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Unable to place order. Please try again.');
    }
  };

  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount * 100,
      currency: 'INR',
      name: 'Foodies',
      description: 'Food order payment',
      order_id: order.razorpayOrderId,
      handler: async (razorpayResponse) => { await verifyPayment(razorpayResponse); },
      prefill: { name: `${data.firstName} ${data.lastName}`, email: data.email, contact: data.phoneNumber },
      theme: { color: '#3399cc' },
      modal: { ondismiss: async () => { toast.error('Payment cancelled.'); await deleteOrder(order.id); } },
    };
    new window.Razorpay(options).open();
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      await axios.post(`${BASE_URL}/api/orders/verify`, {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id:   razorpayResponse.razorpay_order_id,
        razorpay_signature:  razorpayResponse.razorpay_signature,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Payment successful.');
      await clearCart();
      navigate('/myorders');
    } catch { toast.error('Payment failed. Please try again.'); }
  };

  const deleteOrder = async (orderId) => {
    try { await axios.delete(`${BASE_URL}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } }); }
    catch { toast.error('Something went wrong. Contact support.'); }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
      setQuantities({});
    } catch { toast.error('Error while clearing the cart.'); }
  };

  return (
    <div className="container mt-4">
      <main>
        <div className="py-5 text-center">
          <img className="d-block mx-auto" src={assets.logo} alt="" width="98" height="98" />
        </div>
        <div className="row g-5">

          {/* Order Summary */}
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
            </h4>
            <ul className="list-group mb-3">
              {cartItems.map((item, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-muted">Qty: {quantities[item.id]}</small>
                  </div> 
                  <span className="text-muted">₹{(item.price + (cartCustomizations[item.id]?.addOnsPrice || 0)) * quantities[item.id]}</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Shipping</span>
                <span>₹{subtotal === 0 ? '0.00' : shipping.toFixed(2)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </li>
              {paymentMethod === 'cod' && (
                <li className="list-group-item d-flex justify-content-between text-warning">
                  <span>💵 COD Charge</span>
                  <span>₹{COD_CHARGE}.00</span>
                </li>
              )}
              {useWallet && walletUsedAmount > 0 && (
                <li className="list-group-item d-flex justify-content-between text-success">
                  <span>💰 Wallet Applied</span>
                  <span>-₹{walletUsedAmount.toFixed(2)}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total (INR)</span>
                <strong>₹{subtotal === 0 ? '0.00' : finalTotal.toFixed(2)}</strong>
              </li>
            </ul>

            {/* Wallet Section */}
            {walletBalance > 0 && (
              <div className="card mb-3">
                <div className="card-body">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="useWallet"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="useWallet">
                      <strong>Use Wallet Balance</strong>
                      <span className="text-success ms-2">(Available: ₹{walletBalance.toFixed(2)})</span>
                    </label>
                  </div>
                  {useWallet && walletUsedAmount > 0 && (
                    <div className="alert alert-success mt-2 mb-0 py-2">
                      <small>
                        <i className="bi bi-wallet2"></i> 
                        ₹{walletUsedAmount.toFixed(2)} will be deducted from your wallet
                        {finalTotal > 0 && (
                          <span>. Pay remaining ₹{finalTotal.toFixed(2)} via {paymentMethod === 'cod' ? 'COD' : 'online'}</span>
                        )}
                      </small>
                    </div>
                  )}
                  {useWallet && finalTotal === 0 && (
                    <div className="alert alert-info mt-2 mb-0 py-2">
                      <small>🎉 This order will be fully paid using your wallet balance!</small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="alert alert-warning py-2 small">
                <strong>💵 Cash on Delivery</strong><br />
                Pay <strong>₹{finalTotal.toFixed(2)}</strong> to the delivery partner.<br />
                An OTP will be shown in My Orders for payment confirmation.
              </div>
            )}
          </div>

          {/* Billing Form */}
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>
            <form className="needs-validation" onSubmit={onSubmitHandler}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">First name</label>
                  <input type="text" className="form-control" name="firstName"
                    placeholder="Vijay" required value={data.firstName} onChange={onChangeHandler} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Last name</label>
                  <input type="text" className="form-control" name="lastName"
                    placeholder="Joseph" required value={data.lastName} onChange={onChangeHandler} />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input type="email" className="form-control" name="email"
                      placeholder="Email" required value={data.email} onChange={onChangeHandler} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" name="phoneNumber"
                    placeholder="9876543210" required value={data.phoneNumber} onChange={onChangeHandler} />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" name="address"
                    placeholder="1234 Main St" required value={data.address} onChange={onChangeHandler} />
                </div>
                <div className="col-md-5">
                  <label className="form-label">State</label>
                  <select className="form-select" name="state" required value={data.state} onChange={onChangeHandler}>
                    <option value="">Choose...</option>
                    <option>Tamilnadu</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <select className="form-select" name="city" required value={data.city} onChange={onChangeHandler}>
                    <option value="">Choose...</option>
                    <option>Chennai</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Zip</label>
                  <input type="text" className="form-control" name="zip"
                    placeholder="98765" required value={data.zip} onChange={onChangeHandler} />
                </div>
              </div>

              <hr className="my-4" />
              <h4 className="mb-3">Payment Method</h4>
              <div className="d-flex gap-4 mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="payment" id="online"
                    value="online" checked={paymentMethod === 'online'}
                    onChange={e => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="online">💳 Online Payment</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="payment" id="cod"
                    value="cod" checked={paymentMethod === 'cod'}
                    onChange={e => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="cod">
                    💵 Cash on Delivery <span className="badge bg-warning text-dark ms-1">+₹{COD_CHARGE}</span>
                  </label>
                </div>
              </div>

              <button className="w-100 btn btn-primary btn-lg" type="submit"
                disabled={cartItems.length === 0}>
                {finalTotal <= 0 ? 'Place Order (Free)' : 
                  paymentMethod === 'cod' ? `Place Order — ₹${finalTotal.toFixed(2)} (COD)` : 
                  `Proceed to Pay ₹${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;