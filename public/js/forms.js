import { firebaseApp, db, firebaseConfig } from '../firebase/config.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
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
                                                "questionItem": {
                                                    "question": {
                                                        "required": true,
                                                        "textQuestion": {
                                                            "paragraph": false
                                                        }
                                                    }
                                                },
                                                "title": "Full Name"
                                            },
                                            "location": {
                                                "index": 0
                                            }
                                        }
                                    },
                                    {
                                        "createItem": {
                                            "item": {
                                                "questionItem": {
                                                    "question": {
                                                        "required": true,
                                                        "textQuestion": {
                                                            "paragraph": false
                                                        }
                                                    }
                                                },
                                                "title": "Student ID"
                                            },
                                            "location": {
                                                "index": 1
                                            }
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
                                                "title": "Section selection",
                                                "description": "Please select a response for every row."
                                            },
                                            "location": {
                                                "index": 2
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
            } else {
                reject()
            }
        })
    })
}

async function getGoogleFormResponses(formId) {
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
                        await gapi.client.init({
                            apiKey: firebaseConfig.apiKey,
                            clientId: firebaseConfig.clientId,
                            discoveryDocs: firebaseConfig.discoveryDocs,
                            scope: firebaseConfig.scopes.join(' '),
                            plugin_name: 'p-cubed'
                        })
                        // Loading is finished, so start the app
                        .then(async function () {
                            let token = getCookie('token')
                            await gapi.client.setToken({
                                access_token: token
                            })

                            let form = await gapi.client.forms.forms.get({
                                'formId': formId
                            })

                            const questionMap = getQuestionMap(form)

                            let formResponses = await gapi.client.forms.forms.responses.list({
                                'formId': formId
                            })
                            
                            var result = formatFormResponses(formResponses, questionMap)
                            resolve(result)
                        })
                    });
                }
                document.getElementsByTagName('body')[0].appendChild(script);
            } else {
                reject()
            }
        })
    })
}

function getQuestionMap(form) {
    var result = {}
    for (var i = 0; i < form["result"]["items"].length; i++) {
        var item = form["result"]["items"][i]
        if (item["title"] == "Full Name") {
            result["Name"] = item["questionItem"]["question"]["questionId"]
        }
        else if (item["title"] == "Student ID") {
            result["SID"] = item["questionItem"]["question"]["questionId"]
        }
        else {
            var sections = {}
            for (var j = 0; j < item["questionGroupItem"]["questions"].length; j++) {
                var sectionQuestion = item["questionGroupItem"]["questions"][j]
                sections[sectionQuestion["questionId"]] = sectionQuestion["rowQuestion"]["title"]
            }
            result["Sections"] = sections   
        }
    }
    return result
}

function formatFormResponses(formResponses, questionMap) {
    var result = []
    for (var i = 0; i < formResponses['result']['responses'].length; i++) {
        var individualResponse = formResponses['result']['responses'][i]['answers']
        var individualAnswer = {}
        individualAnswer["Name"] = individualResponse[questionMap["Name"]]["textAnswers"]["answers"][0]["value"]
        individualAnswer["SID"] = individualResponse[questionMap["SID"]]["textAnswers"]["answers"][0]["value"]
        var sections = {}
        for (var sectionId in questionMap["Sections"]) {
            var sectionAvailability = individualResponse[sectionId]["textAnswers"]["answers"][0]["value"]
            sections[questionMap["Sections"][sectionId]] = sectionAvailability
        }
        individualAnswer["Sections"] = sections
        result.push(individualAnswer)
    }
    return result
}

export { createGoogleForm, getGoogleFormResponses }