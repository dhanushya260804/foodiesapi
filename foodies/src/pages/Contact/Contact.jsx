import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import axios from 'axios';
import './Contact.css';
import BASE_URL from '../../config';

const Contact = () => {
  const formRef = useRef();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('idle');
  const [replies, setReplies] = useState([]);
  const [checkedReplies, setCheckedReplies] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkReplies = async () => {
    if (!formData.email) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/messages/my?email=${formData.email}`);
      setReplies(response.data);
      setCheckedReplies(true);
    } catch (error) {
      console.log('Error fetching replies', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Save to database
      await axios.post(`${BASE_URL}/api/messages`, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: formData.message
      });

      // Send via EmailJS
      await emailjs.sendForm(
        'service_wyfyhaf',
        'template_tip06nh',
        formRef.current,
        'IfrSs8UmJznTSS7cD'
      );

      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error) {
      console.error("Error:", error);
      setStatus('error');
    }
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

          {/* Check Replies Section */}
          <div className="mt-4 p-3 bg-white rounded shadow-sm">
            <h5 className="fw-bold mb-2">📬 Check Admin Replies</h5>
            <div className="d-flex gap-2">
              <input type="email" className="form-control form-control-sm"
                placeholder="Enter your email" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <button className="btn btn-sm btn-primary" onClick={checkReplies}>Check</button>
            </div>
            {checkedReplies && (
              <div className="mt-3">
                {replies.length > 0 ? replies.map((msg, index) => (
                  <div key={index} className="card mb-2 p-2">
                    <small className="text-muted">{new Date(msg.createdAt).toLocaleDateString()}</small>
                    <p className="mb-1"><strong>You:</strong> {msg.message}</p>
                    {msg.replies && msg.replies.length > 0 ? (
                      msg.replies.map((reply, idx) => (
                        <div key={idx} className="bg-light p-2 rounded mt-1">
                          <small className="text-muted">Admin replied:</small>
                          <p className="mb-0 text-primary">{reply.message}</p>
                        </div>
                      ))
                    ) : (
                      <small className="text-muted">No reply yet...</small>
                    )}
                  </div>
                )) : (
                  <p className="text-muted mt-2">No messages found for this email.</p>
                )}
              </div>
            )}
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
              <input type="hidden" name="name" value={`${formData.firstName} ${formData.lastName}`} />
              <input type="hidden" name="title" value="New Contact Message" />

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName}
                    onChange={handleChange} placeholder="Dhanushya" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName}
                    onChange={handleChange} placeholder="T" required />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea name="message" value={formData.message}
                  onChange={handleChange} rows="5"
                  placeholder="Tell us what's on your mind..." required />
              </div>

              {status === 'error' && (
                <div className="contact-error">
                  ⚠️ Something went wrong. Please try again.
                </div>
              )}

              <button type="submit" className="btn-send" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;