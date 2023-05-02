import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { firebaseApp, db } from '../firebase/config.js';
import { withUser } from "./auth.js";
import { getUUID } from './utils.js';
import { createGoogleForm } from './forms.js'
import { createGoogleSheet } from './sheets.js';

async function addSection(courseId, sectionType, sectionName) {
    await withUser(async (_) => {
        const sectionUuid = getUUID();
        const section = {
            name: sectionName,
            uuid: sectionUuid,
            ta: {
                formId: null,
                sheetsId: null,
                sectionTimes: []
            },
            student: {
                formId: null,
                sheetsId: null,
                sectionTimes: []
            }
        }
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            [sectionType]: arrayUnion(sectionUuid)
        });

        const sectionRef = doc(db, 'sections', sectionUuid);
        await setDoc(sectionRef, section, { merge: true });
    });
}

async function updateSection(section) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', section.uuid);
        await updateDoc(sectionRef, section);
    });
}

async function getSection(sectionId) {
    var section = null; 
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId);
        var sectionDoc = await getDoc(sectionRef);
        section = sectionDoc.data();
    });
    return section;
}

async function deleteSection(courseId, sectionType, sectionId) {
    await withUser(async (_) => {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            [sectionType]: arrayRemove(sectionId)
        });

        const sectionRef = doc(db, 'sections', sectionId)
        await deleteDoc(sectionRef)
    });
}

async function addForm(formDetails, sectionId, taOrStudent) {
    await withUser(async (_) => {
        const formResult = await createGoogleForm(formDetails)

        var sectionTimes = []
        for (var i = 0; i < formDetails['sections'].length; i++) {
            var section = formDetails['sections'][i]
            var sectionTime = section["day"] + " " + section["startTime"] + "-" + section["endTime"]
            sectionTimes.push(sectionTime)
        }

        const sectionRef = doc(db, 'sections', sectionId)
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                formID: formResult["formId"],
                formUrl: formResult["formUrl"],
                sectionTimes: sectionTimes
            }
        })
    })
}

async function deleteForm(sectionId, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId);
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                formID: null,
                formUrl: null
            }
        });
    });
}


async function getFormId(sectionId, taOrStudent) {
    var result;
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        const sectionDoc = await getDoc(sectionRef)
        result = sectionDoc.data()[taOrStudent]["formID"]
    })
    return result;
}

async function addSheets(sheetsDetails, sectionId, taOrStudent) {
    const sheetsResult = await createGoogleSheet(sheetsDetails)
    
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        if (taOrStudent == "ta") {
            var sheetsID = sheetsResult["taSheetID"]
        } else {
            var sheetsID = sheetsResult["studentSheetID"]
        }
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                spreadsheetID: sheetsResult["spreadsheetID"],
                sheetsUrl: sheetsResult["spreadsheetUrl"],
                sheetsID: sheetsID
            }
        })
    })
}

async function getSheetsId(sectionId, taOrStudent) {
    var result;
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        const section = await getDoc(sectionRef)
        result = section.data()[taOrStudent]["sheetsID"]
    })
    return result;
}

export { addSection, updateSection, getSection, deleteSection, addForm, 
    getFormId, addSheets, getSheetsId, deleteForm }