import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/new-order");
    }
  } else {
    redirect("/login");
  }
}
