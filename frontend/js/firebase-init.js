// GAFINCY - Firebase SDK Initialization
// File: frontend/js/firebase-init.js

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoQeYNIyeuFNKK0vWJfVccIoAKThCymXk",
  authDomain: "gafincy-unkartur.firebaseapp.com",
  projectId: "gafincy-unkartur",
  storageBucket: "gafincy-unkartur.firebasestorage.app",
  messagingSenderId: "42876951417",
  appId: "1:42876951417:web:370152743a6b849642eda8",
  measurementId: "G-V9LXP6XLWP"
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// URL base untuk API backend Anda
// Sesuaikan jika server PHP Anda berjalan di port atau path yang berbeda
// BENAR (karena menggunakan 'G' besar, sesuai nama folder):
const API_BASE_URL = 'http://localhost/GAFINCY/backend/api'; 
// Contoh di atas mengasumsikan Anda menempatkan proyek di dalam htdocs/gafincy/
// dan web server (XAMPP/WAMP) berjalan di port 80.
