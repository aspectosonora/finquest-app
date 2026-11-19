import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-1">
        <Image
          src="/assets/identidad/logo_finquest.png"
          alt="FinQuest"
          width={220}
          height={55}
          priority
          className="h-10 w-auto"
        />
        <span className="font-heading text-sm font-bold italic uppercase tracking-wider text-ink/70">
          Juntos subimos de nivel
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
