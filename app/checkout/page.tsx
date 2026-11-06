import { redirect } from "next/navigation";

/** The demo checkout flow is gone: signing up is one wizard at /register. */
export default function Page() {
  redirect("/register");
}
