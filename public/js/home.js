import { getCourses, addCourse } from "./courses.js"

function printCourses() {
    console.log("hi");
    getCourses().then(function (courses) {
        console.log(courses);
    });
}

function addRandomCourse() {
    let number = Math.floor(Math.random() * 100) + 1;
    let name = "TS";
    let term = "Spring 202" + (Math.floor(Math.random() * 4)).toString();
    addCourse(number, name, term);
}

function updateCoursesDisplay() {
    getCourses().then(function (courses) {
        console.log(courses);
        var termToCourse = {};
        for (let i = 0; i < courses.length; i++) {
            if (!termToCourse[courses[i].term]) {
                termToCourse[courses[i].term] = []
            }
            termToCourse[courses[i].term].push(courses[i]);
        }

        for (const [term, tc] of Object.entries(termToCourse)) {
            console.log(term);
            console.log(tc);
        }
    });
}

document.getElementById('printCourses').addEventListener('click', printCourses)
document.getElementById('addRandomCourse').addEventListener('click', addRandomCourse)
document.getElementById('updateDisplay').addEventListener('click', updateCoursesDisplay)
