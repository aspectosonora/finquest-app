import { updateMemberAvatarAction } from "@/lib/finance/settings-actions";
import { Avatar } from "@/components/ui/Avatar";
import type { AvatarKey } from "@/generated/prisma/enums";

const OPTIONS: { key: AvatarKey; label: string }[] = [
  { key: "JULIO", label: "Avatar Julio" },
  { key: "CINTHYA", label: "Avatar Cinthya" },
  { key: "CUSTOM", label: "Iniciales" },
];

export function AvatarPicker({
  userId,
  name,
  currentAvatarKey,
}: {
  userId: string;
  name: string;
  currentAvatarKey: string;
}) {
  return (
    <div>
      <p className="mb-2 font-heading text-sm font-bold uppercase text-ink/60">{name}</p>
      <div className="flex gap-3">
        {OPTIONS.map((option) => (
          <form key={option.key} action={updateMemberAvatarAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="avatarKey" value={option.key} />
            <button
              type="submit"
              aria-label={option.label}
              className={`rounded-full p-0.5 ${currentAvatarKey === option.key ? "ring-2 ring-electric" : ""}`}
            >
              <Avatar avatarKey={option.key} name={name} size={48} />
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
