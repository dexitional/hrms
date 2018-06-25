
var mysql = require('mysql');
var util = require('util');
var pool = mysql.createPool({
    multipleStatements: true,
    connectionLimit : 100,
    host : "127.0.0.1",
    port : 3306,
    user: "root",
    password:"",
    database : "ucchr"
});

    pool.getConnection((err,conn) => {
        if(err) console.log(err);
            return                     
    }); 
       
    
    pool.query = util.promisify(pool.query);
    module.exports = pool