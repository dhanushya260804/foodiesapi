import axios from "axios";
import React, { useEffect, useState } from "react"
import './Home.css';

const Home = () => {
    const [totalFoods, setTotalFoods] = useState(0);
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const foodRes = await axios.get('BASE_URL', { headers });
                setTotalFoods(foodRes.data.length);

                const orderRes = await axios.get('BASE_URL', { headers });
                setAllOrders(orderRes.data);
                setFilteredOrders(orderRes.data);
            } catch (error) {
                console.error('Error fetching stats', error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const filtered = allOrders.filter(order => {
                if (!order.createdAt) return false;
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate === selectedDate;
            });
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(allOrders);
        }
    }, [selectedDate, allOrders]);

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.amount, 0);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Dashboard</h2>
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold">Filter by Date:</label>
                    <input type="date" className="form-control" style={{maxWidth: '200px'}}
                        value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    {selectedDate && (
                        <button className="btn btn-outline-secondary btn-sm"
                            onClick={() => setSelectedDate('')}>Clear</button>
                    )}
                </div>
            </div>

            {selectedDate && (
                <p className="text-muted mb-3">
                    Showing results for <strong>{new Date(selectedDate).toDateString()}</strong>
                </p>
            )}

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="stat-card card-orders">
                        <div className="stat-icon">
                            <i className="bi bi-bag-check-fill"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{totalOrders}</h3>
                            <p>{selectedDate ? 'Orders on this day' : 'Total Orders'}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card card-foods">
                        <div className="stat-icon">
                            <i className="bi bi-egg-fried"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{totalFoods}</h3>
                            <p>Total Foods</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card card-revenue">
                        <div className="stat-icon">
                            <i className="bi bi-currency-rupee"></i>
                        </div>
                        <div className="stat-info">
                            <h3>&#8377;{totalRevenue.toFixed(2)}</h3>
                            <p>{selectedDate ? 'Revenue on this day' : 'Total Revenue'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;