import { firebaseApp, db } from '../firebase/config.js'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js'

function signInGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/forms")
    provider.addScope("https://www.googleapis.com/auth/spreadsheets")
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;

            // set account  doc  
            const account = {
                useruid: user.uid,
                courses: []
            }
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef)
            if (!userDoc.exists()) {
                await setDoc(userRef, account, { merge: true });
            }

            location.href = '/';
        }).catch((error) => {
            console.log(error);
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
}

document.querySelector('#signInButton').addEventListener('click', signInGoogle)