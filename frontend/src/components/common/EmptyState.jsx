// EmptyState.jsx
export function EmptyState({ emoji = '🌸', title, desc, action, actionLabel }) {
  return (
    <div className="text-center py-16 px-4">
      <span className="text-6xl block mb-4">{emoji}</span>
      <h3 className="font-serif text-xl text-gray-600 mb-2">{title}</h3>
      {desc && <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{desc}</p>}
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Go Back'}
        </button>
      )}
    </div>
  );
}