import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
import { getSection, updateSection } from "./sections.js";
import { createGoogleForm } from "./forms.js";
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
                <input id="timeStart${rowInd}" type="time" class="form-control" value="00:00"/> 
            </div>
            <div class="col-3">
                <input id="timeEnd${rowInd}" type="time" class="form-control" value="00:00"/> 
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

function formatTime(timestr) {
    var hh = parseInt(timestr.split(":")[0]);
    var m = parseInt(timestr.split(":")[1]);
    var dd = "AM";
    var h = hh;
    if (h >= 12) {
        h = hh-12;
        dd = "PM";
    }
    if (h == 0) {
        h = 12;
    }
    m = m<10?"0"+m:m;
    
    /* if you want 2 digit hours: */
    h = h<10?"0"+h:h;

    var pattern = new RegExp("0?"+hh+":"+m);
    return timestr.replace(pattern,h+":"+m+" "+dd)
}

function formatDay(daystr) {
    return {
        "Monday": "Mon",
        "Tuesday": "Tue",
        "Wednesday": "Wed",
        "Thursday": "Thu",
        "Friday": "Fri",
        "Saturday": "Sat",
        "Sunday": "Sun",
    }[daystr];
}

$("#createButton").on("click", async () => {
    // TODO: Validate inputs

    var sectionTimes = []

    for (const rowInd of timeRowInds) {
        console.log(rowInd);
        var timeDay = formatDay($(`#timeDay${rowInd}`).val());
        var timeStart = formatTime($(`#timeStart${rowInd}`).val());
        var timeEnd = formatTime($(`#timeEnd${rowInd}`).val());
        sectionTimes.push(`${timeDay} ${timeStart} - ${timeEnd}`);
    }

    const searchParams = new URL(window.location.href).searchParams;
    const sectionId = searchParams.get('sectionId');
    const taOrStudent = searchParams.get('role');

    var section = await getSection(sectionId);
    section[taOrStudent].sectionTimes = sectionTimes;
    
    // ACTUALLY CREATE THE FORM
    var formDetails = {
        "title": $("#formTitleInput").val(),
        "description": $("#formDescriptionInput").val(),
        "sectionTimes": sectionTimes
    }
    var formResult = await createGoogleForm(formDetails);
    section[taOrStudent].formId = formResult.formId;
    section[taOrStudent].formUrl = formResult.formUrl;

    await updateSection(section);

    const sectionType = searchParams.get('stype');
    const currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/${sectionType}`
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