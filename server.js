
/*
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
// Initializing Redis

const redis = require('redis').createClient({
    host: 'localhost',
    port: 6379,
    password: '30eccb12f4ea61060c7f4636b187f323092f8bf1df69506e194ab79abaa11c37'
});
var RedisStore = require('connect-redis')(session);

//var SQLiteStore = require('connect-sqlite3')(session);
var cors = require('cors');
var compression = require('compression');
var helmet = require('helmet');
var json2xls = require("json2xls");
// Importing DB Connection
var dbx = require('./config/database');
// Importing Routes
var route = require('./routes/route');
var gauth = require('./routes/auth');
var api = require('./routes/api');
// Socket IO
var io = require('socket.io')();
// Initialise Applications
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()); app.use("/public",express.static("public"));
app.use("/routes",express.static("routes"));
app.use("/modules",express.static("node_modules"));
app.use("/partials",express.static("views/partials"));


app.use(session({
	name: 'sid',
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
	cookie: {
		// Share cookie through sub domains if you use many domains for service architecture
		domain : '.192.168.0.22',
		maxAge : Date.now() + 60000
	},
	store: new RedisStore({client:redis,prefix:'session:',ttl:3600 })
}));

app.set("view engine","ejs");
app.use(cors()); // Origin cross browser
app.use(compression()); // Site Compression
app.use(helmet()); // Security & Vulnearbilities guard
app.use(json2xls.middleware); // Excel export


*/


var express = require('express');
var session = require('express-session');
const redis = require('redis').createClient({
    host: 'localhost',
    port: 6379,
    password: '30eccb12f4ea61060c7f4636b187f323092f8bf1df69506e194ab79abaa11c37',
    db: 1,
});
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(session({
	name: 'sid',
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
	cookie: {
		maxAge : Date.now() + 60000
	},
	store: new RedisStore({client:redis,prefix:'session:',ttl:3600 })
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/',function(req,res){ 
    // create new session object.
    if(req.session.key) {
        // if email key is sent redirect.
        res.json(req.session.key);
    } else {
        // else go to home page.
        res.send("Session Failed!");
    }
});

app.get('/login',function(req,res){
    req.session.key = "Ebenezer k.b. ackah";
    res.end('done');
});


app.get('/test',function(req,res){
    res.send('working');
});


app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.listen(8082,function(){
    console.log("App Started on PORT 8082");
});