const admin = require("firebase-admin");

console.log("Private Key Before Replace:", process.env.FIREBASE_PRIVATE_KEY);
console.log("Private Key After Replace:", process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

module.exports = admin;
