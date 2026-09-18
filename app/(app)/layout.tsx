import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <DesktopNav />
      <div className="flex min-h-dvh w-full flex-1 flex-col">
        <main className="flex-1 pb-24 md:pb-10">
          <div className="mx-auto w-full max-w-xl px-4 pt-page md:max-w-4xl md:px-10 md:pt-10">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
