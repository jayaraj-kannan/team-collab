import { google } from "googleapis";
import { adminDb } from "./firebase-admin";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function getCalendarEvents(userId: string) {
  // 1. Fetch tokens from Firestore 'accounts' collection
  const accountSnapshot = await adminDb
    .collection("accounts")
    .where("userId", "==", userId)
    .where("provider", "==", "google")
    .limit(1)
    .get();

  if (accountSnapshot.empty) {
    throw new Error("No Google account found for user");
  }

  const accountData = accountSnapshot.docs[0].data();
  const { access_token, refresh_token, expires_at } = accountData;

  // 2. Set credentials
  oauth2Client.setCredentials({
    access_token,
    refresh_token,
    expiry_date: expires_at ? expires_at * 1000 : undefined,
  });

  // 3. Initialize Calendar API
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // 4. Fetch upcoming events
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
}
