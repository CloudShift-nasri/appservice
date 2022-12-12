const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
const { Connection, Request } = require('tedious');


const playerRoutes = require('./routes/player.routes');
const homeRoutes = require('./routes/index.routes');

const port = process.env.port || 8080;
const teamName = process.env.teamname || "The CloudShifters";
const connection_string = process.env.SQLCONNSTR_SQLK8SARc || "Data Source=20.23.179.3;User ID=nasri;Password=ESPRITpfe2022";

let databaseCred = {};
connection_string.split(";").map((k) => { databaseCred[k.split("=")[0]] = k.split("=")[1] });

console.log(process.env);
console.log(databaseCred);


let config = {
    server: databaseCred["Data Source"],  //update me
    authentication: {
        type: 'default',
        options: {
            userName: databaseCred["User ID"], //update me
            password: databaseCred["Password"]  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        trustServerCertificate: true
    }
};
var connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) return console.error(err.message);
    console.info("Connected :)");
});

connection.connect();


function queryDatabase(query) {
    let task = query.split(" ")[0].toUpperCase() + "ING";
    console.log(`${task} data from database`);
    // Read all rows from table
    const request = new Request(
        query,
        (err, rowCount) => {
            if (err) {
                console.error(err.message);
            }
        }
    );

    return new Promise((resolve, reject) => {
        const result = [];

        request.on("row", (columns) => {
            const entry = {};
            columns.forEach((column) => {
                entry[column.metadata.colName] = column.value;
            });
            result.push(entry);
        });

        request.on('error', error => reject(error));// some error happened, reject the promise
        request.on('doneProc', () => resolve(result)); // resolve the promise with the result rows.

        db.execSql(request);

    });

} 

global.queryDatabase = queryDatabase;
global.db = connection;


global.teamName = process.env.teamname || teamName;


const app = express();
// configure middleware
app.set('port', port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// routes for the app
app.use('/', homeRoutes);
app.use('/player', playerRoutes);
app.get('*', function (req, res, next) {
    res.status(404);
    res.render('404.ejs', {
        title: "Page Not Found",
    });

});

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
