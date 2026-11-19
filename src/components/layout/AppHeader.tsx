import Image from "next/image";
import Link from "next/link";
import { currentMonthLabel } from "@/lib/date/month";

export function AppHeader() {
  const month = currentMonthLabel();

  return (
    <header
      className="safe-top flex items-center justify-between gap-3 pl-[23px] pr-4"
      style={{ height: 67 }}
    >
      <Link href="/inicio" className="flex flex-col gap-0.5">
        <Image
          src="/assets/identidad/logo_finquest.png"
          alt="FinQuest"
          width={172}
          height={43}
          priority
        />
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-ink/70">
          Juntos subimos de nivel
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <span className="h-10 w-[3px] shrink-0 rotate-[25deg] bg-orange" aria-hidden />
        <span className="rounded-full border-2 border-ink px-4 py-1.5 font-heading text-sm font-extrabold italic uppercase tracking-wide">
          {month}
        </span>
      </div>
    </header>
  );
}
