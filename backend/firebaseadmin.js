const admin = require("firebase-admin");

// Logging private key masking for debugging
console.log("Private Key (masked):", process.env.FIREBASE_PRIVATE_KEY.substring(0, 50) + "...");
console.log("Private Key Before Replace:", process.env.FIREBASE_PRIVATE_KEY);
console.log("Private Key After Replace:", process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// Export both auth and admin
const auth = admin.auth(); 

module.exports = { auth, admin };
