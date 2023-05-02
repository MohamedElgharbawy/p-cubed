import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
// import { TempusDominus } from 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/6.7.7/js/tempus-dominus.js';

var numTimes = 1;
var timeRowInds = [0];

$("#addNewTimeButton").on("click", () => {
    var rowInd = numTimes;
    timeRowInds.push(rowInd);
    var row = $(
        `<div id="timeRow${rowInd}" class="row mb-1">
            <div class="col-3">
            <select id="timeDay${rowInd}" class="form-select">
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
            </select>
            </div>
            <div class="col-3">
                <input id="timeStart${rowInd}" type="time" class="form-control"/> 
            </div>
            <div class="col-3">
                <input id="timeEnd${rowInd}" type="time" class="form-control" /> 
            </div>
            <div class="col-3">
                <button id="timeRemove${rowInd}" type="button" class="btn-close pb-0"></button>
            </div>
        </div>`
    );
    $("#addNewTimeButtonDiv").before(row);

    $(`#timeRemove${rowInd}`).on("click", () => {
        $(`#timeRow${rowInd}`).remove();
        timeRowInds.splice(timeRowInds.indexOf(rowInd), 1);
    })

    numTimes += 1;
});

$("#cancelButton").on("click", () => {
    const sectionType = new URL(window.location.href).searchParams.get('stype');
    const currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/${sectionType}`
});

$("#createButton").on("click", () => {
    // const sectionType = new URL(window.location.href).searchParams.get('stype');
    // const currentUUID = getCurrentCourseUUID();
    // window.location.href = `/course/${currentUUID}/${sectionType}`
    for (const rowInd of timeRowInds) {
        console.log(rowInd);
    }
});

function getSchduleTypeDisplayString(scheduleType) {
    if (scheduleType === "discussions") {
        return "Discussion";
    } else if (scheduleType === "oh") {
        return "Office Hour";
    } else if (scheduleType === "hwparties") {
        return "HW Party";
    } else if (scheduleType === "labs") {
        return "Lab";
    } else {
        return "Misc";
    }
}

function setHeading() {
    const searchParams = new URL(window.location.href).searchParams;
    var roleText;
    if (searchParams.get('role') === "student") {
        roleText = "Student";
    } else {
        roleText = "TA";
    }

    $("#headingText1").text(`Create Form (${roleText})`);
    $("#headingText2").text(`${searchParams.get('name')} (${getSchduleTypeDisplayString(searchParams.get('stype'))})`);
}

$(window).on("load", async () => {
    setCurrentCourseTextsFromCookie();
    
    const searchParams = new URL(window.location.href).searchParams;
    
    let scheduleType = searchParams.get('stype');
    console.log(scheduleType);
    $(`#navbar${scheduleType}`).addClass("fw-bold text-decoration-underline");
    setHeading();
    
    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    setCurrentCourseCookie(course);
    console.log(course);

    $(".classNumberText").text(course.number);
    $(".classTermText").text(course.term);
    $(".classNameText").text(course.name);
});