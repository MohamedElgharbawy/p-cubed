import { firebaseApp, db, firebaseConfig } from '../firebase/config.js'
import { getAuth, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import { getCookie } from './utils.js';

async function createGoogleSheet(sheetsDetails) {
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
                            const response = await gapi.client.sheets.spreadsheets.create({
                                'properties': {
                                    'title': sheetsDetails['title']
                                },
                                'sheets': [
                                    {
                                        'properties': {
                                            'title': "TAs",
                                            'index': 0
                                        }
                                    },
                                    {
                                        'properties': {
                                            'title': "Students",
                                            'index': 1
                                        }
                                    }
                                ]
                            })
                            const result = {
                                "spreadsheetID": response["result"]["spreadsheetId"],
                                "spreadsheetUrl": response["result"]["spreadsheetUrl"],
                                "taSheetID": response["result"]["sheets"][0]["properties"]["sheetId"],
                                "studentSheetID": response["result"]["sheets"][1]["properties"]["sheetId"]
                            }
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

async function exportModelToSheets(sheetsInfo, modelOutput, taOrStudent) {
    if (taOrStudent.toLowerCase() === "ta") {
        var sheetId = sheetsInfo["taSheetID"]
        var sheet = "TAs"
    } else {
       var sheetId = sheetsInfo["studentSheetID"]
       var sheet = "Students"
    }
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

                            const range = `${sheet}!A:C`

                            // Delete columns
                            await gapi.client.sheets.spreadsheets.values.clear({
                                spreadsheetId: sheetsInfo['spreadsheetID'],
                                range: range
                            })
                            console.log("Deleted Columns")
                        })
                        .then(async function () {
                            // Rewrite columns (including header)
                            const range = `${sheet}!A:C`
                            // const range = `${sheet}!A1:C${totalNumberEntries}`
                            const values = modelOutputToLists(modelOutput)
                            console.log(values)
                            await gapi.client.sheets.spreadsheets.values.update({
                                spreadsheetId: sheetsInfo['spreadsheetID'],
                                valueInputOption: "RAW",
                                range: range,
                                majorDimension: "ROWS",
                                values: values
                            })
                            console.log("Wrote Values")
                        })
                        .then(async function () {
                            const totalNumberEntries = getTotalNumberEntries(modelOutput)
                            // Format column headers (bold + auto-resize column widths)
                            await gapi.client.sheets.spreadsheets.batchUpdate({
                                spreadsheetId: sheetsInfo['spreadsheetID'],
                                requests: [
                                    {
                                        repeatCell: {
                                            range: {
                                                sheetId: sheetId,
                                                startRowIndex: 0,
                                                endRowIndex: 1
                                            },
                                            cell: {
                                                userEnteredFormat: {
                                                    textFormat: {
                                                        bold: true
                                                    }
                                                }
                                            },
                                            fields: "userEnteredFormat.textFormat.bold"
                                        }
                                    },
                                    {
                                        autoResizeDimensions: {
                                            dimensions: {
                                                sheetId: sheetId,
                                                dimension: "COLUMNS",
                                                startIndex: 0,
                                                endIndex: 3
                                            }
                                        }
                                    }
                                ]
                            })

                            resolve()
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

function getSheetsUrl(spreadSheetID, sheetID) {
    return `https://docs.google.com/spreadsheets/d/${spreadSheetID}/edit?ouid=${sheetID}`
}

function getTotalNumberEntries(modelOutput) {
    var totalNumberEntries = 0
    for (const [_, value] of Object.entries(modelOutput)) {
        totalNumberEntries += value.length
    }
    return totalNumberEntries
}

function modelOutputToLists(modelOutput) {
    var result = []
    result.push(["Section", "Name", "Student ID"])
    for (const [key, value] of Object.entries(modelOutput)) {
        value.forEach(function (person) {
            result.push([key, person['Name'], person['SID']])
        })
    }

    return result
}

export { createGoogleSheet, exportModelToSheets, getSheetsUrl }