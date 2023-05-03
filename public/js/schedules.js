import { getCourse, addCourse, deleteCourse, testAuthStuff, getCurrentCourseUUID, getCurrentCourse, setCurrentCourseCookie, setCurrentCourseTextsFromCookie } from "./courses.js";
import { signOutGoogle } from "./auth.js";
import { getFormId, addSection, getSection, deleteSection, addSheets, updateSection } from "./sections.js"
import { getGoogleFormResponses } from "./forms.js"
import { createGoogleSheet, exportModelToSheets, getSheetsUrl } from "./sheets.js";
import { sleep } from "./utils.js"

async function assignPreference(section, taOrStudent, capacity) {
    var prefData = await getGoogleFormResponses(section[taOrStudent].formId);
    console.log(prefData);
    console.log(capacity);

    // await new Promise((resolve, reject) => {
    var response = await fetch("/assign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefData: prefData, capacity: capacity }),
    });

    var modelOutput = await response.json();
    console.log(modelOutput);
    
    var spreadsheetId = section.spreadsheetId;
    var sheetsId = section[taOrStudent].sheetsId;

    console.log(section);

    if (spreadsheetId == null) {
        var sheetsResult = await createGoogleSheet({
            "title": `${section.name} ${taOrStudent === "ta" ? "TA" : "Student"} Assignments`
        });
        spreadsheetId = sheetsResult.spreadsheetId;
        sheetsId = sheetsResult[`${taOrStudent}SheetsId`];

        section["spreadsheetId"] = spreadsheetId;
        section["ta"]["sheetsId"] = sheetsResult["taSheetsId"];
        section["student"]["sheetsId"] = sheetsResult["studentSheetsId"];
    }

    section[taOrStudent].assigned = true;
    console.log(section);
    await updateSection(section);
    
    await exportModelToSheets(spreadsheetId, sheetsId, modelOutput, taOrStudent);
    await updateSectionsDisplay();
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

var deleteSectionModal = new bootstrap.Modal("#deleteSectionModal");

function createDeleteSectionButton(section) {
    var button = $("<button/>", {"class": "btn py-0 px-1 mt-0 mb-0 align-bottom text-danger float-end"}).append(
        $("<i></i>", {"class": "bi bi-trash3 fs-4 p-0 mt-0 mb-0"})
    );

    button.on("click", () => {
        $("#deleteSectionModalSectionName").text(section.name);

        $("#confirmDeleteSection").on("click", async () => {
            $("#confirmDeleteSection").off("click");
            $("#cancelDeleteSection").off("click");
    
            $("#confirmDeleteSection").addClass("disabled");
            $("#cancelDeleteSection").addClass("disabled");
            deleteSectionModal._config.backdrop = "static";
            deleteSectionModal._config.keyboard = false;
            
            await deleteSection(getCurrentCourseUUID(), getSchduleTypeCourseKey(getCurrentScheduleType()), section.uuid);
            await updateSectionsDisplay();
    
            deleteSectionModal.hide();
            $("#confirmDeleteSection").removeClass("disabled");
            $("#cancelDeleteSection").removeClass("disabled");
            deleteSectionModal._config.backdrop = true;
            deleteSectionModal._config.keyboard = true;
        });

        $("#cancelDeleteSection").on("click", () => {
            $("#confirmDeleteSection").off("click");
            $("#cancelDeleteSection").off("click");

            deleteSectionModal.hide();
        });

        deleteSectionModal.show();
    });

    return button;
}


function createGoogleFormButton(section, taOrStudent) {
    if (section[taOrStudent].formId) {
        return $('<a/>', {'class': "btn btn-light border-grey w-90", "target": "_blank", "rel": "noopener noreferrer", 'href': section[taOrStudent].formUrl}).append(
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
    if (section[taOrStudent].assigned) {
        var href = getSheetsUrl(section.spreadsheetId, section[taOrStudent].sheetsId);
        return $('<a/>', {'class': "btn btn-light border-grey w-90", "target": "_blank", "rel": "noopener noreferrer", 'href': href}).append(
            'Assignments <img class="float-end" src="/images/google-sheets.png" style="height:1.5em;">'
        );
    } else {
        return $("<a/>", {"class": "btn btn-light border-grey w-90 disabled", "href": "#"}).append(
            'Assignments <img class="float-end" src="/images/google-sheets.png" style="height:1.5em;">'
        )
    }
}

var assignModal = new bootstrap.Modal("#assignModal");

function createAssignButton(section, taOrStudent) {
    const sectionTimes = section[taOrStudent].sectionTimes;
    if (sectionTimes.length > 0) {
        var assignText = section[taOrStudent].assigned ? "Reassign" : "Assign";
        var assignButton = $("<button/>", {"class": "btn btn-light border-grey w-90"}).append(
            `${assignText} <i class="bi bi-person-gear float-end me-1"></i>`
        )
        
        assignButton.on("click", () => {
            $(".assignModalTimeRow").remove();
            
            var ind = 0;
            var prev = $("#assingModalSectionTimeHeading");
            for (const sectionTime of sectionTimes) {
                var newRow = $(
                    `<div class="assignModalTimeRow row mb-1">
                        <div class="col-8">
                            <span class="fs-5">${sectionTime}</span>
                        </div>
                        <div class="col-4">
                            <input type="number" class="form-control" id="sectionTime${ind}Num" value="2"/>
                        </div>
                    </div>`
                )
                prev.after(newRow);
                prev = newRow;
                ind += 1;
            }

            $("#confirmAssignButton").on("click", async () => {
                $("#confirmAssignButton").off("click");
                $("#cancelAssignButton").off("click");

                $("#confirmAssignButton").addClass("disabled");
                $("#cancelAssignButton").addClass("disabled");
                assignModal._config.backdrop = "static";
                assignModal._config.keyboard = false;
                
                // Calling assign backend
                var capacity = {};
                for (var i = 0; i < sectionTimes.length; i++) {
                    capacity[sectionTimes[i]] = $(`#sectionTime${i}Num`).val();
                }

                await assignPreference(section, taOrStudent, capacity);
                await updateSectionsDisplay();

                assignModal.hide();
                $("#confirmAssignButton").removeClass("disabled");
                $("#cancelAssignButton").removeClass("disabled");
                assignModal._config.backdrop = true;
                assignModal._config.keyboard = true;
            });

            $("#cancelAssignButton").on("click", async () => {
                $("#confirmAssignButton").off("click");
                $("#cancelAssignButton").off("click");

                assignModal.hide();
            });

            assignModal.show();
        })
        return assignButton
    } else {
        return $("<button/>", {"class": "btn btn-light border-grey w-90 disabled"}).append(
            'Assign <i class="bi bi-person-gear float-end me-1"></i>'
        )
    }
}

function createSectionDiv(section) {
    return $("<div/>", {"class": "col sectionDiv"}).append(
        $("<div/>", {"class": "card h-100 border-grey"}).append([
            $("<div/>", {"class": "card-header py-1 border-grey"}).append([
                $("<span/>", {"class": "fs-4 align-bottom", "text": section.name}),
                createDeleteSectionButton(section),
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
                        createAssignButton(section, "ta")
                    ),
                    $("<div/>", {"class": "col-6"}).append(
                        createAssignButton(section, "student")

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

    for (var section of sections) {
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
    $("#addNew").removeClass("hidden");
});
