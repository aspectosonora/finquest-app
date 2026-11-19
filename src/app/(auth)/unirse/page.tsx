import Link from "next/link";
import { JoinForm } from "./JoinForm";

export default function UnirsePage() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-mist bg-white p-5">
      <h1 className="font-display text-2xl text-ink">Únete a tu equipo</h1>
      <p className="text-sm text-ink/60">Pide el código de invitación a tu pareja (lo encuentra en Equipo).</p>
      <JoinForm />
      <p className="text-center text-sm text-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-electric">
          Entra aquí
        </Link>
        .
      </p>
    </div>
  );
}
