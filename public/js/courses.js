import { firebaseApp, db } from '../firebase/config.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js'

function addCourse(number, name, term) {
    const auth = getAuth();
    auth.onAuthStateChanged(async function (user) {
        // Seems like a security concern: a user can access any course
        if (user) {
            // User is signed in.
            const course = {
                number: number,
                name: name,
                term: term,
                officeHours: [],
                discussion: [],
                homeworkParty: [],
                lab: [],
                misc: []
            }
            const courseUUID = getUUID()
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                courses: arrayUnion(courseUUID)
            });

            const courseRef = doc(db, 'courses', courseUUID);
            await setDoc(courseRef, course, { merge: true });
        } else {
            // No user is signed in.
            console.log("User is null");
            location.href = '/login';
        }
    });
}

async function getCourses() {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async function (user) {
            if (user) {
                // User is signed in.
                const userRef = doc(db, 'users', user.uid);
                const usersDoc = await getDoc(userRef);
                var courses = []
                if (usersDoc.exists()) {
                    const courseIds = usersDoc.data()['courses']
                    for (let i = 0; i < courseIds.length; i++) {
                        var courseId = courseIds[i]
                        var courseRef = doc(db, 'courses', courseId);
                        var courseDoc = await getDoc(courseRef);
                        if (courseDoc.exists()) {
                            courses.push(courseDoc.data())
                        } else {
                            console.log("Course is null")
                        }
                    }
                    resolve(courses);
                } else {
                    console.log("User does not exist");
                }
            } else {
                // No user is signed in.
                console.log("User is null");
                location.href = '/login';
            }
        }, reject);
    })
}

function getUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export { addCourse, getCourses };
