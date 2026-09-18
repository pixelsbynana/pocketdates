import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect("/discover");

  return <LandingPage />;
}
