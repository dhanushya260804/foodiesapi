import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import headerImg from '../../assets/header.png';

const Header = () => {
  return (
    <div className="p-5 mb-4 rounded-3 mt-1 header" style={{backgroundImage: `url(${headerImg})`}}>
        <div className="container-fluid py-5">
            <h1 className='display-5 fw-bold'>Order your favourite food here</h1>
            <p className='col-md-8 fs-4'>Discover the best foods and drinks in Chennai</p>
            <Link to="/explore" className='btn btn-primary'>Explore</Link>
        </div>
    </div>
  )
}

export default Header;