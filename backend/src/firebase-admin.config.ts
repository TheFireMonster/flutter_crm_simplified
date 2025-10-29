import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK. Prefer a service account JSON supplied via
// environment variable to avoid committing credentials to the repo.
//
// If you set FIREBASE_SERVICE_ACCOUNT_JSON (the full JSON content) on the
// environment (for example in Render secrets), this will parse it and use
// admin.credential.cert(). Otherwise it will fall back to applicationDefault()
// which still supports GOOGLE_APPLICATION_CREDENTIALS pointing to a file.
const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_ADMIN_JSON;

if (!admin.apps.length) {
  if (saJson) {
    try {
      const parsed = JSON.parse(saJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsed as any),
      });
    } catch (err) {
      // If parsing fails, fall back to applicationDefault and surface an error.
      // The process should still start but admins should fix the env value.
      // eslint-disable-next-line no-console
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err);
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}