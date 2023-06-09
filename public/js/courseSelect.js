import { signOutGoogle } from "./auth.js";
import { getCourses, addCourse, deleteCourse, testAuthStuff } from "./courses.js";
import { createGoogleForm, getGoogleFormResponses } from "./forms.js";
import { createGoogleSheet, exportModelToSheets } from "./sheets.js";
import { setUserPic } from "./userProfile.js";

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
    let name = "The course that teaches stuff";
    let term = "Spring 202" + (Math.floor(Math.random() * 4)).toString();
    await addCourse(number, name, term);
    updateCoursesDisplay();
}

function clearCourseInput() {
    $("#courseNumberInput").val("");
    $("#courseNameInput").val("");
    $("#courseTermInput").val("");
    $("#courseYearInput").val("");
}

var addCourseModal = new bootstrap.Modal("#addCourseModal");

$('#confirmAddCourse').on('click', async () => {
    $("#confirmAddCourse").addClass("disabled");
    $("#cancelAddCourse").addClass("disabled");
    addCourseModal._config.backdrop = "static";
    addCourseModal._config.keyboard = false;

    let number = $("#courseNumberInput").val().trim();
    let name = $("#courseNameInput").val().trim();
    let term = $("#courseTermInput").val().trim();
    let year = $("#courseYearInput").val().trim();

    if (number && name && term && year) {
        await addCourse(number, name, term + " " + year);
        await updateCoursesDisplay();
        clearCourseInput();
    }

    addCourseModal.hide();
    $("#confirmAddCourse").removeClass("disabled");
    $("#cancelAddCourse").removeClass("disabled");
    addCourseModal._config.backdrop = true;
    addCourseModal._config.keyboard = true;
});

$('#cancelAddCourse').on('click', () => {
    clearCourseInput();
    addCourseModal.hide();
});


async function updateCoursesDisplay() {
    let courses = await getCourses();

    console.log(courses);
    var termToCourses = new Map();
    var terms = [];
    for (const course of courses) {
        let term = course.term;
        if (!termToCourses.has(term)) {
            termToCourses.set(term, []);
            terms.push(term);
        }
        termToCourses.get(term).push(course);
    }
    terms.sort((t1, t2) => {
        let t1Season = t1.split(" ")[0];
        let t1Year = parseInt(t1.split(" ")[1]);
        let t2Season = t2.split(" ")[0];
        let t2Year = parseInt(t2.split(" ")[1]);

        if (t1Year !== t2Year) {
            return t2Year - t1Year;
        }

        const seasonToNumber = {
            "Winter": 0,
            "Spring": 1,
            "Summer": 2,
            "Fall": 3,
        };

        return seasonToNumber[t2Season] - seasonToNumber[t1Season];
    });

    let courseDiv = $('#displayedCourses').empty();
    if (terms.length === 0) {
        $(courseDiv).append(
            `<div class="row row-cols-4 g-4 pb-3">
                <div class="col">
                    <div class="card h-100 border-grey">
                        <button type="button" class="btn btn-light p-3 h-100" data-bs-toggle="modal" data-bs-target="#addCourseModal">
                            <h4>+ Add New Course</h4>
                        </button>
                    </div>
                </div>
            </div>`
        );
        return;
    }

    for (const term of terms) {
        let tc = termToCourses.get(term);
        console.log(term);
        console.log(tc);

        $(courseDiv).append(
            `<div class="row pb-1">
                <div class="col-12">
                    <h2>${term}</h2>
                </div>
            </div>`
        );
        
        var termCoursesDiv = $(document.createElement('div')).addClass("row row-cols-4 g-4 pb-3");
        for (const course of tc) {
            $(termCoursesDiv).append(
                `<div class="col">
                    <div class="card h-100 border-grey">
                        <a type="button" class="btn btn-light border-0 rounded-1 rounded-bottom-0 p-3 h-100 stretched-link" href="/course/${course.uuid}/home">
                            <h4>${course.number}</h4>
                            <span>${course.name}</span>
                        </a>
                        <div class="card-footer bg-primary p-0" style="height:0.2em;"></div>
                    </div>
                </div>`
            );
        }
        $(termCoursesDiv).append(
            `<div class="col">
                <div class="card h-100 border-grey">
                    <button type="button" class="btn btn-light p-3 h-100" data-bs-toggle="modal" data-bs-target="#addCourseModal">
                        <h4>+ Add New Course</h4>
                    </button>
                </div>
            </div>`
        );

        $(courseDiv).append(termCoursesDiv);
    }
}

// $('#addCourseModal').on('show.bs.modal', function (event) {
//     var button = $(event.relatedTarget); // Button that triggered the modal
//     var recipient = button.data('whatever'); // Extract info from data-* attributes
//     // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
//     // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
//     var modal = $(this)
//     // modal.find('.modal-body input').val(recipient)
// });

function Test_assignPreference() {
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

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function createForm() {
    const formDetails = {
        'title': "CS 12 Assignment Form (LOST Section)",
        'description': "Please select as many sections as possible!",
        'sections': [
            {
                'day': "Mon",
                'startTime': "2:00pm",
                'endTime': "3:00pm"
            },
            {
                'day': "Mon",
                'startTime': "3:00pm",
                'endTime': "4:00pm"
            },
            {
                'day': "Tue",
                'startTime': "1:30pm",
                'endTime': "2:30pm"
            },
        ]
    }
    const result = await createGoogleForm(formDetails)
    console.log(result['formId'])
    console.log(result['formUrl'])
    window.open(result['formUrl'], '_blank');
}

async function getForm() {
    const result = await getGoogleFormResponses("12yHI4jgUl5RVE9rKvqQJ36USEh3eFuFMLBRSuDzxeI8")
}

async function createSheet() {
    const sheetsDetails = {
        'title': 'CS 12 Assignments'
    }
    const result = await createGoogleSheet(sheetsDetails)
}

async function exportModel() {
    const modelOutput = {
        "Wed 11am-12pm": [
            {
                'Name': 'Mohamed Elgharbawy',
                'SID': '12309812'
            },
            {
                'Name': 'first last2',
                'SID': '12423'
            }
        ],
        "Thu 10am-11am": [
            {
                'Name': 'first last',
                'SID': '12432'
            },
            {
                'Name': 'first last2',
                'SID': '12423'
            }
        ]
    }
    const sheetsInfo = {
        spreadsheetID: "1bwPYRDPl4WPu88ggJqiBVbbLK8G90uCoicOYEKWlEIo",
        taSheetID: "2002528586",
        studentSheetID: "892409405"
    }
    await exportModelToSheets(sheetsInfo, modelOutput, "student")
}

$('#printCourses').on('click', printCourses);
$('#signout').on('click', signOutGoogle);
$('#addRandomCourse').on('click', addRandomCourse);
$('#updateDisplay').on('click', updateCoursesDisplay);
$('#assignPref').on('click', Test_assignPreference);
$('#deleteAllCourses').on('click', deleteAllCourses);
$('#createSpreadsheet').on('click', createSheet);
$('#createForm').on('click', createForm);
$('#getForm').on('click', getForm);
$('#createSheet').on('click', createSheet);
$('#exportModel').on('click', exportModel);

$(window).on("load", async () => {
    setUserPic();
    updateCoursesDisplay();
});