import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove } 
    from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyABuovuwU7mft93kQoXo6tqAVWhAZ4IlpA",
    authDomain: "beci-negoce.firebaseapp.com",
    databaseURL: "https://beci-negoce-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "beci-negoce",
    storageBucket: "beci-negoce.firebasestorage.app",
    messagingSenderId: "622021997082",
    appId: "1:622021997082:web:9bc402604c65c91f3857a3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// MISE À JOUR : On ne liste plus les collections pour le sync manuel, 
// Firebase s'en occupe via son cache interne.

const updateStatus = (isOnline) => {
    const container = document.getElementById('sync-status-container');
    if (!container) return;
    if (isOnline) {
        container.innerHTML = `<span style="font-size: 0.65rem; color: #25D366; font-weight: bold; display: flex; align-items: center;"><i class="fas fa-cloud me-1"></i> Synchronisé (Cloud-First)</span>`;
    } else {
        container.innerHTML = `<span style="font-size: 0.65rem; color: #ffc107; font-weight: bold; display: flex; align-items: center;"><i class="fas fa-cloud-slash me-1"></i> Mode Hors-ligne</span>`;
    }
};

// Gestion statut connexion en temps réel
onValue(ref(db, ".info/connected"), (snap) => updateStatus(snap.val() === true));

// Exportation des outils pour les pages (Suppression de pushToCloud car obsolète)
window.SmartSync = {
    db: db,
    ref: ref,
    onValue: onValue,
    set: set,
    push: push,
    remove: remove
};
