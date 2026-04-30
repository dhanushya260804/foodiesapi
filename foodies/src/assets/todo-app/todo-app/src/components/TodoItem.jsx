// TodoItem.jsx — Individual task item with edit, delete, complete, drag
import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Priority config
const PRIORITY_CONFIG = {
  high:   { dot: '🔴', label: 'High',   className: 'priority-high' },
  medium: { dot: '🟡', label: 'Medium', className: 'priority-medium' },
  low:    { dot: '🟢', label: 'Low',    className: 'priority-low' },
};

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (date < today) return { label: 'Overdue', overdue: true };
  if (date.getTime() === today.getTime()) return { label: 'Today', overdue: false };
  if (date.getTime() === tomorrow.getTime()) return { label: 'Tomorrow', overdue: false };
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}

// Checkmark SVG
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editRef = useRef(null);

  // dnd-kit sortable
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editing && editRef.current) editRef.current.focus();
  }, [editing]);

  const saveEdit = () => {
    onEdit(todo.id, editText);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditText(todo.text);
    setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const priority = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
  const dateInfo = formatDate(todo.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item todo-item-enter${todo.completed ? ' completed' : ''}`}
    >
      {/* Drag handle */}
      <span className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </span>

      {/* Checkbox */}
      <div
        className={`custom-checkbox${todo.completed ? ' checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        role="checkbox"
        aria-checked={todo.completed}
        tabIndex={0}
        onKeyDown={e => e.key === ' ' && onToggle(todo.id)}
      >
        {todo.completed && <CheckIcon />}
      </div>

      {/* Content */}
      <div className="todo-content">
        {editing ? (
          <input
            ref={editRef}
            className="edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={saveEdit}
            maxLength={200}
          />
        ) : (
          <div className="todo-text" onDoubleClick={() => !todo.completed && setEditing(true)}>
            {todo.text}
          </div>
        )}

        {/* Meta: priority tag + due date */}
        <div className="todo-meta">
          <span className={`priority-tag ${priority.className}`}>
            {priority.dot} {priority.label}
          </span>
          {dateInfo && (
            <span className={`due-date${dateInfo.overdue ? ' overdue' : ''}`}>
              📅 {dateInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="item-actions">
        {editing ? (
          <button className="icon-btn save" onClick={saveEdit} title="Save">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 7l3.5 3.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button
            className="icon-btn edit"
            onClick={() => setEditing(true)}
            title="Edit task"
            disabled={todo.completed}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <button className="icon-btn delete" onClick={() => onDelete(todo.id)} title="Delete task">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
