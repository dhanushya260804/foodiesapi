// useTodos.js — Custom hook for all todo state & logic
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'todo-app-tasks';
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useTodos() {
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback((text, priority = 'medium', dueDate = '') => {
    if (!text.trim()) return;
    setTodos(prev => [{
      id: generateId(), text: text.trim(),
      completed: false, priority, dueDate,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const editTodo = useCallback((id, newText) => {
    if (!newText.trim()) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: newText.trim() } : t));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed));
  }, []);

  const reorderTodos = useCallback((newOrder) => {
    setTodos(newOrder);
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted, reorderTodos };
}
