//Node modules to *require*
//if these cause errors, be sure you've installed them, ex: 'npm install express'
import express from 'express';
import path from 'path';
import {PythonShell} from 'python-shell';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
    } else {
        res.sendFile(publicPath + '/html/schedules.html');
    }
});

app.get('/login', function (req, res) {
    res.sendFile(publicPath + '/html/login.html');
});

//run python matching code, and send back the assignment result
app.get("/assign", (req, res, next)=>{

    let pyshell = new PythonShell('python/run_assign.py', {
        mode: 'json'
    });
    let output = '';
    pyshell.stdout.on('data', function (data) {
        output += '' + data;
    });
    pyshell.send(req.query).end(function (err) {
        if (err) throw err;
        console.log(output)
        res.send(output)
    });
});

app.get('/add_new_course_popup', function (req, res) {
    res.sendFile(publicPath + '/html/add_new_course_popup.html');
});

//run this server by entering "node App.js" using your command line. 
app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});



