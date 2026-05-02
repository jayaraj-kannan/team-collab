"use server"

import { auth } from "@/auth";
import { getTasks, getCalendar } from "./actions";
import { model } from "@/lib/gemini";

export async function chatWithAssistant(userMessage: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Fetch Context
  const [tasks, events] = await Promise.all([
    getTasks(),
    getCalendar()
  ]);

  // 2. Format Context for Gemini
  const context = `
    USER CONTEXT:
    User Name: ${session.user.name}
    
    CURRENT TASKS:
    ${tasks.length > 0 ? tasks.map((t: any) => `- ${t.title} (Status: ${t.status})`).join('\n') : 'No tasks assigned.'}
    
    UPCOMING CALENDAR EVENTS:
    ${events.length > 0 ? events.map((e: any) => `- ${e.summary} (Start: ${e.start?.dateTime || e.start?.date})`).join('\n') : 'No upcoming events.'}
  `;

  // 3. Send to Gemini
  try {
    const result = await model.generateContent([context, userMessage]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
}
