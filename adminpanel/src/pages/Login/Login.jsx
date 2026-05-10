import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Login.css';
import BASE_URL from '../../config';

const Login = ({ setToken }) => {
  const [data, setData] = useState({ email: '', password: '' });

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, data);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        toast.success('Login successful!');
      }
    } catch (error) {
      toast.error('Invalid email or password');
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