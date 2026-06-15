// StarRating.jsx
import { FiStar } from 'react-icons/fi';
export function StarRating({ rating, size = 14, showValue = false }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <FiStar key={s} size={size}
            fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
            className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'} />
        ))}
      </div>
      {showValue && <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}