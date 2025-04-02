// SMS 
var request = require('request');
module.exports = function(phone,msg) {
    const data = {
        api_key : 'd413ba965ae771f637de',
        sender: 'UCCDHR-HRMS',
        phone: (phone != null ? phone : '0277675089'),
        msg
    };
    const url = `http://clientlogin.bulksmsgh.com/smsapi?key=${data.api_key}&to=${data.phone}&msg=${data.msg}&sender_id=${data.sender}`
    const options = {
        method: 'get',
        json: true,
        url: url
    }
    request(options, function (err, res, body) {
        console.log(body);
        if(body == 1000 || body == '1000'){
          console.log('SMS sent successfully!')
        }else{
          console.log('SMS failed!')
        }
    })
};