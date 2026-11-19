export function CornerAccent({
  color = "electric",
  size = 34,
  width,
  height,
}: {
  color?: "electric" | "orange";
  size?: number;
  width?: number;
  height?: number;
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0"
      style={{
        width: width ?? size,
        height: height ?? size,
        backgroundColor: color === "electric" ? "var(--color-electric)" : "var(--color-orange)",
        clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)",
      }}
    />
  );
}
