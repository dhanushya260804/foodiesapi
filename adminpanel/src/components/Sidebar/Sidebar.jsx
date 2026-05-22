import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Sidebar = ({sidebarVisible}) => {
  return (
    <div className={`border-end bg-white ${sidebarVisible ? 'sb-sidenav-toggled' : ''}`} id="sidebar-wrapper">
        <div className="sidebar-heading border-bottom bg-light">
            <img src={assets.logo} alt="" height={48} width={48}/>
        </div>
        <div className="list-group list-group-flush">
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/">
            <i className='bi bi-speedometer2 me-2'></i>Dashboard</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/add">
            <i className='bi bi-plus-circle me-2'></i>Add Food</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/list">
            <i className='bi bi-list-ul me-2'></i>List Food</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/orders">
            <i className='bi bi-cart me-2'></i>Orders</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/reviews">
            <i className='bi bi-star me-2'></i>Reviews</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/messages">
            <i className='bi bi-envelope me-2'></i>Messages</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/applications">
            <i className='bi bi-person-check me-2'></i>Applications</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/delivery-partners">
            <i className='bi bi-scooter me-2'></i>Delivery Partners</Link>
            <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/returns">
            <i className='bi bi-arrow-return-left me-2'></i>Returns</Link>
        </div>
    </div>
  )
}

export default Sidebar;