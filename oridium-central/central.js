import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 🧠 Récupérer dynamiquement la clé API depuis la route backend
async function getFirebaseConfig() {
  const res = await fetch('/api/get-api-key');
  const data = await res.json();

  return {
    apiKey: data.apiKey,
    authDomain: "oridium-central.firebaseapp.com",
    projectId: "oridium-central",
    storageBucket: "oridium-central.firebasestorage.app",
    messagingSenderId: "521644806669",
    appId: "1:521644806669:web:88722b2b2706acc453bb44"
  };
}

const app = initializeApp(await getFirebaseConfig());
const auth = getAuth(app);

// 🔑 HTML elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const dashboard = document.getElementById("dashboard");
const loginContainer = document.getElementById("login-container");
const logoutBtn = document.getElementById("logout");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => (loginError.textContent = ""))
    .catch((error) => (loginError.textContent = "❌ " + error.message));
});

onAuthStateChanged(auth, (user) => {
  dashboard.style.display = user ? "block" : "none";
  loginContainer.style.display = user ? "none" : "block";
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});