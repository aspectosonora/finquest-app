import { requireCurrentUser } from "@/lib/auth/current-user";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  if (!user.team.onboardingCompletedAt) {
    const { redirect } = await import("next/navigation");
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1 px-4 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
