import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-mist bg-white p-5">
      <h1 className="font-display text-2xl text-ink">Entrar</h1>
      <LoginForm />
      <p className="text-center text-sm text-ink/60">
        ¿Primera vez?{" "}
        <Link href="/signup" className="font-bold text-electric">
          Crea su equipo
        </Link>{" "}
        o{" "}
        <Link href="/unirse" className="font-bold text-electric">
          únete con un código
        </Link>
        .
      </p>
    </div>
  );
}
