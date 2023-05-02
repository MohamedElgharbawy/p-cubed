import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
import { getFormId, addSection, getSection, deleteSection } from "./sections.js"
import { getGoogleFormResponses } from "./forms.js"

async function assignPreference() {
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

// $('#confirmAssign').on('click', assignPreference);

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

function getSchduleTypeCourseKey(scheduleType) {
    if (scheduleType === "discussions") {
        return "discussion";
    } else if (scheduleType === "oh") {
        return "officeHour";
    } else if (scheduleType === "hwparties") {
        return "homeworkParty";
    } else if (scheduleType === "labs") {
        return "lab";
    } else {
        return "misc";
    }
}

$("#addNewButton").on("click", () => {
    $("#addNew").hide();
    $("#addNewEnterName").show();
});


$("#cancelAddSectionButton").on("click", () => {
    $("#sectionNameInput").val("");
    $("#sectionNameInput").removeClass("is-invalid");
    $("#addNewEnterName").hide();
    $("#addNew").show();
});

$("#sectionNameInput").on("input", () => {
    $("#sectionNameInput").removeClass("is-invalid");
})

$("#deleteSectionModal").on("show.bs.modal", (event) => {
    var modal = bootstrap.Modal.getInstance($("#deleteSectionModal"));
    
    console.log(event);
    const sectionId = $(event.relatedTarget).attr("data-bs-sectionId");
    const sectionName = $(event.relatedTarget).attr("data-bs-sectionName");
    console.log(sectionId, sectionName);
    $("#deleteSectionModalSectionName").text(sectionName);

    $("#confirmDeleteSection").on("click", async () => {
        $("#confirmDeleteSection").off("click");

        $("#confirmDeleteSection").addClass("disabled");
        $("#cancelDeleteSection").addClass("disabled");
        modal._config.backdrop = "static";
        modal._config.keyboard = false;
        
        await deleteSection(getCurrentCourseUUID(), getSchduleTypeCourseKey(getCurrentScheduleType()), sectionId);
        await updateSectionsDisplay();

        modal.hide();
        $("#confirmDeleteSection").removeClass("disabled");
        $("#cancelDeleteSection").removeClass("disabled");
        modal._config.backdrop = true;
        modal._config.keyboard = true;
    })
})

function createGoogleFormButton(section, taOrStudent) {
    if (section[taOrStudent].formId) {
        return $('<a/>', {'class': "btn btn-light border-grey w-90", 'href': '#'}).append(
            'Form <img class="float-end" src="/images/google-forms.png" style="height:1.5em;">'
        );
    } else {
        var button = $("<button/>", {"class": "btn btn-light border-grey w-90"}).append("+ Create Form")
        button.on("click", () => {
            let currentUUID = getCurrentCourseUUID();
            window.location.href = `/course/${currentUUID}/createForm?stype=${getCurrentScheduleType()}&sectionId=${section.uuid}&role=${taOrStudent}&name=${section.name}`;
        });
        return button;
    }
}

function createGoogleSheetsButton(section, taOrStudent) {
    if (section[taOrStudent].sheetsId) {
        return $('<a/>', {'class': "btn btn-light border-grey w-90", 'href': '#'}).append(
            'Sheets <img class="float-end" src="/images/google-sheets.png" style="height:1.5em;">'
        );
    } else {
        return $("<a/>", {"class": "btn btn-light border-grey w-90 disabled", "href": "#"}).append(
            'Sheets <img class="float-end" src="/images/google-sheets.png" style="height:1.5em;">'
        )
    }
}

function createSectionDiv(section) {
    return $("<div/>", {"class": "col sectionDiv"}).append(
        $("<div/>", {"class": "card h-100 border-grey"}).append([
            $("<div/>", {"class": "card-header py-1 border-grey"}).append([
                $("<span/>", {"class": "fs-4 align-bottom", "text": section.name}),
                $("<button/>", {"class": "btn py-0 px-1 mt-0 mb-0 align-bottom text-danger float-end", 
                                "data-bs-toggle": "modal", "data-bs-target": "#deleteSectionModal",
                                "data-bs-sectionId": section.uuid, "data-bs-sectionName": section.name}).append(
                    $("<i></i>", {"class": "bi bi-trash3 fs-4 p-0 mt-0 mb-0"})
                ),
            ]),
            $("<div/>", {"class": "card-body"}).append([
                $("<div/>", {"class": "row text-center"}).append([
                    $("<div/>", {"class": "col-6"}).append(
                        $("<h5>TA</h5>")
                    ),
                    $("<div/>", {"class": "col-6"}).append(
                        $("<h5>Student</h5>")
                    ),
                ]),
                $("<div/>", {"class": "row text-center mb-1"}).append([
                    $("<div/>", {"class": "col-6"}).append(
                        createGoogleFormButton(section, "ta")
                    ),
                    $("<div/>", {"class": "col-6"}).append(
                        createGoogleFormButton(section, "student")
                    ),
                ]),
                $("<div/>", {"class": "row text-center mb-1"}).append([
                    $("<div/>", {"class": "col-6"}).append(
                        createGoogleSheetsButton(section, "ta")
                    ),
                    $("<div/>", {"class": "col-6"}).append(
                        createGoogleSheetsButton(section, "student")
                    ),
                ]),
                $("<div/>", {"class": "row text-center mb-1"}).append([
                    $("<div/>", {"class": "col-6"}).append(
                        $("<button/>", {"class": "btn btn-light border-grey w-90 disabled", "data-bs-toggle": "modal", "data-bs-target": "#assignModal"}).append(
                            'Assign <i class="bi bi-person-gear float-end me-1"></i>'
                        )
                    ),
                    $("<div/>", {"class": "col-6"}).append(
                        $("<button/>", {"class": "btn btn-light border-grey w-90 disabled", "data-bs-toggle": "modal", "data-bs-target": "#assignModal"}).append(
                            'Assign <i class="bi bi-person-gear float-end me-1"></i>'
                        )
                    ),
                ]),
            ]),
            $("<div/>", {"class": "card-footer bg-primary p-0", "style": "height:0.2em;"})
        ])
    )
}

async function updateSectionsDisplay(course) {
    if (!course) {
        course = await getCurrentCourse();
    }
    let scheduleTypeCourseKey = getSchduleTypeCourseKey(getCurrentScheduleType());
    let sectionIds = course[scheduleTypeCourseKey];
    let sections = [];
    for (const sectionId of sectionIds) {
        console.log(sectionId);
        var section = await getSection(sectionId);
        console.log(section);
        sections.push(section);
    }

    $(".sectionDiv").remove();

    for (const section of sections) {
        var sectionDiv = createSectionDiv(section);
        $("#addNew").before(sectionDiv);
    }
} 

$("#confirmAddSectionButton").on("click", async () => {
    var sectionName = $("#sectionNameInput").val();
    if (sectionName.trim() === "") {
        $("#sectionNameInput").addClass("is-invalid");
        return;
    }

    $("#confirmAddSectionButton").addClass("disabled");
    $("#cancelAddSectionButton").addClass("disabled");
    $("#sectionNameInput").prop('disabled', true);

    await addSection(getCurrentCourseUUID(), getSchduleTypeCourseKey(getCurrentScheduleType()), sectionName);
    await updateSectionsDisplay();

    $("#sectionNameInput").val("");
    $("#sectionNameInput").removeClass("is-invalid");
    $("#addNewEnterName").hide();
    $("#addNew").show();

    $("#confirmAddSectionButton").removeClass("disabled");
    $("#cancelAddSectionButton").removeClass("disabled");
    $("#sectionNameInput").prop('disabled', false);
});


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

    await updateSectionsDisplay(course);
    $("#loadingPlaceholder").hide();
});
