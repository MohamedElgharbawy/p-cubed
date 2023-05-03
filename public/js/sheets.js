import { firebaseApp, db, firebaseConfig } from '../firebase/config.js'
import { getCookie } from './utils.js';
import { withUser } from './auth.js';

async function createGoogleSheet(sheetsDetails) {
    var sheetsResult;
    await withUser(async (user) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://apis.google.com/js/api.js';
        // Once the Google API Client is loaded, you can run your code
        await new Promise((resolve) => {
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
                        sheetsResult = {
                            "spreadsheetId": response["result"]["spreadsheetId"],
                            // "spreadsheetUrl": response["result"]["spreadsheetUrl"],
                            "taSheetsId": response["result"]["sheets"][0]["properties"]["sheetId"],
                            "studentSheetsId": response["result"]["sheets"][1]["properties"]["sheetId"]
                        }
                        resolve();
                    })
                });
            }
            document.getElementsByTagName('body')[0].appendChild(script);
        })
    });
    return sheetsResult;
}

async function exportModelToSheets(spreadsheetId, sheetId, modelOutput, taOrStudent) {
    var sheet = taOrStudent === "ta" ? "TAs" : "Students"
    await withUser(async (user) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://apis.google.com/js/api.js';
        // Once the Google API Client is loaded, you can run your code
        await new Promise((resolve) => {
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
                            spreadsheetId: spreadsheetId,
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
                            spreadsheetId: spreadsheetId,
                            valueInputOption: "RAW",
                            range: range,
                            majorDimension: "ROWS",
                            values: values
                        })
                        console.log("Wrote Values")
                    })
                    .then(async function () {
                        // const totalNumberEntries = getTotalNumberEntries(modelOutput)
                        // Format column headers (bold + auto-resize column widths)
                        await gapi.client.sheets.spreadsheets.batchUpdate({
                            spreadsheetId: spreadsheetId,
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
                        resolve();
                    })
                });
            }
            document.getElementsByTagName('body')[0].appendChild(script);
        })
    })
}

function getSheetsUrl(spreadSheetID, sheetID) {
    return `https://docs.google.com/spreadsheets/d/${spreadSheetID}/edit#gid=${sheetID}`
}

// function getTotalNumberEntries(modelOutput) {
//     var totalNumberEntries = 0
//     for (const [_, value] of Object.entries(modelOutput)) {
//         totalNumberEntries += value.length
//     }
//     return totalNumberEntries
// }

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