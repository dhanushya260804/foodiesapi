import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AddFood from './pages/AddFood/AddFood';
import ListFood from './pages/ListFood/ListFood';
import Orders from './pages/Orders/Orders';
import Sidebar from './components/Sidebar/Sidebar';
import Menubar from './components/Menubar/Menubar';
import Login from './pages/Login/Login';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home/Home';
import Reviews from './pages/Reviews/Reviews';
import Messages from './pages/Messages/Messages';
import Applications from './pages/Applications/Applications';
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners';
import Returns from './pages/Returns/Returns';

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    document.body.classList.toggle('sb-sidenav-toggled');
  };

  if (!token) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path='*' element={<Login setToken={setToken} />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar sidebarVisible={sidebarVisible} />
      <div id="page-content-wrapper">
        <Menubar toggleSidebar={toggleSidebar} setToken={setToken} />
        <ToastContainer />
        <div className="container-fluid">
          <Routes>
            <Route path='/add'                element={<AddFood />} />
            <Route path='/list'               element={<ListFood />} />
            <Route path='/orders'             element={<Orders />} />
            <Route path='/'                   element={<Home />} />
            <Route path='/reviews'            element={<Reviews />} />
            <Route path='/messages'           element={<Messages />} />
            <Route path='/applications'       element={<Applications />} />
            <Route path='/delivery-partners'  element={<DeliveryPartners />} />
            <Route path='/returns'  element={<Returns />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;