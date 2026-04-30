// AddTask.jsx — Form to add a new task with priority and due date
import { useState } from 'react';

export default function AddTask({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text, priority, dueDate);
    setText('');
    setPriority('medium');
    setDueDate('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="card add-task-card">
      {/* Main input row */}
      <div className="add-task-row">
        <input
          className="task-input"
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
        />
        <button className="add-btn" onClick={handleSubmit}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Task
        </button>
      </div>

      {/* Priority & Date row */}
      <div className="task-meta-row">
        <select
          className="meta-select"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">🟢 Low Priority</option>
        </select>
        <input
          className="date-input"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
}
