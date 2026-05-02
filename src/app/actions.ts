"use server"

import { adminDb } from "@/lib/firebase-admin";
import { auth, signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { getCalendarEvents } from "@/lib/google-calendar";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  
  if (!title) return;

  await adminDb.collection("tasks").add({
    title,
    status: "TODO",
    projectId: "default",
    assigneeId: session.user.id,
    createdAt: new Date(),
  });

  revalidatePath("/");
}

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const snapshot = await adminDb.collection("tasks")
    .where("assigneeId", "==", session.user.id)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getCalendar() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await getCalendarEvents(session.user.id);
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    return [];
  }
}

export async function handleSignIn() {
  await signIn("google");
}

export async function handleSignOut() {
  await signOut();
}
