// Generated dot-wave texture for dark panels. Dots of a similar size share one
// path, so the page stays light even with hundreds of them.
const SIZES = [0.8, 1.4, 2, 2.7, 3.4];

export function DotField({
  cols = 56,
  rows = 22,
  className = "",
}: {
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const paths: string[] = SIZES.map(() => "");
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const wave = Math.sin(x * 0.24 + y * 0.42) * Math.cos(x * 0.09 - y * 0.27);
      const size = Math.min(SIZES.length - 1, Math.floor(((wave + 1) / 2) * SIZES.length));
      paths[size] += `M${x * 12 + 6} ${y * 12 + 6}h0`;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols * 12} ${rows * 12}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {SIZES.map((size, i) => (
        <path key={size} d={paths[i]} strokeWidth={size} opacity={0.14 + i * 0.14} />
      ))}
    </svg>
  );
}

export default DotField;
