import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse } from "./courses.js";
import { signOutGoogle } from "./auth.js";


$(window).on("load", async () => {
    console.log("course uuid: " + getCurrentCourseUUID());
    let course = await getCurrentCourse();
    console.log(course);

    $(".classNumberText").text(course.number);
    $(".classTermText").text(course.term);
    $(".classNameText").text(course.name);
});

