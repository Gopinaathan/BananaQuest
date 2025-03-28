import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC_ctx3YzO5Dxj9s2rfFhKeJAWSJFD8hWE",
  authDomain: "bananaquest.firebaseapp.com",
  projectId: "bananaquest",
  storageBucket: "bananaquest.firebasestorage.app",
  messagingSenderId: "370734344726",
  appId: "1:370734344726:web:65e537e881665995332337",
  measurementId: "G-WRYKSJLWNF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;