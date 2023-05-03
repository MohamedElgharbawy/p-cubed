import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";


$(window).on("load", async () => {
    setCurrentCourseTextsFromCookie();

    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    setCurrentCourseCookie(course);
    console.log(course);

    $(".classNumberText").removeClass("placeholder").text(course.number);
    $(".classTermText").removeClass("placeholder").text(course.term);
    $(".classNameText").removeClass("placeholder").text(course.name);
});

