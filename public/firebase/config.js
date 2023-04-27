// import { initializeApp } from "firebase/app";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD1PjddxLBZKt4-tmH3Txo7EOgr6iKmJUA",
    authDomain: "p-cubed-ecbe5.firebaseapp.com",
    projectId: "p-cubed-ecbe5",
    storageBucket: "p-cubed-ecbe5.appspot.com",
    messagingSenderId: "536291594426",
    appId: "1:536291594426:web:4588e19b29e58563d53283",
    measurementId: "G-ZRGMCG79C0",
    clientId: "536291594426-t0sulvc8m808tdlqs28bjkcufnt140go.apps.googleusercontent.com",
    scopes: [
        "https://www.googleapis.com/auth/forms",
        "https://www.googleapis.com/auth/spreadsheets"
    ],
    discoveryDocs: [
        "https://forms.googleapis.com/$discovery/rest?version=v1",
        "https://sheets.googleapis.com/$discovery/rest?version=v4"
    ]
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export {firebaseApp, db, firebaseConfig}