// central.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { GOOGLE_API_KEY } from "./config.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 🔐 Charger la clé API depuis les variables d'environnement
const firebaseApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

// 🔐 Configuration Firebase de Oridium Central
const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "oridium-central.firebaseapp.com",
  projectId: "oridium-central",
  storageBucket: "oridium-central.firebasestorage.app",
  messagingSenderId: "521644806669",
  appId: "1:521644806669:web:88722b2b2706acc453bb44",
  measurementId: "G-3LKCPNPMYP" // ce champ est ignoré ici
};

// ⚙️ Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔑 Sélection des éléments HTML
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");

const dashboard = document.getElementById("dashboard");
const loginContainer = document.getElementById("login-container");
const logoutBtn = document.getElementById("logout");

// 🎯 Gérer la connexion
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginError.textContent = "";
    })
    .catch((error) => {
      loginError.textContent = "❌ " + error.message;
    });
});

// 👁️ Suivre la session
onAuthStateChanged(auth, (user) => {
  if (user) {
    dashboard.style.display = "block";
    loginContainer.style.display = "none";
  } else {
    dashboard.style.display = "none";
    loginContainer.style.display = "block";
  }
});

// 🔓 Déconnexion
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});