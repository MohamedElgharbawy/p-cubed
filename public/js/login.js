// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

function signInGoogle() {
    const firebaseConfig = {
        apiKey: "AIzaSyD1PjddxLBZKt4-tmH3Txo7EOgr6iKmJUA",
        authDomain: "p-cubed-ecbe5.firebaseapp.com",
        projectId: "p-cubed-ecbe5",
        storageBucket: "p-cubed-ecbe5.appspot.com",
        messagingSenderId: "536291594426",
        appId: "1:536291594426:web:4588e19b29e58563d53283",
        measurementId: "G-ZRGMCG79C0"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            location.href = '../html/home.html';
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}

document.querySelector('#signInButton').addEventListener('click', signInGoogle)