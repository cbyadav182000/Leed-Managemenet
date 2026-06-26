import { redirect } from "next/navigation";

/**
 * Root page — redirects to the lead capture form.
 * The dashboard is the primary destination for authenticated users.
 */
export default function HomePage() {
  redirect("/lead");
}
