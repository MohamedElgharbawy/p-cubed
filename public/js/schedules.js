import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
import { getFormId } from "./sections.js"
import { getGoogleFormResponses } from "./forms.js"

function assignPreference() {
    let course = await getCurrentCourse();
    console.log(course)
    formID = getFormId(sectionId, taOrStudent)
    pref_data = getGoogleFormResponses(formID)

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

$('#confirmAssign').on('click', assignPreference);

function getCurrentScheduleType() {
    let pathSplits = new URL(window.location.href).pathname.split("/");
    if (pathSplits.length < 4) {
        return null;
    }
    let scheduleType = pathSplits[3];
    return scheduleType;
}

function getSchduleTypeDisplayString(scheduleType) {
    if (scheduleType === "discussions") {
        return "Discussions";
    } else if (scheduleType === "oh") {
        return "Office Hours";
    } else if (scheduleType === "hwparties") {
        return "HW Parties";
    } else if (scheduleType === "labs") {
        return "Labs";
    } else {
        return "Misc";
    }
}

$("#createFormButton").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/createForm`;
})

$(window).on("load", async () => {
    setCurrentCourseTextsFromCookie();

    let scheduleType = getCurrentScheduleType();
    let scheduleTypeDisplayStr = getSchduleTypeDisplayString(scheduleType);
    console.log(scheduleType);
    $(document).attr("title", scheduleTypeDisplayStr);
    $("#scheduleTypeText").removeClass('placeholder').text(scheduleTypeDisplayStr);
    $(`#navbar${scheduleType}`).addClass("fw-bold text-decoration-underline");

    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    setCurrentCourseCookie(course);
    console.log(course);

    $(".classNumberText").removeClass('placeholder').text(course.number);
    $(".classTermText").removeClass('placeholder').text(course.term);
    $(".classNameText").removeClass('placeholder').text(course.name);
});
