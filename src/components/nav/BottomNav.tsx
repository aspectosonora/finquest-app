"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/constants/nav";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { QuickAddFab } from "@/components/nav/QuickAddSheet";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[440px] items-center justify-around bg-electric px-1"
      style={{ minHeight: 64 }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
      ))}

      <div className="flex flex-1 items-center justify-center">
        <QuickAddFab />
      </div>
    </nav>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="flex flex-1 items-center justify-center rounded-xl py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-colors",
          active && "bg-white/20"
        )}
      >
        <MaskIcon src={item.icon} size={28} className="bg-white" />
        <span
          className={cn(
            "font-sans text-[10.5px] font-semibold uppercase tracking-wide text-white",
            active ? "opacity-100" : "opacity-75"
          )}
        >
          {item.label}
        </span>
      </span>
    </Link>
  );
}
