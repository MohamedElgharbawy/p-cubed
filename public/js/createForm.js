import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
// import { TempusDominus } from 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/6.7.7/js/tempus-dominus.js';


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
        return "OH";
    } else if (scheduleType === "hwparties") {
        return "HW Parties";
    } else if (scheduleType === "labs") {
        return "Labs";
    } else {
        return "Misc";
    }
}


new tempusDominus.TempusDominus(document.getElementById('starttimepicker1'), {
  display: {
    viewMode: 'clock',
    components: {
      decades: false,
      year: false,
      month: false,
      date: false,
      hours: true,
      minutes: true,
      seconds: false
    },
    theme: 'light'
  }
});

$(window).on("load", async () => {
    setCurrentCourseTextsFromCookie();

    let scheduleType = getCurrentScheduleType();
    console.log(scheduleType);
    $(`#navbar${scheduleType}`).addClass("fw-bold");

    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    setCurrentCourseCookie(course);
    console.log(course);

    $(".classNumberText").text(course.number);
    $(".classTermText").text(course.term);
    $(".classNameText").text(course.name);
});