import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  try {
    // Use the path from environment variables, or fallback to default 'sa.json'
    const saRelativePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'sa.json';
    const saPath = path.isAbsolute(saRelativePath) 
      ? saRelativePath 
      : path.join(process.cwd(), saRelativePath);

    if (fs.existsSync(saPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("🔥 Firebase Admin: Initialized using file at", saPath);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      // Fallback to environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log("🔥 Firebase Admin: Initialized via Environment Variables");
    } else {
      console.warn("⚠️ Firebase Admin: No credentials found. Skipping initialization (expected during build).");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Failed:", error);
  }
}

// Use a Proxy to lazily initialize the database and auth
// This prevents "No Firebase App" errors during the Next.js build process
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop, receiver) {
    if (!admin.apps.length) return undefined;
    return Reflect.get(admin.firestore(), prop, receiver);
  }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop, receiver) {
    if (!admin.apps.length) return undefined;
    return Reflect.get(admin.auth(), prop, receiver);
  }
});
