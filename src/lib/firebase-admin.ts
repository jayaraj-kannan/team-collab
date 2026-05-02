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
    } else {
      // Fallback to environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log("🔥 Firebase Admin: Initialized via Environment Variables");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Failed:", error);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
