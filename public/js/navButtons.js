import { getCurrentCourseUUID } from "./courses.js";


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
