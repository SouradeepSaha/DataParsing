// TODO - This will be dependent on how many terms the user specifies.
const terms = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]; //Add 5A 5B for Double Degrees

/* Custom Dragula JS */
window.onload = function() {
    var closePopup1 = document.getElementById('close-popup-1');

    closePopup1.addEventListener('click', () => {
        var popup1 = document.getElementById("popup-1");
        popup1.style.display = "none";
    });

    dragger = dragula([
        document.getElementById("required"),
        document.getElementById("1A"),
        document.getElementById("1B"),
        document.getElementById("2A"),
        document.getElementById("2B"),
        document.getElementById("3A"),
        document.getElementById("3B"),
        document.getElementById("4A"),
        document.getElementById("4B"),
        document.getElementById("5A"),
        document.getElementById("5B"),
        document.getElementById("trash")
    ]);
    dragger.on('drop', function (el, target, source) {
        const term = $(target).attr("id");
        const src = $(source).attr("id");
        let draggedId = el.id;
        let termIndex = 0;

        if (term === "trash") {
            emptyTrash();
            checkSchedule(termIndex)
        }
        else if (term === "required"){
            // no operations if courses are dragged back to required courses
            // need to change in future because all course needs to be validated again
            document.getElementById(draggedId).style.color = "darkslateblue"; // back to original color
            checkSchedule(termIndex)
        }
        else {
            if (src === "required"){
                //only check schedule for course after term has been dropped
                termIndex = terms.indexOf(term);
            }
            else{
                //src is Term Number
                termIndex = Math.min(terms.indexOf(src), terms.indexOf(term));
            }
            // else needs to check all schedule again`
            checkSchedule(termIndex);
        }
    });
};


function checkSchedule(term_index) {
    const numTerms = terms.length;
    let listOfCoursesTaken = getTaken(term_index);

    for (let i = term_index; i < numTerms; i++) {
        let currentTermCourses = getCurrent(i);
        const currentTermCoursesText = currentTermCourses[1];
        currentTermCourses = currentTermCourses[0];
        let arrayLen = currentTermCourses.length;

        if (arrayLen) {
            for (let j = 0; j < arrayLen; j++) {
                let course_li = currentTermCourses[j];
                let course = course_li.innerText.trim();

                if (!(course.endsWith("*") || course.includes(","))) {
                    draggedId = course_li.id;
                    $.ajax({
                        url: 'http://127.0.0.1:8000/api/meets_prereqs/get/' + course,
                        type: 'get',
                        data: {
                            list_of_courses_taken: listOfCoursesTaken,
                            current_term_courses: currentTermCoursesText
                        },
                        async: false,
                        success: function (data) {
                            let canTake = data.can_take;
                            // Do something
                            if (canTake) {
                                document.getElementById(draggedId).style.color = "green";
                            } else {
                                document.getElementById(draggedId).style.color = "red";
                            }
                        },
                        error: function () {
                            document.getElementById(draggedId).style.color = "grey";
                            // alert("Error: cannot determine if course can be taken.")
                        }
                    });
                }
            }
            listOfCoursesTaken = listOfCoursesTaken.concat(currentTermCoursesText);
        }
    }
}

/* Vanilla JS to add a new task */
function addTask() {
    /* Get task text from input */
    const inputTask = document.getElementById("taskText").value.toUpperCase();
    let id = inputTask + "(" + Math.round(Math.random() * 100 )  +")"; //generate random number to prevent unique id
    id = id.replace(" ", "");
    // check if inputTask has whitespace
    if (/\S/.test(inputTask)) {
        /* Add task to the 'Required' column */
        $.ajax({
            url: 'http://127.0.0.1:8000/api/course-info/get/' + inputTask,
            type: 'get', // This is the default though, you don't actually need to always mention it
            success: function (data) {
                document.getElementById("required").innerHTML +=
                    "<li class='task' id='" + id + "' onclick='popupWindow(\"" + id + "\")'>" + "<p>" + inputTask + "</p></li>";
            },
            error: function (data) {
                document.getElementById("required").innerHTML +=
                    "<li class='task' id='" + id + "' onclick='popupWindow(\"" + id + "\")'>" + "<p>" + inputTask + " *</p></li>";
            }
        });
        /* Clear task text from input after adding task */
        document.getElementById("taskText").value = "";
    }
}

/* Vanilla JS to delete tasks in 'Trash' column */
function emptyTrash() {
  /* Clear tasks from 'Trash' column */
  document.getElementById("trash").innerHTML = "";
}

function getTaken(term_index) {
    let taken = [];

    for (let i = 0; i < term_index; i++) {
        let term_courses = getCurrent(i)[1];
        taken = taken.concat(term_courses);
    }
    return taken;
}

function getCurrent(term_index) {
    let termCourses = document.getElementById(terms[term_index]).getElementsByTagName("li");
    let termCoursesText = Array.from(termCourses).map(function(c) {
        return $(c).text().trim().split(", ");
    });
    // merges split arrays into one flattened array
    termCoursesText = [].concat.apply([], termCoursesText);
    return [termCourses, termCoursesText];
}

function generateHTML(course) {
    let html = "<h3>" + course + "</h3>";
    $.ajax({
        url: 'http://127.0.0.1:8000/api/course-info/get/' + course,
        type: 'get',
        async: false,
        success: function (data) {
            let id = data.course_id;
            let name = data.course_name;
            let credit = data.credit;
            let info = data.info;
            let online = data.online;
            let prereqs = data.prereqs;
            let coreqs = data.coreqs;
            let antireqs = data.antireqs;

            html += "<p style='font-size: 17px'><b>" + name + "</b> (" + credit + ") ID:" + id;
            html += "</p><p style='font-size: 15px'>" + info;
            if (online) {
                html += "<br><i>Available online.</i>";
            }
            html += "</p><p style='font-size: 15px'>";
            if (prereqs) {
                html += "<b>Prereq: </b>" + prereqs + "<br>";
            } if (coreqs) {
                html += "<b>Coreq: </b>" + coreqs + "<br>";
            } if (antireqs) {
                html += "<b>Antireq: </b>" + antireqs + "<br>";
            }
            html += "</p>";
        },
        error: function () {
            html += "<large-p>ERROR</large-p>";
        }
    });
    return html;
}

function popupWindow(str) {
    let el = document.getElementById(str);
    let course_text = el.innerText;
    let content = document.getElementsByClassName("popup-content")[0];
    let html = generateHTML(course_text);
    html += "<br><button id='close-popup-1'>Close</button>";
    content.innerHTML = html;
    document.getElementById("popup-1").style.display = "block";

    let closePopup1 = document.getElementById('close-popup-1');
    closePopup1.addEventListener('click', () => {
        let popup1 = document.getElementById("popup-1");
        popup1.style.display = "none";
    });
}
