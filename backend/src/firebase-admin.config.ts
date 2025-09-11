import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Or service account
});

export { admin };