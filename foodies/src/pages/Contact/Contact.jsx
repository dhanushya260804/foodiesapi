import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const formRef = useRef();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');

    emailjs.sendForm(
      'service_wyfyhaf',     // your service ID
      'template_tip06nh',    // your template ID
      formRef.current,
      'IfrSs8UmJznTSS7cD'    // your public key
    )
    .then(() => {
      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
      });
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      setStatus('error');
    });
  };

  return (
    <section className="contact-section">
      <div className="contact-blob contact-blob-1" />
      <div className="contact-blob contact-blob-2" />

      <div className="container contact-container">

        {/* LEFT SIDE */}
        <div className="contact-info">
          <span className="contact-tag">Say Hello 👋</span>
          <h1 className="contact-heading">
            We'd love to<br />hear from you
          </h1>
          <p className="contact-subtext">
            Got a question, feedback, or just want to say hi?
            Drop us a message and we'll get back to you within 24 hours.
          </p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="contact-icon">📍</div>
              <div>
                <div className="contact-detail-label">Location</div>
                <div className="contact-detail-value">Chennai, Tamil Nadu</div>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon">📧</div>
              <div>
                <div className="contact-detail-label">Email</div>
                <div className="contact-detail-value">support@foodies.com</div>
              </div>
            </div>

            <div className="contact-detail-item">
              <div className="contact-icon">⏰</div>
              <div>
                <div className="contact-detail-label">Response Time</div>
                <div className="contact-detail-value">Within 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-form-card">
          <h2 className="form-title">Send a Message</h2>

          {status === 'success' ? (
            <div className="contact-success">
              <div className="success-icon">✅</div>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll reply within 24 hours.</p>
              <button className="btn-send" onClick={() => setStatus('idle')}>
                Send Another
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="contact-form">

              {/* ✅ IMPORTANT FIX: Combined Name */}
              <input
                type="hidden"
                name="name"
                value={`${formData.firstName} ${formData.lastName}`}
              />

              {/* ✅ OPTIONAL FIX: Title (because template uses {{title}}) */}
              <input
                type="hidden"
                name="title"
                value="New Contact Message"
              />

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Dhanushya"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="T"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>

              {status === 'error' && (
                <div className="contact-error">
                  ⚠️ Something went wrong. Please try again.
                </div>
              )}

              <button
                type="submit"
                className="btn-send"
                disabled={status === 'sending'}
              >
                {status === 'sending'
                  ? 'Sending...'
                  : 'Send Message'}
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
};

export default Contact;