import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../config';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState({});

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.log('Error fetching messages', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const sendReply = async (messageId) => {
        if (!replyText[messageId]) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${BASE_URL}/api/messages/${messageId}/reply`,
                { reply: replyText[messageId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Reply sent!');
            setReplyText(prev => ({ ...prev, [messageId]: '' }));
            fetchMessages();
        } catch (error) {
            toast.error('Error sending reply.');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'unread': return 'bg-danger';
            case 'read': return 'bg-warning';
            case 'replied': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Customer Messages</h2>
            {messages.length > 0 ? messages.map((msg, index) => (
                <div key={index} className="card mb-3 shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{msg.name}</strong>
                            <span className="text-muted ms-2">{msg.email}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${getStatusBadge(msg.status)}`}>{msg.status}</span>
                            <small className="text-muted">{new Date(msg.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <div className="card-body">
                        <p className="mb-3"><strong>Message:</strong> {msg.message}</p>

                        {msg.replies && msg.replies.length > 0 && (
                            <div className="mb-3">
                                <strong>Previous Replies:</strong>
                                {msg.replies.map((reply, idx) => (
                                    <div key={idx} className="bg-light p-2 rounded mt-1">
                                        <small className="text-muted">{new Date(reply.repliedAt).toLocaleDateString()}</small>
                                        <p className="mb-0">{reply.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <textarea className="form-control" rows="2" placeholder="Type your reply..."
                                value={replyText[msg.id] || ''}
                                onChange={(e) => setReplyText(prev => ({...prev, [msg.id]: e.target.value}))} />
                            <button className="btn btn-primary" onClick={() => sendReply(msg.id)}>
                                <i className="bi bi-send"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <p className="text-muted">No messages yet.</p>
            )}
        </div>
    );
};

export default Messages;