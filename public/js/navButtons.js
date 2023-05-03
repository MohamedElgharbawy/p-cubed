import { deleteCourse, getCurrentCourseUUID, getCurrentCourse } from "./courses.js";
import { signOutGoogle } from "./auth.js";


$(".navButtonHome").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/home`;
    return false;
});

$(".navButtonDiscussion").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/discussions`;
    return false;
});

$(".navButtonOH").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/oh`;
    return false;
});

$(".navButtonHWP").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/hwparties`;
    return false;
});

$(".navButtonLab").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/labs`;
    return false;
});

$(".navButtonMisc").on("click", () => {
    let currentUUID = getCurrentCourseUUID();
    window.location.href = `/course/${currentUUID}/misc`;
    return false;
});

$("#navbarcourseselect").on("click", () => {
    window.location.href = `/`;
    return false;
});

$("#navbarsignout").on("click", () => {
    signOutGoogle();
    return false;
});

var deleteCourseModal = new bootstrap.Modal("#deleteCourseModal");

$('#confirmDeleteCourse').on('click', async () => {
    $("#confirmDeleteCourse").addClass("disabled");
    $("#cancelDeleteCourse").addClass("disabled");
    deleteCourseModal._config.backdrop = "static";
    deleteCourseModal._config.keyboard = false;

    await deleteCourse(getCurrentCourseUUID());
    window.location.href = "/";

    deleteCourseModal.hide();
    $("#confirmDeleteCourse").removeClass("disabled");
    $("#cancelDeleteCourse").removeClass("disabled");
    deleteCourseModal._config.backdrop = true;
    deleteCourseModal._config.keyboard = true;
});

$('#cancelDeleteCourse').on('click', () => {
    deleteCourseModal.hide();
});

$('#navbardeletecourse').on('click', () => {
    deleteCourseModal.show();
})

$(window).on("load", async () => {
    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    console.log("hi");
    $("#deleteCourseModalCourseName").text(`${course.number}: ${course.name}`);
});

