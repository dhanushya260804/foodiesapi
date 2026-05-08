import React from 'react';

const Menubar = ({ toggleSidebar, setToken }) => {

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <button className="btn btn-primary" id="sidebarToggle" onClick={toggleSidebar}>
          <i className='bi bi-list'></i>
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default Menubar;