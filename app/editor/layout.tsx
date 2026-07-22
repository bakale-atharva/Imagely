import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";
import RequireSignIn from "@/components/RequireSignIn";

export default async function EditorLayout({ children }: { children: ReactNode }) {
  await auth.protect();
  return <RequireSignIn>{children}</RequireSignIn>;
}
