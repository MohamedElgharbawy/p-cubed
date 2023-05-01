import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { firebaseApp, db } from '../firebase/config.js';
import { withUser } from "./auth.js";
import { getUUID } from './utils.js';

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
        section = await getDoc(sectionRef);
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

async function addForm(sectionId, formId, sectionTimes, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                formID: formId,
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
                formID: null
            }
        });
    });
}


async function getFormId(sectionId, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        const section = await getDoc(sectionRef)
        return section.data()[taOrStudent]["formID"]
    })
}

async function addSheets(sectionId, sheetsId, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                sheetsID: sheetsId
            }
        })
    })
}

async function deleteSheets(sectionId, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId);
        await updateDoc(sectionRef, {
            [taOrStudent]: {
                sheetsID: null
            }
        });
    });
}

async function getSheetsId(sectionId, taOrStudent) {
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        const section = await getDoc(sectionRef)
        return section.data()[taOrStudent]["sheetsID"]
    })
}

export { addSection, updateSection, getSection, deleteSection, addForm, 
    getFormId, addSheets, getSheetsId, deleteForm, deleteSheets }