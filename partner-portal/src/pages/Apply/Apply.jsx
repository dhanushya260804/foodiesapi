import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Apply.css';

const API = 'https://foodies-api-whrh.onrender.com/api/delivery-partners';
const STEPS = ['Personal Info', 'Vehicle Details', 'Upload Documents'];

const Apply = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phoneNumber: '',
    vehicleNumber: '', licenseNumber: '',
    photo: null, idProof: null, license: null,
  });

  const [previews, setPreviews] = useState({ photo: null, idProof: null, license: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, [name]: file }));
    setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim())        { toast.warning('Name is required'); return false; }
      if (!form.email.trim())       { toast.warning('Email is required'); return false; }
      if (!form.phoneNumber.trim()) { toast.warning('Phone number is required'); return false; }
      if (form.password.length < 6) { toast.warning('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword) { toast.warning('Passwords do not match'); return false; }
    }
    if (step === 1) {
      if (!form.vehicleNumber.trim()) { toast.warning('Vehicle number is required'); return false; }
      if (!form.licenseNumber.trim()) { toast.warning('License number is required'); return false; }
    }
    if (step === 2) {
      if (!form.photo)   { toast.warning('Please upload your photo'); return false; }
      if (!form.idProof) { toast.warning('Please upload your ID proof'); return false; }
      if (!form.license) { toast.warning('Please upload your driving license'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', form.name);
      data.append('email', form.email);
      data.append('password', form.password);
      data.append('phoneNumber', form.phoneNumber);
      data.append('vehicleNumber', form.vehicleNumber);
      data.append('licenseNumber', form.licenseNumber);
      data.append('photo', form.photo);
      data.append('idProof', form.idProof);
      data.append('license', form.license);
      await axios.post(`${API}/apply`, data);
      toast.success('Application submitted successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-page">
      <div className="apply-card">

        <div className="apply-header">
          <div className="apply-logo">🛵 Foodies</div>
          <h2 className="apply-title">Become a Delivery Partner</h2>
          <p className="apply-subtitle">Join our fleet and start earning today</p>
        </div>

        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={i} className="step-item">
              <div className={`step-circle ${i <= step ? 'active' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className={`step-label ${i <= step ? 'active' : ''}`}>{label}</div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <div className="apply-body">
          {step === 0 && (
            <div className="fields">
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" />
              <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ravi@email.com" />
              <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
              <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
            </div>
          )}
          {step === 1 && (
            <div className="fields">
              <Field label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="TN01AB1234" />
              <Field label="Driving License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="TN012345678901" />
              <div className="info-box">
                <span>ℹ️</span>
                <span>Make sure your vehicle registration is valid and your license is not expired.</span>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="fields">
              <FileUpload label="Your Photo" name="photo" preview={previews.photo} onChange={handleFile} hint="Clear face photo, JPG or PNG" />
              <FileUpload label="ID Proof" name="idProof" preview={previews.idProof} onChange={handleFile} hint="Aadhaar, Passport, or Voter ID" />
              <FileUpload label="Driving License" name="license" preview={previews.license} onChange={handleFile} hint="Front side of your driving license" />
            </div>
          )}
        </div>

        <div className="apply-actions">
          {step > 0 && <button className="btn-secondary" onClick={back}>← Back</button>}
          {step < STEPS.length - 1 && <button className="btn-primary" onClick={next}>Next →</button>}
          {step === STEPS.length - 1 && (
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>

        <div className="login-link">
          Already applied?{' '}
          <span className="link" onClick={() => navigate('/applicant-login')}>Check your status</span>
        </div>

      </div>
    </div>
  );
};

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div className="field-group">
    <label className="field-label">{label}</label>
    <input className="field-input" type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const FileUpload = ({ label, name, preview, onChange, hint }) => (
  <div className="file-group">
    <label className="field-label">{label}</label>
    <div className="file-box">
      {preview
        ? <img src={preview} alt={label} className="file-preview" />
        : <div className="file-placeholder"><span className="file-icon">📄</span><span className="file-hint">{hint}</span></div>
      }
      <label className="file-btn">
        {preview ? 'Change' : 'Upload'}
        <input type="file" name={name} accept="image/*,.pdf" onChange={onChange} style={{ display: 'none' }} />
      </label>
    </div>
  </div>
);

export default Apply;
