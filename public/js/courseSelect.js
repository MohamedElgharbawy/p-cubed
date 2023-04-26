import { getCourses, addCourse, deleteCourse, testAuthStuff } from "./courses.js";
import { signOutGoogle } from "./auth.js";

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


$('#printCourses').on('click', printCourses);
$('#signout').on('click', signOutGoogle);
$('#addRandomCourse').on('click', addRandomCourse);
$('#updateDisplay').on('click', updateCoursesDisplay);
$('#assignPref').on('click', assignPreference);
$('#deleteAllCourses').on('click', deleteAllCourses);
$('#confirmAddCourse').on('click', confirmAddCourse);
$('#cancelAddCourse').on('click', cancelAddCourse);

$(window).on("load", updateCoursesDisplay);

