 var express = require('express');
 module.exports = (function() {
    'use strict';

    var app = express();
    var dbx = require('../config/database');
    var passport = require('passport');
    var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

    app.use(passport.initialize()); 
    app.use(passport.session()); 

    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    
    passport.use(new GoogleStrategy({
        clientID:  "196691272149-qf97qgume9vg0o8j3t2qk6qpoakmkr2d.apps.googleusercontent.com",
        clientSecret: "_QXeCJiyrJYK3qc4eI29UcV5",
        callbackURL: "/hrm/auth/google/callback",
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
        },
        function(request, accessToken, refreshToken, profile, done) {
            if (profile._json.domain !== 'ucc.edu.gh') {
                return done(new Error("Wrong domain!"));
            } else {
                const  user = {id : profile.id, name: profile.name, email : profile.email, domain : profile._json.domain};
                return done(null, user);
            }
        }
    ));


    app.get('/hrm/auth/google',
        passport.authenticate('google', { hd: 'ucc.edu.gh',prompt: 'select_account',scope:[ 'email', 'profile' ] }
    ));

    app.get('/hrm/auth/google/callback',
        passport.authenticate( 'google', {
            successRedirect: '/hrm/success',
            failureRedirect: '/login?failed'
    }),(req,res)=>{
        console.log(req.user);
    });


     // Staff Google Token
     app.get('/hrm/success',async(req,res) => {  
         //res.send(req.user);
         if(req.user.domain == 'ucc.edu.gh'){
            var user = await dbx.query("select u.*,s.*,x.*,p.unit_id,p.scale_id,p.job_id,p.staff_group,j.type as staff_type,r.desc as privilege from user u left join staff s on u.staff_no = s.staff_no left join user_roles r on r.role = u.role left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit x on p.unit_id = x.id where u.active = '1' and (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL) and s.ucc_mail = trim('"+req.user.email+"')");
            console.log(user);
            if(user.length > 0){
                // User Exist in HR 
                req.session.user = user[0];
                let stroles = user[0].roles.split(',').filter(role => {
                    return (role == '03' || role == '04'); 
                });
                let adroles = user[0].roles.split(',').filter(role => {
                    return (role != '03' && role != '04'); 
                });
                req.session.user.staffrole = stroles.length > 0 ? (user[0]['unit_subhead'] != null && user[0]['unit_subhead'] == user[0]['staff_no']  ? '04' : stroles[0]) : null;
                req.session.user.adminrole = adroles.length > 0 ? adroles[0] : null;
                req.session.user.page = (user[0].role == '04' || user[0].role == '03') ? 'staff':'admin';
                req.session.authenticated = true; 
                req.session.user.disclaim = true;
                req.session.save();                                        
                res.redirect('/hrm/dash');
            }else{
                // User Data Needs Update in HR
                req.session.authenticated = false;
                req.session.save();  
                res.render('login', { message: "Please Update Details With DHR!" });
                //res.send("Confirm & Update Details with UCC-HR!");
            }
        }else{
            // Authentication failed - User Not in Domain List
            req.session.authenticated = false;
            req.session.save();  
            //res.render('login', { message: "User Doesn't Exist in Our Domain !" });
            res.render('login', { message: "Invalid Credentials, Try again!" });
            console.log("User Doesnt Exist in Our Domain!");
        }
        
    });


    return app;
})();