import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home/Home';
import Apply from './pages/Apply/Apply';
import ApplicantLogin from './pages/ApplicantLogin/ApplicantLogin';
import ApplicantStatus from './pages/Status/Status';
import PartnerLogin from './pages/PartnerLogin/PartnerLogin';
import AvailableOrders from './pages/AvailableOrders/AvailableOrders';
import PartnerStatus from './pages/PartnerStatus/PartnerStatus';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  // Applicant state (pending/rejected partners)
  const [applicantToken, setApplicantToken] = useState(localStorage.getItem('applicantToken') || '');
  const [applicantEmail, setApplicantEmail] = useState(localStorage.getItem('applicantEmail') || '');

  // Active partner state (approved partners)
  const [partnerToken, setPartnerToken] = useState(localStorage.getItem('partnerToken') || '');
  const [partnerEmail, setPartnerEmail] = useState(localStorage.getItem('partnerEmail') || '');

  const handleApplicantLogin = (token, email) => {
    setApplicantToken(token);
    setApplicantEmail(email);
    localStorage.setItem('applicantToken', token);
    localStorage.setItem('applicantEmail', email);
  };

  const handleApplicantLogout = () => {
    setApplicantToken('');
    setApplicantEmail('');
    localStorage.removeItem('applicantToken');
    localStorage.removeItem('applicantEmail');
  };

  const handlePartnerLogin = (token, email) => {
    setPartnerToken(token);
    setPartnerEmail(email);
    localStorage.setItem('partnerToken', token);
    localStorage.setItem('partnerEmail', email);
  };

  const handlePartnerLogout = () => {
    setPartnerToken('');
    setPartnerEmail('');
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerEmail');
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Routes>
        {/* Landing */}
        <Route path='/' element={<Home />} />

        {/* Applicant flow */}
        <Route path='/apply'  element={<Apply />} />
        <Route path='/applicant-login' element={
          applicantToken ? <Navigate to='/applicant-status' /> : <ApplicantLogin onLogin={handleApplicantLogin} />
        } />
        <Route path='/applicant-status' element={
          applicantToken
            ? <ApplicantStatus token={applicantToken} email={applicantEmail} onLogout={handleApplicantLogout} />
            : <Navigate to='/applicant-login' />
        } />

        {/* Active partner flow */}
        <Route path='/partner-login' element={
          partnerToken ? <Navigate to='/partner-status' /> : <PartnerLogin onLogin={handlePartnerLogin} />
        } />
        <Route path='/available-orders' element={
          partnerToken
            ? <AvailableOrders token={partnerToken} email={partnerEmail} onLogout={handlePartnerLogout} />
            : <Navigate to='/partner-login' />
        } />
        <Route path='/partner-status' element={
          partnerToken
            ? <PartnerStatus token={partnerToken} email={partnerEmail} onLogout={handlePartnerLogout} />
            : <Navigate to='/partner-login' />
        } />

      </Routes>
    </>
  );
};

export default App;