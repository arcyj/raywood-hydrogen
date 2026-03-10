type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
};

export function StarRating({rating, max = 5, className = ''}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(max, Math.round(rating)));
  const stars = Array.from({length: max}, (_, index) => index < clamped);

  return (
    <div
      className={`flex items-center gap-1 ${className}`.trim()}
      aria-label={`Rated ${clamped} out of ${max}`}
    >
      {stars.map((isFilled, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={isFilled ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}
