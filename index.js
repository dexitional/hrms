var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cors = require('cors');




// Importing DB Connection
var con = require('./config/connection');
var dbx = require('./config/database');

// Import modules Initialiser
var init = require('./models/init');

// Initialise Applications
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("/public",express.static("public"));
app.use("/partials",express.static("views/partials"));
app.use(session({
    secret: 'hrsessions', 
    resave: true,
    saveUninitialized: true}));
app.set("view engine","ejs");
app.use('/viewer', express.static('node_modules/node-viewerjs')); // PDF & DOCUMENT VIEWER
app.use(cors()); // CORS -- Origin cross browser

// Importing Routes
var route = require('./routes/route');
var port = 8080;

// Initialise API Routes
   route(app,con,init,dbx);

// Starting  Web Server
    app.listen(port, () => {
        console.log("Server started on Port : "+port);
    });