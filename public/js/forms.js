import { firebaseApp, db, firebaseConfig } from '../firebase/config.js'
import { getAuth, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import { getCookie } from './utils.js';

async function createGoogleForm(formDetails) {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
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
                            plugin_name: 'p-cubed'
                        })
                            // Loading is finished, so start the app
                            .then(async function () {
                                let token = getCookie('token')
                                gapi.client.setToken({
                                    access_token: token
                                })
                                // You cannot use JSON.Stringify here (not compatible with API)
                                // You can only set the title on create
                                const response = await gapi.client.forms.forms.create({
                                    'info': {
                                        'title': formDetails['title']
                                    }
                                })
                                return response["result"]
                            })
                            .then(async function (result) {
                                // Name the file in Google Drive
                                await gapi.client.load('drive', 'v2', async function () {
                                    await gapi.client.drive.files.patch({
                                        'fileId': result['formId'],
                                        'resource': {
                                            'title': formDetails['title']
                                        }
                                    })
                                })
                                return result
                            })
                            .then(async function (result) {
                                var questions = []
                                for (var i = 0; i < formDetails['sections'].length; i++) {
                                    var section = formDetails['sections'][i]
                                    questions.push({
                                        'required': true,
                                        'rowQuestion': {
                                            'title': section["day"] + " " + section["startTime"] + "-" + section["endTime"]
                                        }
                                    })
                                }

                                const response = await gapi.client.forms.forms.batchUpdate({
                                    'formId': result['formId'],
                                    'includeFormInResponse': true,
                                    'requests': [
                                        {
                                            'updateFormInfo': {
                                                'info': {
                                                    // Title is required again in any info update
                                                    'title': formDetails['title'],
                                                    'description': formDetails['description']
                                                },
                                                'updateMask': '*'
                                            }
                                        },
                                        {
                                            "createItem": {
                                                "item": {
                                                    "questionGroupItem": {
                                                        "grid": {
                                                            "columns": {
                                                                "type": "RADIO",
                                                                "options": [
                                                                    {
                                                                        "value": "Highly prefer"
                                                                    },
                                                                    {
                                                                        "value": "Can make it"
                                                                    },
                                                                    {
                                                                        "value": "Do not prefer but can make it"
                                                                    },
                                                                    {
                                                                        "value": "Cannot make it"
                                                                    }
                                                                ],
                                                                "shuffle": false
                                                            },
                                                            "shuffleQuestions": false
                                                        },
                                                        "questions": questions
                                                    },
                                                    "description": "Please select a response for every row."
                                                },
                                                "location": {
                                                    "index": 0
                                                }
                                            }
                                        }
                                    ]
                                })
                                return response['result']
                            })
                            .then(function (result) {
                                console.log(result)
                                resolve({
                                    'formId': result['form']['formId'],
                                    'formUrl': result['form']['responderUri']
                                })
                            })
                    });
                }
                document.getElementsByTagName('body')[0].appendChild(script);
            }
        })
    })
}
export { createGoogleForm }