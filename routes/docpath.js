// SMS 
var dbx = require('../config/database.js');
module.exports = async function(path) {
    console.log(path);
    let data = await dbx.query("select * from doc where id = "+path);
    return data[0].path;
};  