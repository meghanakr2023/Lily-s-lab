// Pagination.jsx
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 rounded-full bg-white text-gray-400 hover:bg-pink-50 disabled:opacity-30 transition-all text-sm">
        ‹
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-petal' : 'bg-white text-gray-500 hover:bg-pink-50'}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 rounded-full bg-white text-gray-400 hover:bg-pink-50 disabled:opacity-30 transition-all text-sm">
        ›
      </button>
    </div>
  );
}