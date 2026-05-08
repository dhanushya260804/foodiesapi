import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Login.css';

const Login = ({ setToken }) => {
  const [data, setData] = useState({ email: '', password: '' });

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (data.email === "admin@foodies.com" && data.password === "admin123") {
        localStorage.setItem('token', 'admin-token');
        setToken('admin-token');
        toast.success('Login successful!');
    } else {
        toast.error('Invalid email or password')
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h4 className="text-center">Admin Login</h4>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email"
              value={data.email} onChange={onChangeHandler} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password"
              value={data.password} onChange={onChangeHandler} required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;