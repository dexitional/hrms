
var mysql = require('mysql');
var pool = mysql.createPool({
    multipleStatements: true,
    connectionLimit : 1000,
    host : "127.0.0.1",
    //host : "192.168.17.205",
    port : 3306,
    user: "root",
    password:"",
    database : "ucchr"
});


/*
var mysql = require('mysql').Client;
var client = new mysql();
client.host = '192.168.17.205';
client.user = 'user';
client.password = '';
console.log("connecting...");
*/

   
module.exports = (callback) => {
      
        pool.getConnection((err,conn) => {
            if(err) return err;
             callback(err,conn);                     
        }); 
       
       /*
        client.connect(function (err, results) {           
            callback(err, client);
        });
        */
};