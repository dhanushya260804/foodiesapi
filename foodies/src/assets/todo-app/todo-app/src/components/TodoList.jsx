// TodoList.jsx — Sortable list with DnD support
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete, onEdit, onReorder }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (todos.length === 0) {
    return (
      <div className="card todo-list-card">
        <div className="empty-state">
          <span className="empty-icon">✓</span>
          <p>No tasks here. Add one above to get started!</p>
        </div>
      </div>
    );
  }

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex(t => t.id === active.id);
    const newIndex = todos.findIndex(t => t.id === over.id);
    onReorder(arrayMove(todos, oldIndex, newIndex));
  };

  const activeTodo = todos.find(t => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="card todo-list-card">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay — ghost element while dragging */}
      <DragOverlay>
        {activeTodo ? (
          <div className="card" style={{ opacity: 0.9, padding: '14px 20px', fontSize: '0.95rem' }}>
            {activeTodo.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
