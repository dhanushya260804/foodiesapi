import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import './MyOrders.css';
import BASE_URL from '../../config';
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import ReturnModal from '../../components/ReturnModal/ReturnModal';

const MyOrders = () => {
    const { token, userId } = useContext(StoreContext);
    const [data, setData]           = useState([]);
    const [returns, setReturns]     = useState({}); // { orderId: returnRequest }
    const [returnOrder, setReturnOrder] = useState(null);
    const intervalRef   = useRef(null);
    const stompClientRef = useRef(null);

    const [showFoodModal, setShowFoodModal]       = useState(false);
    const [selectedItem, setSelectedItem]         = useState(null);
    const [foodReview, setFoodReview]             = useState({ rating: 5, comment: '' });
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [selectedOrder, setSelectedOrder]       = useState(null);
    const [partnerReview, setPartnerReview]       = useState({ rating: 5, comment: '' });

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            // Fetch return status for delivered orders
            for (const order of res.data) {
                if (order.orderStatus === 'Delivered') {
                    fetchReturnStatus(order.id);
                }
            }
        } catch { console.log('Error fetching orders'); }
    };

    const fetchReturnStatus = async (orderId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/returns/my/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReturns(prev => ({ ...prev, [orderId]: res.data }));
    } catch (err) {
        if (err.response?.status === 404) {
            setReturns(prev => ({ ...prev, [orderId]: null }));
        }
    }
};

    useEffect(() => {
        if (!token || !userId) return;
        const client = new Client({
            brokerURL: 'wss://foodies-api-dm0f.onrender.com/ws/websocket',
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/orders/${userId}`, (message) => {
                    const updatedOrder = JSON.parse(message.body);
                    setData(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                    toast.info(
                        <div>
                            <strong>🛵 Your order is on the way!</strong>
                            <div style={{ fontSize: '0.88rem', marginTop: 6 }}>
                                <div>Partner: <strong>{updatedOrder.deliveryPartnerName}</strong></div>
                                <div>Phone: <strong>{updatedOrder.deliveryPartnerPhone}</strong></div>
                            </div>
                        </div>,
                        { autoClose: 8000 }
                    );
                });
            },
        });
        client.activate();
        stompClientRef.current = client;
        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, [token, userId]);

    useEffect(() => {
        if (token) {
            fetchOrders();
            intervalRef.current = setInterval(fetchOrders, 10000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [token]);

    const isReturnWindowOpen = (order) => {
    if (!order.deliveredAt) return false;
    // Add 'Z' to treat as UTC if not present
    const deliveredAtStr = order.deliveredAt.endsWith('Z') 
        ? order.deliveredAt 
        : order.deliveredAt + 'Z';
    const delivered = new Date(deliveredAtStr);
    const now = new Date();
    return (now - delivered) / 60000 <= 15;
};

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'food processing': return 'text-warning';
            case 'out for delivery': return 'text-primary';
            case 'delivered': return 'text-success';
            case 'returned': return 'text-info';
            case 'cancelled': return 'text-danger';
            default: return 'text-secondary';
        }
    };

    const getReturnBadge = (returnReq) => {
        if (!returnReq) return null;
        const colors = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
        return (
            <div className="mt-2">
                <span className={`badge bg-${colors[returnReq.status]}`}>
                    🔄 Return: {returnReq.status}
                </span>
                {returnReq.adminReason && (
                    <div className="text-muted small mt-1">
                        Admin: {returnReq.adminReason}
                    </div>
                )}
                {returnReq.status === 'APPROVED' && (
                    <div className="text-success small mt-1">
                        {returnReq.reorderRequested
                            ? '📦 Re-order placed!'
                            : `💰 Refund of ₹${returnReq.refundAmount} via ${returnReq.refundMethod === 'WALLET' ? 'Store Wallet' : 'Razorpay'}`}
                    </div>
                )}
            </div>
        );
    };

    const submitFoodReview = async () => {
        try {
            await axios.post(`${BASE_URL}/api/reviews`, {
                foodId: selectedItem.foodId,
                rating: foodReview.rating,
                comment: foodReview.comment
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Food review submitted!');
            setShowFoodModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error submitting review.'); }
    };

    const submitPartnerReview = async () => {
        try {
            await axios.post(`${BASE_URL}/api/partner-reviews`, {
                partnerId: selectedOrder.deliveryPartnerId,
                orderId: selectedOrder.id,
                rating: partnerReview.rating,
                comment: partnerReview.comment
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Partner review submitted!');
            setShowPartnerModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error submitting review.'); }
    };

    const StarPicker = ({ value, onChange }) => (
        <div className="d-flex gap-2">
            {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize: '2rem', cursor: 'pointer' }}
                    onClick={() => onChange(star)}>
                    {star <= value ? '⭐' : '☆'}
                </span>
            ))}
        </div>
    );

    return (
        <div className="container">
            <div className="py-5 row justify-content-center">
                <div className="col-11">
                    {data.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <div style={{ fontSize: '3rem' }}>📦</div>
                            <p className="mt-2">No orders yet</p>
                        </div>
                    ) : (
                        data.map((order, index) => (
                            <div key={index} className="card mb-3 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <img src={assets.delivery} alt="" height={48} width={48} />
                                        </div>
                                        <div className="col">
                                            <div className="fw-semibold">
                                                {order.orderedItems.map((item, idx) =>
                                                    idx === order.orderedItems.length - 1
                                                        ? `${item.name} x ${item.quantity}`
                                                        : `${item.name} x ${item.quantity}, `
                                                )}
                                            </div>
                                            <div className="text-muted small">
                                                {order.orderedItems.length} item(s) · ₹{order.amount.toFixed(2)}
                                                {order.paymentMethod === 'cod' && (
                                                    <span className="badge bg-warning text-dark ms-2">COD</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <span className={`fw-bold text-capitalize ${getStatusColor(order.orderStatus)}`}>
                                                ● {order.orderStatus}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <button className="btn btn-sm btn-warning" onClick={fetchOrders}>
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>

{order.orderStatus === 'Pending' && (
  <button 
    className="btn btn-sm btn-danger ms-2"
    onClick={async () => {
      if (window.confirm('Cancel this order?')) {
        try {
          await axios.patch(`${BASE_URL}/api/orders/cancel/${order.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Order cancelled. Wallet refunded if applicable.');
          fetchOrders();
        } catch (error) {
          toast.error('Failed to cancel order');
        }
      }
    }}
  >
    Cancel Order
  </button>
)}
                                        </div>
                                    </div>

                                    {/* COD OTP */}
                                    {order.paymentMethod === 'cod' && order.codOtp && order.orderStatus !== 'Delivered' && (
                                        <div className="mt-3 p-3 rounded text-center"
                                            style={{ background: '#fff8e1', border: '2px dashed #f59e0b' }}>
                                            <div className="fw-bold text-warning mb-1">💵 Payment OTP</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '12px', color: '#1b4332', fontFamily: 'monospace' }}>
                                                {order.codOtp}
                                            </div>
                                            <div className="text-muted small mt-1">
                                                Share with partner after paying <strong>₹{order.amount?.toFixed(2)}</strong> cash
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Partner */}
                                    {order.deliveryPartnerName && (
                                        <div className="mt-3 p-3 rounded"
                                            style={{ background: '#f0faf5', border: '1px solid #b7dfc9' }}>
                                            <div className="fw-bold text-success mb-2">🛵 Delivery Partner</div>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center"
                                                        style={{ width: 40, height: 40 }}>
                                                        {order.deliveryPartnerName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{order.deliveryPartnerName}</div>
                                                        <div className="text-muted small">📞 {order.deliveryPartnerPhone} · ⭐ {order.deliveryPartnerRating}</div>
                                                    </div>
                                                </div>
                                                {order.orderStatus?.toLowerCase() === 'delivered' && (
                                                    <button className="btn btn-sm btn-outline-success"
                                                        onClick={() => { setSelectedOrder(order); setPartnerReview({ rating: 5, comment: '' }); setShowPartnerModal(true); }}>
                                                        ⭐ Rate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivered actions */}
                                    {order.orderStatus?.toLowerCase() === 'delivered' && (
                                        <div className="mt-2">
                                            {/* Food reviews */}
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {order.orderedItems.map((item, idx) => (
                                                    <button key={idx} className="btn btn-sm btn-outline-primary"
                                                        onClick={() => { setSelectedItem(item); setFoodReview({ rating: 5, comment: '' }); setShowFoodModal(true); }}>
                                                        ⭐ Review {item.name}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Return request */}
                                            {!returns[order.id] && isReturnWindowOpen(order) && (
                                                <button className="btn btn-sm btn-outline-danger"
    onClick={() => {
        console.log("clicked, order:", order);
        setReturnOrder(order);
    }}>
    🔄 Return Request
</button>
                                            )}

                                            {/* Return status */}
                                            {getReturnBadge(returns[order.id])}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Return Modal */}
            {returnOrder && (
                <ReturnModal
                    order={returnOrder}
                    token={token}
                    onClose={() => setReturnOrder(null)}
                    onSuccess={() => fetchReturnStatus(returnOrder.id)}
                />
            )}

            {/* Food Review Modal */}
            {showFoodModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Review {selectedItem?.name}</h5>
                                <button className="btn-close" onClick={() => setShowFoodModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Rating</label>
                                    <StarPicker value={foodReview.rating} onChange={s => setFoodReview(p => ({ ...p, rating: s }))} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Comment</label>
                                    <textarea className="form-control" rows="4" value={foodReview.comment}
                                        onChange={e => setFoodReview(p => ({ ...p, comment: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowFoodModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={submitFoodReview}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Partner Review Modal */}
            {showPartnerModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: '#f0faf5' }}>
                                <h5 className="modal-title">🛵 Rate {selectedOrder?.deliveryPartnerName}</h5>
                                <button className="btn-close" onClick={() => setShowPartnerModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Rating</label>
                                    <StarPicker value={partnerReview.rating} onChange={s => setPartnerReview(p => ({ ...p, rating: s }))} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Comment</label>
                                    <textarea className="form-control" rows="4" value={partnerReview.comment}
                                        onChange={e => setPartnerReview(p => ({ ...p, comment: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowPartnerModal(false)}>Cancel</button>
                                <button className="btn btn-success" onClick={submitPartnerReview}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
