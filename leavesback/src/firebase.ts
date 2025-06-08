// firebaseAdmin.ts
import admin from 'firebase-admin';

const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_KEY!, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount
    ),
  });
}

export const auth = admin.auth();

