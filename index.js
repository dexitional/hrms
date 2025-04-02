var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var compression = require('compression');
var helmet = require('helmet');
var json2xls = require("json2xls");
// Routes
var route = require('./routes/route');
var lauth = require('./routes/auth_local');
var gauth = require('./routes/auth_google');
var cronjob = require('./routes/cron_job');
var api = require('./routes/api');
// Socket IO
var io = require('socket.io')();
// Initialise Applications
var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("/public",express.static("public"));
app.use("/routes",express.static("routes"));
app.use("/modules",express.static("node_modules"));
app.use("/partials",express.static("views/partials"));
app.use(cors()); // Origin cross browser
app.use(compression()); // Site Compression
app.use(helmet()); // Security & Vulnearbilities guard
app.use(json2xls.middleware); // Excel export

app.use(session({
    secret: 'sess', 
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false , maxAge:  24 * 60 * 60 * 1000 } //7 * 24 * 60 * 60 * 1000
}));


// Initialise API Routes
app.use(cronjob);
app.use(gauth);
app.use(lauth);
app.use('/api',api); 
app.use(route);



var port = process.env.PORT || 8080;
var server = app.listen(port, () => {
    console.log("Server started on Port : "+port);
});

// Attach Socket.io
io.attach(server);
let users = [];
let conn = [];

io.on('connection',(socket) => {
    console.log("User Connected!");

    // Connected User
    /*
    socket.on('token',(data) => {
        // || data.username == '15404' || data.username == '12630' || data.username == '15529'
        data.isadmin = (data.username == '15666' ) ? true : false;
        // Store User
        const user = users.find((item)=> item.username === data.username);
        if(user){
            users[users.indexOf(user)].socket = socket;
        }else{
            users.push({username:data.username,photo:data.photo,isadmin:data.isadmin,socket});
        }
        if(data.isadmin){
            const info = {
                message : "Hi! How can I help you?",
                photo : data.photo,
                receiver : null,
                sender : data.username,
                time : getTime(new Date())
            }
            //socket.broadcast.emit('setadmin',data.username);
            socket.broadcast.emit("updateMessage", info);
        }else{
            const admin = users.find((item) => item.isadmin === true);
            if(admin){
                const info = {
                    message : "Welcome! How can I help you?",
                    photo : admin.photo,
                    receiver : null,
                    sender : admin.username,
                    time : getTime(new Date())
                }
                socket.broadcast.emit('setadmin',admin.username);
                socket.broadcast.emit("updateMessage", info);
            }
        }
        
        
        socket.broadcast.emit('online',users);
        //console.log(users);
    });
   */

    socket.on('token',(data) => {
        const hr = '15666';
        const user = users.find((item) => item.username == data.username);
        const user_1 = conn.find((item) => item == data.username);
        if(user){
            users[users.indexOf(user)].socket = socket;
        }else{
            users.push({username:data.username,photo:data.photo,isadmin:data.isadmin,socket:socket});
        }
        if(!user_1){
            conn.push(data.username);
        }
        const admin = users.find((item) => item.username == hr);
        if(admin){
            // If Admin is online
            io.emit('setadmin',hr);
        }else{
            // Else Admin offline
            io.emit('setadmin','hr');
        }
        io.emit('onlines',conn);
        console.log(conn);
    });
  

    // Disconnect
    socket.on('disconnect',function(){
        const user = users.find((item)=> item.socket === socket);
        users.splice(users.indexOf(user),1);
    });
 
    // Logout
    socket.on('logout',function(data){
        const user = users.find((item) => item.username === data.user);
        users.splice(users.indexOf(user),1);
        socket.emit('logout',{});
    });
 
   
    // Send Message
    socket.on('postMessage',function(data){
        const sender = users.find((item) => item.username == data.sender);
        const receiver = users.find((item) => item.username == data.receiver);
        if (sender && receiver){
            console.log('RECEIVER_SENDER');
            console.log(receiver);
            //io.emit("updateMessage", data);
            data.channel = data.sender+'_'+data.receiver;
            socket.emit("updateMessage", data);
            //receiver.socket.emit("updateMessage", data);
            //socket.connected[sender.socket.id].emit("updateMessage", data);
            //socket.Sockets[sender.socket.id].emit("updateMessage", data);
            //socket.Sockets[receiver.socket.id].emit("updateMessage", data);
            socket.broadcast.to(`${receiver.socket.id}`).emit("updateMessage", data);
            //socket.broadcast.to(`${sender.socket.id}`).emit("updateMessage", data);
            console.log(users);
            //io.emit('onlines',users);
         
        }else if(sender && receiver == undefined){ 
            console.log('_SENDER');
            data.channel = data.sender+'_'+data.sender;
            socket.emit("updateMessage", data);
        }
      
    });
    

    // Send Typing
    socket.on('typing',function(data){
        const receiver = users.find((item) => item.username == data.receiver);
        if(receiver){
          //socket.broadcast.to(`${receiver.socket.id}`).emit("receiveTyping", data);
        }
    });
  
    /*
    function updateUsers(){
        io.emit('online',users);
    }
    */

    function getTime(date){
        return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`;
    }
   


});
