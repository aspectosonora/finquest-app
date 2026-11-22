import { setDebtStrategyAction } from "@/lib/finance/debt-actions";

export function DebtStrategyToggle({ current }: { current: "MANUAL" | "SNOWBALL" | "AVALANCHE" }) {
  return (
    <div className="relative mt-3 flex items-center gap-2 border-t border-white/20 pt-3">
      <StrategyButton strategy="SNOWBALL" label="Bola de nieve" active={current === "SNOWBALL"} />
      <StrategyButton strategy="AVALANCHE" label="Avalancha" active={current === "AVALANCHE"} />
    </div>
  );
}

function StrategyButton({
  strategy,
  label,
  active,
}: {
  strategy: "SNOWBALL" | "AVALANCHE";
  label: string;
  active: boolean;
}) {
  return (
    <form action={setDebtStrategyAction} className="flex-1">
      <input type="hidden" name="strategy" value={strategy} />
      <button
        type="submit"
        className={`w-full rounded-xl py-2 font-heading text-xs font-extrabold uppercase tracking-wide ${
          active ? "bg-white text-electric" : "bg-white/15 text-white"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
