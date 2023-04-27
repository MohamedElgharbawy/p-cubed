import { getCourses, addCourse, deleteCourse, testAuthStuff } from "./courses.js";
import { createGoogleSheet } from "./sheets.js";
import { createGoogleForm } from "./forms.js";
import { signOutGoogle } from "./auth.js";
import { getCookie } from './utils.js';

async function printCourses() {
    let courses = await getCourses();
    console.log(courses);
}

async function deleteAllCourses() {
    let courses = await getCourses();
    console.log("deleting courses");
    for (const course of courses) {
        await deleteCourse(course.uuid);
    }
    console.log("done");
    updateCoursesDisplay();
}

async function addRandomCourse() {
    let number = "CS " + (Math.floor(Math.random() * 100) + 1).toString();
    let name = "The course that teaches stuff.";
    let term = "Spring 202" + (Math.floor(Math.random() * 4)).toString();
    await addCourse(number, name, term);
    updateCoursesDisplay();
}

async function confirmAddCourse() {
    // TODO: validate

    let number = $("#courseNumberInput").val().trim();
    let name = $("#courseNameInput").val().trim();
    let term = $("#courseTermInput").val().trim();
    let year = $("#courseYearInput").val().trim();

    if (number && name && term && year) {
        await addCourse(number, name, term + " " + year);
        updateCoursesDisplay();
    }
}

function cancelAddCourse() {
    $("#courseNumberInput").val("");
    $("#courseNameInput").val("");
    $("#courseTermInput").val("");
    $("#courseYearInput").val("");
}

async function updateCoursesDisplay() {
    let courses = await getCourses();
    console.log(courses);
    var termToCourses = new Map();
    for (const course of courses) {
        let term = course.term;
        if (!termToCourses.has(term)) {
            termToCourses.set(term, []);
        }
        termToCourses.get(term).push(course);
    }

    let courseDiv = $('#displayedCourses').empty();

    for (const [term, tc] of termToCourses.entries()) {
        console.log(term);
        console.log(tc);

        $(courseDiv).append(
            `<div class="row pb-1">
                <div class="col-12">
                    <h3>${term}</h3>
                </div>
            </div>`
        );
        
        var termCoursesDiv = $(document.createElement('div')).addClass("row row-cols-4 g-4 pb-3");
        for (const course of tc) {
            $(termCoursesDiv).append(
                `<div class="col">
                    <div class="d-grid h-100">
                        <a type="button" class="btn btn-outline-secondary p-3 h-100" href="/course/${course.uuid}/home">
                            <h4>${course.number}</h4>
                            <div>${course.name}</div>
                        </a>
                    </div>
                </div>`
            );
        }
        $(termCoursesDiv).append(
            `<div class="col">
                <div class="d-grid h-100">
                    <button type="button" class="btn btn-outline-secondary p-3 h-100" data-bs-toggle="modal" data-bs-target="#addCourseModal">
                        <h4>+ Add New Course</h4>
                    </button>
                </div>
            </div>`
        );

        $(courseDiv).append(termCoursesDiv);
    }
}

$('#addCourseModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var recipient = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    // modal.find('.modal-body input').val(recipient)
});

function assignPreference() {
    $.ajax({
        type: 'GET',
        url: '/assign',
        dataType: 'json',
        data: { 'file_p': 'asset/pcubed_sample_student_pref.csv' },
        success: function(resultData) {
            console.log(resultData);
        }
    });
}

async function createSheet() {
    const result = await createGoogleSheet("CS 12 LOST Section");
    console.log(result);
    console.log(result["spreadSheetId"]);
    console.log(result["spreadsheetUrl"]);
}

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function createForm() {
    // const details = {
    //     title: "CS 12 TA Assignment Form",
    //     description: "Fill out as many sections as possible"
    // }
    // const result = await createGoogleForm(details);
    // console.log(result);
    // console.log(result["formId"]);
    // console.log(result["formUrl"]);
    // let token = getCookie("token");
    // $.ajax({
    //     type: 'GET',
    //     url: '/formAPI',
    //     dataType: 'json',
    //     data: { 'token': token, 'title': 'CS 12 TA Assignment Form' },
    //     success: function (resultData) {
    //         console.log(resultData);
    //     }
    // });
    // let token = getCookie('token');
    // console.log(gapi.client)
    // gapi.client.setToken({
    //     access_token: token
    // })
    // var request = gapi.client.request(JSON.stringify({
    //     path: `https://forms.googleapis.com/forms/v1/forms`,
    //     method: 'POST',
    //     body: {
    //         info: {
    //             title: req.query['title']
    //         }
    //     }
    // }))
    // request.execute(printViews);
    await createGoogleForm({})
}

$('#printCourses').on('click', printCourses);
$('#signout').on('click', signOutGoogle);
$('#addRandomCourse').on('click', addRandomCourse);
$('#updateDisplay').on('click', updateCoursesDisplay);
$('#assignPref').on('click', assignPreference);
$('#deleteAllCourses').on('click', deleteAllCourses);
$('#confirmAddCourse').on('click', confirmAddCourse);
$('#cancelAddCourse').on('click', cancelAddCourse);
$('#createSpreadsheet').on('click', createSheet);
$('#createForm').on('click', createForm);

$(window).on("load", updateCoursesDisplay);