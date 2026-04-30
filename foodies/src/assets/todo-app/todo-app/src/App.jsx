// App.jsx — Root component, wires everything together
import { useState, useEffect, useMemo } from 'react';
import { useTodos } from './hooks/useTodos';
import AddTask from './components/AddTask';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import './index.css';

export default function App() {
  // Dark/light mode — default to system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('todo-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [filter, setFilter] = useState('all');

  // Apply theme to <html> for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('todo-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const {
    todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted, reorderTodos,
  } = useTodos();

  // Filtered view — memoized so filter doesn't cause expensive re-renders
  const filteredTodos = useMemo(() => {
    if (filter === 'completed') return todos.filter(t => t.completed);
    if (filter === 'pending')   return todos.filter(t => !t.completed);
    return todos;
  }, [todos, filter]);

  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-title-block">
            <h1>My <span>Tasks</span></h1>
            <p className="task-count">
              {pendingCount === 0
                ? todos.length === 0
                  ? 'No tasks yet'
                  : '🎉 All done!'
                : `${pendingCount} task${pendingCount !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        {/* Add task form */}
        <AddTask onAdd={addTodo} />

        {/* Filters + progress */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          todos={todos}
          onClearCompleted={clearCompleted}
        />

        {/* Task list with drag-and-drop */}
        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
          onReorder={(reordered) => {
            // When filtering, we need to merge reordered subset back into full list
            if (filter === 'all') {
              reorderTodos(reordered);
            } else {
              // Merge: replace filtered items in original order
              const ids = new Set(reordered.map(t => t.id));
              const base = todos.filter(t => !ids.has(t.id));
              // Interleave: put reordered items back in their position slots
              const result = [];
              let ri = 0;
              todos.forEach(t => {
                if (ids.has(t.id)) { result.push(reordered[ri++]); }
                else { result.push(t); }
              });
              reorderTodos(result);
            }
          }}
        />
      </div>
    </div>
  );
}
