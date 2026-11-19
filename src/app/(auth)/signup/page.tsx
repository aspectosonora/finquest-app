import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-mist bg-white p-5">
      <h1 className="font-display text-2xl text-ink">Crear su equipo</h1>
      <p className="text-sm text-ink/60">
        Empiezas tú; después invitas a tu pareja con un código privado desde Equipo.
      </p>
      <SignupForm />
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
