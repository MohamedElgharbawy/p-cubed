//Node modules to *require*
//if these cause errors, be sure you've installed them, ex: 'npm install express'
const express = require('express');
const cors = require('cors');
const path = require('path');
const {PythonShell} = require('python-shell');
// const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json())
const router = express.Router();

//specify that we want to run our website on 'http://localhost:8000/'
const host = 'localhost';
const port = 8000;

var publicPath = path.join(__dirname, 'public'); //get the path to use our "public" folder where we stored our html, css, images, etc
app.use(express.static(publicPath));  //tell express to use that folder

//here's where we specify what to send to users that connect to our web server...
//if there's no url extension, it will show "index.html"
router.get("/", function (req, res) {
    // res.sendFile(path.join(__dirname, "/distanceToTime.html"));
    res.sendFile(path.join(__dirname, "/"));
});

//depending on what url extension the user navigates to, send them the respective html file.
app.get('/', function (req, res) {
    res.sendFile(publicPath + '/html/courseSelect.html');
});

app.get('/course/:courseID/:page', function (req, res) {
    if (req.params.page === "home") {
        res.sendFile(publicPath + '/html/home.html');
    } else if (req.params.page === "createForm") {
        res.sendFile(publicPath + '/html/createForm.html');
    } else {
        res.sendFile(publicPath + '/html/schedules.html');
    }
});

app.get('/login', function (req, res) {
    res.sendFile(publicPath + '/html/login.html');
});

//run python matching code, and send back the assignment result
app.post("/assign", (req, res) => {
    console.log(req.body);

    let pyshell = new PythonShell('python/run_assign.py', {
        mode: 'text'
    });

    let output = '';
    pyshell.stdout.on('data', function (data) {
        output += '' + data;
    });

    pyshell.send(JSON.stringify(req.body)).end(function (err) {
        if (err) throw err;
        console.log("response:");
        console.log(output);
        res.json(JSON.parse(output));
    });
});

// app.get('/add_new_course_popup', function (req, res) {
//     res.sendFile(publicPath + '/html/add_new_course_popup.html');
// });

// // Google Form API Request
// app.get("/formAPI", async (req, res, next) => {
//     let token = req.query["token"]

//     const formUrl = `https://forms.googleapis.com/forms/v1/forms`

//     // Use the ID token to authenticate with the Google Drive API
//     const response = await fetch(formUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             // 'Access-Control-Allow-Origin': '*',
//             // 'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS',
//             'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//             info: {
//                 title: req.query['title']
//             },
//             items: [
//                 {
//                     textItem: "test"
//                 }
//             ]
//         }),
//     });
//     await response.json();
//     res.send(response);
// });


//run this server by entering "node App.js" using your command line. 
app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
