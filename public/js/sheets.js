import { firebaseApp, db } from '../firebase/config.js'
import { getAuth, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import { getCookie } from './utils.js';

async function createGoogleSheet(title) {
    // Get the current user's ID token
    const auth = getAuth();
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async function (user) {
            // Get Google Access Token
            let token = getCookie("token")

            // Use the ID token to authenticate with the Google Drive API
            const response = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    // name: title,
                    mimeType: 'application/vnd.google-apps.spreadsheet',
                }),
                payload: JSON.stringify({
                    info: {
                        title
                    }
                })
            });

            // Process the API response
            if (response.ok) {
                const spreadsheet = await response.json()
                const spreadSheetId = spreadsheet.id
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadSheetId}`
                const result = {
                    "spreadSheetId": spreadSheetId,
                    "spreadsheetUrl": spreadsheetUrl
                }
                resolve(result)
            } else {
                console.log(response.text().then(text => { throw new Error(text) }));
                console.error('Error creating new spreadsheet:', response.status);
                reject()
            }
        })
    })
}

export {createGoogleSheet}