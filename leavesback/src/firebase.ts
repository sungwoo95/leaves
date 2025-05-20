// firebaseAdmin.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      require(process.env.SERVICE_ACCOUNT_KEY as string)
    ),
  });
}

const auth = admin.auth();

export { auth };
export default admin;
