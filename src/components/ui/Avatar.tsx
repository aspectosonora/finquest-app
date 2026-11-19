import Image from "next/image";
import clsx from "clsx";

// Recortes propios (sin el margen transparente del original) para que la
// cara llene el círculo del avatar; el PNG original queda intacto en Assets.
const PRESET_AVATARS: Record<string, string> = {
  JULIO: "/assets/identidad/avatar_julio_crop.png",
  CINTHYA: "/assets/identidad/avatar_cinthya_crop.png",
};

export function Avatar({
  avatarKey,
  avatarUrl,
  name,
  size = 56,
  className,
}: {
  avatarKey: string;
  avatarUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const src = avatarUrl ?? PRESET_AVATARS[avatarKey];

  if (!src) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        className={clsx(
          "flex items-center justify-center rounded-full bg-electric font-heading text-white",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={clsx("rounded-full object-cover", className)}
    />
  );
}
