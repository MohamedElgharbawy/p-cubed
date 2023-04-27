import { firebaseApp, db, firebaseConfig } from '../firebase/config.js'
import { getAuth, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import { getCookie } from './utils.js';

// async function createGoogleForm(formDetails) {
//     // Get the current user's ID token
//     const auth = getAuth();
//     return new Promise((resolve, reject) => {
//         auth.onAuthStateChanged(async function (user) {
//             // Get Google Access Token
//             let token = getCookie("token")

//             const formUrl = `https://forms.googleapis.com/forms/v1/forms`

//             // Use the ID token to authenticate with the Google Drive API
//             const response = await fetch(formUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Access-Control-Allow-Origin': '*',
//                     'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     info: {
//                         title: formDetails['title'],
//                         description: formDetails['description']
//                     }
//                 }),
//             });

//             // const response = await fetch('https://www.googleapis.com/drive/v3/files', {
//             //     method: 'POST',
//             //     headers: {
//             //         'Content-Type': 'application/json',
//             //         'Authorization': `Bearer ${token}`,
//             //     },
//             //     body: JSON.stringify({
//             //         name: formDetails['title'],
//             //         propeties:{
//             //             info: {
//             //                 description: "Test description"
//             //             }
//             //         },
//             //         mimeType: 'application/vnd.google-apps.form',
//             //     }),
//             // });

//             // Process the API response
//             if (response.ok) {
//                 const form = await response.json()
//                 const formId = form.id;
//                 const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
//                 const result = {
//                     "formId": formId,
//                     "formUrl": formUrl
//                 }
//                 resolve(result)
//             } else {
//                 console.log(response.text().then(text => { throw new Error(text) }));
//                 console.error('Error creating new form:', response.status);
//                 reject()
//             }
//         })
//     })
// }

async function createGoogleForm(formDetails) {
    const auth = getAuth();
    auth.onAuthStateChanged(function (user) {
        // Make sure there is a valid user object
        if (user) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://apis.google.com/js/api.js';
            // Once the Google API Client is loaded, you can run your code
            script.onload = async function (e) {
                gapi.load('client', async function () {
                    // Initialize the Google API Client with the config object
                    gapi.client.init({
                        apiKey: firebaseConfig.apiKey,
                        clientId: firebaseConfig.clientId,
                        discoveryDocs: firebaseConfig.discoveryDocs,
                        scope: firebaseConfig.scopes.join(' '),
                    })
                    // Loading is finished, so start the app
                    .then(function () {
                        startApp(user);
                    })
                });
            }
            document.getElementsByTagName('body')[0].appendChild(script); 
        }
    })
}

function startApp(user) {
    console.log(user);
    user.getToken()
        .then(function (token) {
            console.log(gapi.client)
            gapi.client.setToken({
                access_token: token
            })
            var request = gapi.client.request(JSON.stringify({
                path: `https://forms.googleapis.com/forms/v1/forms`,
                method: 'POST',
                body: {
                    info: {
                        title: "Test title"
                    }
                }
            }))
            request.execute(printViews);
        })
        .then(function (response) {
            console.log(response);
        });
}

export { createGoogleForm }