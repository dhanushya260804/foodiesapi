// FilterBar.jsx — Filter tabs + clear completed button + progress bar
export default function FilterBar({ filter, setFilter, todos, onClearCompleted }) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <>
      {/* Progress bar */}
      {total > 0 && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Progress</span>
            <span>{completed}/{total} done</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div className="filter-bar">
        {[
          { key: 'all',       label: `All (${total})` },
          { key: 'pending',   label: `Pending (${pending})` },
          { key: 'completed', label: `Completed (${completed})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
        <div className="filter-spacer" />
        {completed > 0 && (
          <button className="clear-btn" onClick={onClearCompleted}>
            Clear done
          </button>
        )}
      </div>
    </>
  );
}
