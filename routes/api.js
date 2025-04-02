var express = require('express');

module.exports = (function() {
    'use strict';
    
    var app = express.Router();
    var dbx = require('../config/database.js');
    // Excel 
    var xls = require("xls-to-json-lc");
    var xlsx = require("xlsx-to-json-lc");
    var json2xls = require("json2xls");
    app.use(json2xls.middleware);
    // MD5 encryption
    var md5 = require('md5');

    // File System
    var fs = require('fs');
    var path = require('path');

    // Moment Business Days
    var moment = require('moment-business-days');
    // E-mail Theme
    var mailer = require('./email');
    // Nodemailler
    var nodemailer = require('nodemailer');
    var mail = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: 'hrms@ucc.edu.gh',
        pass: 'gloria007'
      }
    });
    
    const request = require('request');
    const multer = require('multer');
    const save = require('save-file');

    
    // Photo Upload -  Multer  ---------------------------------------------------
    var mobilestorage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './routes/')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });
    var mobilephoto = multer({ //multer settings
        storage: mobilestorage
    }).single('mobilephoto');
    
    
    var moveFile = (file, dir)=>{
        var f = path.basename(file);
        var dest = path.resolve(dir);
        fs.rename(file, dest, (err)=>{
            if(err) throw err;
            else console.log('Successfully moved');
        });
    };
    var copyFile = (file, dir)=>{
        var f = path.basename(file);
        var source = fs.createReadStream(file);
        var dest = fs.createWriteStream(path.resolve(dir, f));
    
        source.pipe(dest);
        source.on('end', function() { console.log('Succesfully copied'); });
        source.on('error', function(err) { console.log(err); });
    };


    // Load Momment Module -- Configure Holidays
    var loadmoment =  async (req, res, next) => {
        let holidays  = await dbx.query("select date_format(holiday,'%M-%d-%Y') from leave_exclude where year = '"+new Date().getFullYear()+"'");
        moment.locale('us',{holidays,holidayFormat:'MM-DD-YYYY'});                
        return next();             
    }

    // Photo Upload -- Single
    app.post('/sendphoto',mobilephoto,async(req, res) => {
        let id = req.body.tag;
        if(id != undefined && id != null){
            let imgpath = './public/staffpic/'+id+'.jpg';
            let dbpath = '/public/staffpic/'+id+'.jpg';
            let row = await dbx.query("select * from staff where staff_no = "+id);  
            if(row.length > 0){
                if(req.file){
                    moveFile(__dirname+'/'+req.file.filename,imgpath);      
                    await dbx.query("update staff set photo = '"+dbpath+"' where staff_no = "+id);  
                    res.json({success:true,message : 'Photo uploaded successfully'}); 
                    console.log({success:true,message : 'Photo uploaded successfully'});
                }else{ 
                    res.json({success:false,message : 'Photo upload failed!'});
                    console.log({success:false,message : 'Photo upload failed!'});
                }
            }else{ 
                res.json({success:false,message : 'No staff record found!'});
                console.log({success:false,message : 'No staff record found!'});
            }   
        }else{ res.status(402).json({success:false,message : '402 FORBIDDEN!'})}           
    });


    // Photo Upload -- Single
    app.post('/sendnssphoto',mobilephoto,async(req, res) => {
        console.log(req);
        let id = req.body.tag;
        if(id != undefined && id != null){
            let imgpath = './public/nsspic/'+id+'.jpg';
            let dbpath = '/public/nsspic/'+id+'.jpg';
            let row = await dbx.query("select * from nss where nss_no = "+id);  
            if(row.length > 0){
                if(req.file){
                    moveFile(__dirname+'/'+req.file.filename,imgpath);      
                    await dbx.query("update nss set photo = '"+dbpath+"' where nss_no = "+id);  
                    res.json({success:true,message : 'Photo uploaded successfully'}); 
                }else{
                    res.json({success:false,message : 'Photo upload failed!'});
                }
            }else{
                res.json({success:false,message : 'No staff record found!'});
            }   
        }else{
            res.status(402).json({success:false,message : '402 FORBIDDEN!'})
        }           
    });

    app.get('/sendmail',(req,res)=>{
         res.send({test:'true'});
    });

    // Mail Photo Attachement
    app.post('/sendmail',async(req, res) => {
        console.log(req.body);
        let id = req.body.tag;
        let email = req.body.email;
        let imgpath = './public/staffpic/'+id+'.jpg';
        
        let data = {
            sender: 'DHR <hrms@ucc.edu.gh>',
            to: (email != null ? email : 'hrms@ucc.edu.gh'),
            subject: "ID Card Photo - Staff Number : "+id,
            text: `Greetings Sir, Please find attached the Staff photo tagged ${id}.\n\nThank you very much`,
            html: `Greetings Sir, Please find attached the Staff photo tagged ${id}.\n\nThank you very much`,
            attachments: [{
                    path: imgpath
            }]
        };
        mail.sendMail(data,(err,info)=>{
            if(err){res.json({success:false,message : err});console.log(err)}
            else{res.json({success:true,message : 'Photo mailed successfully'});console.log(info)}  
        });
    });


     // Mail Photo to 
     app.get('/sendmail/:tag',async(req, res) => {
        console.log(req.body);
        let id = req.params.tag;
        let email = 'ucb.branch@prudentialbank.com.gh';
        let imgpath = './public/staffpic/'+id+'.jpg';
        
        let data = {
            sender: 'DHR <hrms@ucc.edu.gh>',
            to: (email != null ? email : 'hrms@ucc.edu.gh'),
            subject: "ID Card Photo - Staff Number : "+id,
            text: `Greetings Sir, Please find attached the Staff photo tagged ${id}.\n\nThank you very much`,
            html: `Greetings Sir, Please find attached the Staff photo tagged ${id}.\n\nThank you very much`,
            attachments: [{
                path: imgpath
            }]
        };
        mail.sendMail(data,(err,info)=>{
            if(err){res.json({success:false,message : err});console.log(err)}
            else{res.json({success:true,message : 'Photo mailed successfully'});console.log(info)}  
        });
    });

    return app;
    
})();