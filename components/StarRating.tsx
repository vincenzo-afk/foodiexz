import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  size?: number
  /** When set, the stars become interactive and `onChange` fires on click. */
  onChange?: (value: number) => void
  className?: string
}

/**
 * Consistent app-wide star rating.
 * - Displays `value` as a 1..5 score with full/half/empty fills.
 * - Renders an inline numeric label (e.g. "4.6") when value >= 1 and `onChange` is not set,
 *   matching how major delivery apps show ratings next to the stars.
 */
export function StarRating({ value, size = 14, onChange, className }: StarRatingProps) {
  const interactive = !!onChange

  const stars = [1, 2, 3, 4, 5].map((n) => {
    const fill = value >= n ? "full" : value >= n - 0.5 ? "half" : "empty"
    return (
      <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
        <Star
          width={size}
          height={size}
          className="text-muted-foreground/30"
          strokeWidth={1.5}
        />
        {fill !== "empty" && (
          <Star
            width={size}
            height={size}
            strokeWidth={1.5}
            className={
              fill === "half"
                ? "text-foreground fill-foreground/60 [clip-path:inset(0_50%_0_0)]"
                : "text-foreground fill-foreground"
            }
          />
        )}
      </span>
    )
  })

  if (interactive) {
    return (
      <div className={`inline-flex items-center gap-0.5 ${className || ""}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              width={size}
              height={size}
              className={n <= value ? "text-foreground fill-foreground" : "text-muted-foreground/30"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className || ""}`}>
      {stars}
      {value >= 1 && <span className="text-xs font-semibold">{value.toFixed(1)}</span>}
    </span>
  )
}

export default StarRating
