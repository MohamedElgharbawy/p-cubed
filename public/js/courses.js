import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { firebaseApp, db } from '../firebase/config.js';
import { withUser } from "./auth.js";
import { getUUID } from './utils.js';

async function testAuthStuff(number, name, term) {
    let uid = 0;
    await withUser((user) => {
        console.log(user.uid + ' ' + getUUID());
        uid = user.uid;
    });
    console.log('  again ' + uid + ' ' + getUUID());
}

async function addCourse(number, name, term) {
    await withUser(async (user) => {
        const courseUUID = getUUID();
        const courseReadableID = getCourseHrefId();
        const course = {
            uuid: courseUUID,
            readableID: courseReadableID,
            number: number,
            name: name,
            term: term,
            officeHour: [],
            discussion: [],
            homeworkParty: [],
            lab: [],
            misc: []
        }
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            courses: arrayUnion(courseUUID)
        });

        const courseRef = doc(db, 'courses', courseUUID);
        await setDoc(courseRef, course, { merge: true });
    });
}

async function deleteCourse(courseId) {
    await withUser(async (user) => {
        // User is signed in.
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            courses: arrayRemove(courseId)
        });

        const courseRef = doc(db, 'courses', courseId);
        await deleteDoc(courseRef);
    });
}

async function getCourses() {
    var courses = [];
    await withUser(async (user) => {
        // User is signed in.
        const userRef = doc(db, 'users', user.uid);
        const usersDoc = await getDoc(userRef);
        if (!usersDoc.exists()) {
            console.log("Unexpected error, users database doesn't exist");
            return;
        }
        const courseIds = usersDoc.data()['courses'];
        for (let i = 0; i < courseIds.length; i++) {
            var courseId = courseIds[i];
            var courseRef = doc(db, 'courses', courseId);
            var courseDoc = await getDoc(courseRef);
            if (courseDoc.exists()) {
                courses.push(courseDoc.data());
            } else {
                console.log("Course is null");
            }
        }
    });
    return courses;
}

function setCookie(name, value, daysToLive) {
    var cookie = name + "=" + encodeURIComponent(value);
    cookie += "; path=/";
    cookie += "; max-age=" + (daysToLive*24*60*60);
    document.cookie = cookie;
}

function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function setCurrentCourseCookie(course) {
    setCookie("cnumber", course.number, 4);
    setCookie("cterm", course.term, 4);
    setCookie("cname", course.name, 4);
}

function setCurrentCourseTextsFromCookie() {
    let cnumber = getCookie('cnumber');
    let cterm = getCookie('cterm');
    let cname = getCookie('cname');
    if (cnumber) {
        $(".classNumberText").text(cnumber);
    }
    if (cterm) {
        $(".classTermText").text(cterm);
    }
    if (cname) {
        $(".classNameText").text(cname);
    }
}

async function getCourse(courseUUID) {
    let courses = await getCourses();
    for (let course of courses) {
        if (course.uuid === courseUUID) {
            return course;
        }
    }
    return null;
}

function getCurrentCourseUUID() {
    let pathSplits = new URL(window.location.href).pathname.split("/");
    if (pathSplits.length < 3) {
        return null;
    }
    let courseUUID = pathSplits[2];
    return courseUUID;
}

async function getCurrentCourse() {
    let courseUUID = getCurrentCourseUUID();
    if (!courseUUID) {
        return null;
    }
    let course = await getCourse(courseUUID);
    return course;
}

function getCourseHrefId() {
    // Random ten digits
    return Math.floor(Math.random() * 10000000000);
}

export { addCourse, deleteCourse, getCourses, testAuthStuff, getCourse, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie }