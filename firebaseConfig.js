// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // Apenas getAuth aqui

// Removido: import { Alert } from 'react-native'; // Não vamos mais usar Alert aqui

const firebaseConfig = {
  apiKey: "AIzaSyBfadAAOstbl-Amb84suS1y0GCQ1fLsJMI",
  authDomain: "maniac-air.firebaseapp.com",
  databaseURL: "https://maniac-air-default-rtdb.firebaseio.com",
  projectId: "maniac-air",
  storageBucket: "maniac-air.firebasestorage.app",
  messagingSenderId: "807262169831",
  appId: "1:807262169831:android:e0755a907160d89da99042"
};

let app;
let database;
let auth;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app); // Obtém a instância padrão do Auth
  console.log("Firebase App e Database inicializados com sucesso!");
  // Removido: Alert.alert("Sucesso!", "Firebase App e Database inicializados.");
} catch (e) {
  console.error("Firebase Initialization FAILED:", e);
  // Removido: Alert.alert("Erro Firebase", "Falha na inicialização: " + e.message);
}

// Exportar 'app' é crucial para o _layout.js poder usá-lo para configurar a persistência do Auth.
export { app, database, auth, ref, onValue, set, remove };