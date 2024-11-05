// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,

};

// Initialize Firebase
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and set persistence
const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence);

// Initialize Firebase Functions
const functions = getFunctions(app);

// Optionally initialize Firebase Analytics
const analytics = getAnalytics(app);

// Export the initialized Firebase app, functions, and other services
export {app, functions, httpsCallable, auth, analytics};