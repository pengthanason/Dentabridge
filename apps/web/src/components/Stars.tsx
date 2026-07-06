export default function Stars({
  rating,
  size = "text-xs",
}: {
  rating: number;
  size?: string;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className={`${size} text-amber leading-none`} aria-label={`คะแนน ${rating}`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}</span>
    </span>
  );
}
