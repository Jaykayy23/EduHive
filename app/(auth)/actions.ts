"use server";

import { cookies } from "next/headers";
import { authSessions, validateRequest } from "../auth";
import { redirect } from "next/navigation";

export async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await authSessions.invalidateSession(session.id);

  const sessionCookie = await authSessions.createBlankSessionCookie();

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
