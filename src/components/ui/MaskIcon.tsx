import clsx from "clsx";

/**
 * Pinta un SVG monocromo (iconos de navegación/interfaz exportados en
 * blanco) con cualquier color de fondo vía CSS mask, sin tocar el archivo
 * original ni sustituirlo por un icono genérico.
 */
export function MaskIcon({
  src,
  size = 24,
  className,
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx("inline-block shrink-0", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      aria-hidden
    />
  );
}
