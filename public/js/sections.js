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
    await withUser(async (_) => {
        const sectionRef = doc(db, 'sections', sectionId)
        return await getDoc(sectionRef)
    });
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

export { addSection, updateSection, getSection, deleteSection }