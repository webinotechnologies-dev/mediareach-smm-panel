import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const headersList = headers();
  const host = (
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    ""
  ).toLowerCase();
  const isPublicDomain = host.includes("mediareachdigital.com");

  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN" && !isPublicDomain) {
      redirect("/admin/dashboard");
    } else {
      redirect("/new-order");
    }
  } else {
    redirect("/login");
  }
}
