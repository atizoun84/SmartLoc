import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, set } 
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

// Liste exhaustive de TOUTES les données de l'application (Mise à jour pour inclure branding et finances)
const COLLECTIONS = [
    'tenants', 
    'houses', 
    'payments', 
    'company', 
    'employees', 
    'mastercode', 
    'agency_withdrawals', 
    'archived_tenants',
    'owners',
    'expenses'
];

const updateStatus = (isOnline) => {
    const container = document.getElementById('sync-status-container');
    if (!container) return;
    if (isOnline) {
        container.innerHTML = `<span style="font-size: 0.65rem; color: #25D366; font-weight: bold; display: flex; align-items: center;"><i class="fas fa-cloud me-1"></i> Synchronisé</span>`;
    } else {
        container.innerHTML = `<span style="font-size: 0.65rem; color: #ffc107; font-weight: bold; display: flex; align-items: center;"><i class="fas fa-cloud-slash me-1"></i> Hors-ligne</span>`;
    }
};

// 1. CLOUD -> LOCAL (Écoute en temps réel)
const startBidirectionalSync = () => {
    COLLECTIONS.forEach(col => {
        const dbRef = ref(db, col);
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                localStorage.setItem(`smartloc_${col}`, JSON.stringify(data));
                
                // Notifie les pages que les données ont changé
                window.dispatchEvent(new CustomEvent('sync_data_updated', { detail: { collection: col } }));
                
                // Cas spécifique : Si la modif concerne la compagnie, on rafraîchit le branding si la fonction existe
                if (col === 'company' && typeof window.loadBranding === 'function') {
                    window.loadBranding();
                }
            }
        });
    });
};

// 2. LOCAL -> CLOUD (Sauvegarde forcée)
const pushToCloud = (collectionName) => {
    const localData = JSON.parse(localStorage.getItem(`smartloc_${collectionName}`));
    if (localData !== null) {
        set(ref(db, collectionName), localData);
    }
};

// Gestion statut connexion
onValue(ref(db, ".info/connected"), (snap) => updateStatus(snap.val() === true));

// Initialisation
startBidirectionalSync();

// Exportation globale pour les pages
window.SmartSync = {
    push: (col) => pushToCloud(col),
    pushAll: () => COLLECTIONS.forEach(col => pushToCloud(col))
};
