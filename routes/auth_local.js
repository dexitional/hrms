 var express = require('express');
 module.exports = (function() {
    'use strict';

    var app = express();
    var dbx = require('../config/database');
    // Request
    var request = require('request');
    var md5 = require('md5');
    
    
    // Google Auth2.0
    var { OAuth2Client } = require('google-auth-library');
    var oAuth2Client = new OAuth2Client(
        "196691272149-qf97qgume9vg0o8j3t2qk6qpoakmkr2d.apps.googleusercontent.com",
        "_QXeCJiyrJYK3qc4eI29UcV5",
        [process.env.appType == 'local' && process.env.PORT == '8080' ? "http://localhost:"+process.env.PORT+"/hrm/sauth": "https://hrms.ucc.edu.gh/hrm/sauth"]
    );

    // Generate the url that will be used for the consent dialog.
    var authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/profile.emails.read',
        approval_prompt: 'auto'
    });     
    
    // Check Authentication Middleware
    var isAuthenticated = (req, res, next) => {
        if (req.session.authenticated)
        return next();      
        res.redirect('/admin');
    }

    
    // Staff Google Login URL
    app.get('/hrm/slogin',(req,res) => {  
        res.send(authorizeUrl)
    });

    // Staff Google Code for Main Window
    app.get('/hrm/sauth',async(req,res) => {  
        var out = "<!DOCTYPE html><html><head><title>HRMS AUTH</title>";
            out += "<script type=\"text/javascript\">window.opener.postMessage(location.href,\"*\");</script>";
            out += "</head><body></body></html>"
            res.send(out);
    });
    

    // Staff Google Token
    app.get('/hrm/stoken',async(req,res) => {  
        let qs = req.query.code;
        const r = await oAuth2Client.getToken(qs);
        oAuth2Client.setCredentials(r.tokens);
        req.session.access_token = r.tokens.access_token;
        req.session.save();  
        // Request Google Plus API for data
        const url = 'https://www.googleapis.com/plus/v1/people/me';
        const rex = await oAuth2Client.request({ url });
        if(rex.data.domain == 'ucc.edu.gh'){
            var user = await dbx.query("select u.*,s.*,x.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,j.type as staff_type,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where u.active = '1' and (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL) and s.ucc_mail = trim('"+rex.data.emails[0].value+"')");
            if(user.length > 0){
                req.session.user = user[0];
                let adroles = user[0].roles.split(',').filter(role => {
                    return (role != '03' && role != '04'); 
                });
                req.session.user.adminrole = adroles.length > 0 ? adroles[0] : null;
                req.session.authenticated = true; 
                req.session.save();                                        
                res.redirect('/hrm/dashhrm/dash');
            }else{
                // User Data Needs Update in HR
                req.session.authenticated = false;
                req.session.save();  
                res.render('login', { message: "Please Update Details With DHR!" });
            }
        }else{
            // Authentication failed - User Not in Domain List
            req.session.authenticated = false;
            req.session.save();  
            res.render('login', { message: "Invalid Credentials, Try again!" });
        }
    });



    // Login Route
    app.get('/login',(req,res) => {  
        if(req.session.authenticated != null && req.session.authenticated){
           res.redirect('/hrm/dash'); 
        }else{        
           res.render('login',{message:null});
        }
    });

    
    // Post Login 
    app.post('/login', async(req,res) => { 
        if (!req.body.username || !req.body.password) {
            res.render('login', { message: "Please Enter Login Credentials!" });
        }else{
            let data = [req.body.username,req.body.password];
            try{
                let rows = await dbx.query("select u.*,s.*,x.long_name,x.unit_subhead,p.unit_id as unit_id,p.scale_id as scale_id,p.job_id,p.staff_group,j.type as staff_type,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where u.username = ? and u.password = ? and u.active = '1'",data);
                if(rows.length > 0 ){
                    req.session.user = rows[0];
                    console.log(req.session.user);
                    let adroles = rows[0].roles.split(',').filter(role => {
                        return (role != '03' && role != '04'); 
                    });
                    req.session.user.adminrole = adroles.length > 0 ? adroles[0] : null;
                    req.session.authenticated = true; 
                    req.session.save();
                    res.redirect('/hrm/dash');
                    
                }else{
                    req.session.authenticated = false;
                    req.session.save();
                    res.render('login', { message: "Invalid Credentials, Try again!" }); 
                }
            } catch(e){
                console.log(e);
                req.session.authenticated = false;
                req.session.save();
                res.render('login', { message: "Something is Wrong, Try again!" }); 
            }                             
        } 
    });

    

    app.get('/hrm/dash',isAuthenticated,async(req, res) => {
            let std = await dbx.query("select m.role,s.staff_no as nox,s.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,u.long_name,sc.grade,sc.notch,j.title as jobtitle from staff s left join user m on m.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join bank b on b.id = s.bank_id left join scale sc on sc.id = p.scale_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where s.staff_no = "+req.session.user.staff_no);
            var notes = await dbx.query("select * from notification where read_flag = '0' and staff_no = "+req.session.user.staff_no);
                      
            if((std[0].role != null && req.session.user.adminrole != null) && std[0].role == req.session.user.adminrole){
                res.render('index_hr', {
                    view: 'dash',
                    title: 'HR DASHBOARD ',
                    user: req.session.user,notes
                });
            }else{
                res.redirect('/logout');
            } 
    });

    /*
    app.get('/hrm/dash',isAuthenticated,async(req, res) => {
        if(req.session.user.role == '01' || req.session.user.role == '05' || req.session.user.role == '02' || req.session.user.role == '07' || req.session.user.role == '06' || req.session.user.role == '08'){
            res.render('index_hr', {
                view: 'dash',
                title: 'HR DASHBOARD ',
                user: req.session.user
            });
        }else  if(req.session.user.role == '03' || req.session.user.role == '04'){
            let std = await dbx.query("select s.staff_no as nox,s.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,u.long_name,sc.grade,sc.notch,j.title as jobtitle from staff s left join promotion p on p.id = s.promo_id left join bank b on b.id = s.bank_id left join scale sc on sc.id = p.scale_id left join unit u on p.unit_id = u.id left join job j on p.job_id = j.id where s.staff_no = "+req.session.user.staff_no);
            res.render('index_st', {
                view: 'dash',
                title: 'STAFF DASHBOARD ',
                user: req.session.user,
                data: std[0]
            });
        }else{
            res.redirect('/logout');
        }         
    });
    */



   
    // Logout User
    app.get('/logout',async (req,res) => { 
        // Logging
        let log = {staff_no:req.session.user.staff_no,action:'Logout - successful',ipaddress : '0.0.0.0',datetime:new Date(), accesslevel : req.session.user.role, status : '1'};
        await dbx.query("insert into `log` set ?",log);
        req.session.destroy(function(e){
            req.logout();
            res.redirect('/admin');
        });
    });


    // Install Scripts - For Table Views
    app.get('/install',async (req,res) => { 
        // Leave Table - Views#1
           await dbx.query("create view vw_leave as select x.long_name,l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,relieved_by,approved_days,entitlement,applied_date,s.fname,s.mname,s.lname,s.staff_no,s.staff_no as nox,t.title,p.job_id,status from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join promotion p on p.id = s.promo_id left join unit x on x.id = p.unit_id");
        
    
    });
 
    return app;
})();