// backend/src/config/firebase.js
require("dotenv").config();
const firebase = require("firebase/app");
const admin = require('firebase-admin');
const serviceAccount = require("../../FirebaseService.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithCredential,
    GoogleAuthProvider
} = require("firebase/auth") ;

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

module.exports = {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithCredential,
    GoogleAuthProvider,
    admin
};

firebase.initializeApp(firebaseConfig);