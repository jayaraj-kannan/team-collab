import { adminDb } from '../src/lib/firebase-admin';

async function testFirebase() {
  try {
    console.log("Checking Firestore connection...");
    const collections = await adminDb.listCollections();
    console.log("Success! Collections found:", collections.map(c => c.id));
    process.exit(0);
  } catch (error) {
    console.error("Firebase Connection Error:", error);
    process.exit(1);
  }
}

testFirebase();
