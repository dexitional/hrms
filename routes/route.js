var express = require('express');
module.exports = (function() {
    //'use strict';
    
            var app = express.Router();
            var dbx = require('../config/database.js');
            // Excel 
            var xls = require("xls-to-json-lc");
            var xlsx = require("xlsx-to-json-lc");
            var json2xls = require("json2xls");
            app.use(json2xls.middleware);
            // File System
            var fs = require('fs');
            var path = require('path');
            // Moment Business Days
            var moment = require('moment-business-days');
            // E-mail Theme
            var mailer = require('../routes/email');
            // SMS - Theme
            var sms = require('../config/sms');
            // Document finder
            var docfinder = require('../routes/docpath');
            // Nodemailler
            var nodemailer = require('nodemailer');
            var mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: 'hrms@ucc.edu.gh',
                    pass: 'gloria007'
                }
            });
            
            // Request
            var request = require('request');
            // File Upload
            const multer = require('multer');
            const save = require('save-file');

            // Photo Upload -  Multer  ---------------------------------------------------
            var camstorage = multer.diskStorage({ //multers disk storage settings
                destination: function (req, file, cb) {
                    cb(null, './routes/')
                },
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
                }
            });
            var cam = multer({ //multer settings
                storage: camstorage
            }).single('photo');
            //---------------------------------------------------------------------------

            var docStore = multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, './public/docs');
                },
                filename: (req, file, cb) => {
                    const ext = file.mimetype.split('/')[1];
                    cb(null, Date.now()+'_'+ file.originalname);
                }
            });

            var certStore = multer.diskStorage({
                destination: (req, file, next) => {
                    next(null, './public/upload/cert');
                },
                filename: (req, file, next) => {
                    next(null, Date.now() + '_' + file.originalname);
                }
            });

            var appointStore = multer.diskStorage({
                destination: (req, file, next) => {
                    next(null, './public/upload/appoint');
                },
                filename: (req, file, next) => {
                    const ext = file.mimetype.split('/')[1];
                    //next(null, file.fieldname + '-' + Date.now() + '.' + ext);
                    next(null, Date.now()+'_'+file.originalname);
                }
            });


            var relateStore = multer.diskStorage({
                destination: (req, file, next) => {
                    next(null, './public/upload/relative');
                },
                filename: (req, file, next) => {
                    const ext = file.mimetype.split('/')[1];      
                    next(null, Date.now()+ '_'+file.originalname);
                }
            });


            var leaveStore = multer.diskStorage({
                destination: (req, file, next) => {
                    next(null, './public/upload/leave');
                },
                filename: (req, file, next) => {
                    const ext = file.mimetype.split('/')[1];      
                    next(null, Date.now()+ '_'+file.originalname);
                }
            });

            var doc = multer({ storage: docStore }).fields([
                { name: 'birth_cert', maxCount: 1},
                { name: 'cv_cert', maxCount: 1},
                { name: 'ma_cert', maxCount: 1 },
                { name: 'medic_cert', maxCount: 1 },
                { name: 'appoint_cert', maxCount: 1 },
                { name: 'attachment', maxCount: 1 },
                { name: 'form_attachment', maxCount: 1 },
                { name: 'report_attachment', maxCount: 1 },
                { name: 'paper_attachment', maxCount: 1 }
                
            ]);
            var cert = multer({ storage: certStore}).single('cert');
            var relative = multer({ storage: relateStore}).fields([
                { name: 'photo', maxCount: 1},
                { name: 'birth', maxCount: 1}    
            ]);
            var leave = multer({ storage: leaveStore}).single('leave_cert');

            
            // NSS PHOTO MULTER
            var nssphotostore = multer.diskStorage({ 
                destination: function (req, file, cb) {
                    cb(null, './routes/')
                },
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
                }
            });
            var nssphoto = multer({ 
                storage: nssphotostore
            }).single('nssphoto');


            // NSS DOC MULTER
            var nssformstore = multer.diskStorage({ 
                destination: function (req, file, cb) {
                    cb(null, './routes/')
                },
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
                }
            });
            var nssform = multer({ 
                storage: nssformstore,
            }).single('nssform');

            // CIRCULAR FILE MULTER
            var circularstore = multer.diskStorage({ 
                destination: function (req, file, cb) {
                    cb(null, './routes/')
                },
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
                }
            });
            var circularfile = multer({ 
                storage: circularstore,
            }).single('circular');

            // EXCEL

            var excel = multer({ 
                storage: leaveStore,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('excel');


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



           // Check Authentication Middleware
           var isAuthenticated = (req, res, next) => {
                if (req.session.authenticated)
                return next();      
                res.redirect('/admin');
           }


           // Check Admin Access Middleware
           var isAdmin = (req, res, next) => {
                if (req.session.user.role != '03' && req.session.user.role != '04')
                    return next();      
                res.redirect('/hrm/dash');
            }

            // Initialize Holidays
            /*let holidays  = await dbx.query("select date_format(holiday,'%m-%d-%Y') as holiday from leave_exclude where (year = '"+new Date().getFullYear()+"' or year = '"+(new Date().getFullYear()+1)+"')");
            holidays = holidays.map(h => {
              return h.holiday;
            })
            moment.updateLocale('us',{holidays,holidayFormat:'MM-DD-YYYY'});
            */
              
            // Load Momment Module -- Configure Holidays
            var loadmoment =  async (req, res, next) => {
                let holidays  = await dbx.query("select date_format(holiday,'%m-%d-%Y') as holiday from leave_exclude where (year = '"+new Date().getFullYear()+"' or year = '"+(new Date().getFullYear()+1)+"')");
                holidays = holidays.map(h => {
                     return h.holiday;
                })
                moment.updateLocale('us',{
                    holidays,
                    holidayFormat:'MM-DD-YYYY',
                    workingWeekdays: [1,2,3,4,5],
                    nextBusinessDayLimit: 365,
                    prevBusinessDayLimit:31
                });
                return next();             
            }

            var updateholidays = async () => {
                let holidays  = await dbx.query("select date_format(holiday,'%m-%d-%Y') as holiday from leave_exclude where (year = '"+new Date().getFullYear()+"' or year = '"+(new Date().getFullYear()+1)+"')");
                holidays = holidays.map(h => {
                     return h.holiday;
                })
                moment.updateLocale('us',{
                    holidays,
                    holidayFormat:'MM-DD-YYYY',
                    workingWeekdays: [1,2,3,4,5],
                    nextBusinessDayLimit: 365,
                    prevBusinessDayLimit:31
                });
            }

            // SMS API - Mnotify
            var sms_api = {name : 'mnotify.net', apikey : 'B8pRALyxDgt4l5nRLOYVPoIm1', endpoint : 'https://apps.mnotify.net/smsapi'};
 
           
            // Main Routes 
            app.get('/',(req,res) => {         
                res.redirect('https://staffportal.ucc.edu.gh');                  
            });

            // Admin Login
            app.get('/admin',(req,res) => {         
                res.redirect('/login');                  
            });


            app.get('/kobby',(req,res) => {         
                res.json({watch:'working now'});                  
            });


            /* HR MODULE ROUTING */

            // HRM Page
            app.get('/hrm', (req, res) => {
                res.redirect('/hrm/staff');
            });

           

            // Staff Module - JSON
            app.post('/hrm/staff/gson',isAuthenticated,async(req,res) => { 
                    console.log(req.body);         
                    let sqlRec = "";
                    let sqlTot = "";
                    let where = "";           
                    const params = req.body;
                    const columns = Array(8);
                    columns[0] = 'staff_no';
                    columns[1] = 'name';
                    columns[2] = 'gender';
                    columns[3] = 'phone';
                    columns[4] = 'job_title';
                    columns[5] = 'long_name';
                    columns[6] = 'ucc_mail';
                    columns[7] = 'action';          
                    
                    if(params.search.value != ''){
                        //where += " where ";
                        where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                        where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                        where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                        where += " or fname like '%"+params.search.value.trim()+"%' ";
                        where += " or mname like '%"+params.search.value.trim()+"%' ";
                        where += " or lname like '%"+params.search.value.trim()+"%' ";
                        where += " or b.title like '%"+params.search.value.trim()+"%' ";
                        where += " or u.long_name like '%"+params.search.value+"%' ";
                        where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                        where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                        where += " or phone like '%"+params.search.value.trim()+"%') ";
                        // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                    }
                    
                    let sql = "select DATE_FORMAT(s.dob,'%Y-%m-%d') as dobx,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.staff_no as nox,s.*,u.*,sc.*,b.title as job_title,sc.grade as scale from staff s left join promotion p on s.promo_id = p.id left join job b on p.job_id = b.id left join unit u on u.id = p.unit_id left join scale sc on sc.id = p.scale_id where s.flag_delete = 0  and s.staff_status IN ('TEMPORAL','PERMANENT','CONTRACT','CASUAL','PART-TIME')";
                    sqlRec += sql;
                    sqlTot += sql;

                    if(where != ''){
                        sqlRec += where;
                        sqlTot += where;
                    }
                    sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                    let rowsRec = await dbx.query(sqlRec); 
                    let rowsTot = await dbx.query(sqlTot);
                    let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                            let m = 0;
                            if(m == 0){
                            //var token = new Date().getFullYear()+''+(new Date().getMonth()+1)+''+new Date().getDate();
                            var token = moment().format('YYYYMMDD');
                            row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                            row.staff_no += '<center><h5 style="'+(row.staff_group != null ? row.staff_group+'-':'')+(row.staff_status == 'TEMPORAL' ? 'color:#eea236' : (row.staff_status == 'PERMANENT' ? 'color:seagreen' : (row.staff_status == null ? 'color:seablue' : 'color:brown')))+'">'+row.nox+'</h5></center>';
                            row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;">
                                             ${req.session.user.adminrole != '01' ?`<a class="btn btn-primary btn-sm" href="/hrm/staff/page/${row.nox}" title="Goto Staff Folder"><i class="fa fa-folder-open"></i></a>`:``}
                                             ${req.session.user.adminrole == '01' ?`<a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/staff/view/${row.nox}"><i class="fa fa-file-text-o"></i></a>`:``}
                                             ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Upload Staff Photo" href="/hrm/photos/${row.nox}" onclick="return confirm(\'Upload Staff Photo?\');"><i class="fa fa-photo"></i></a>`:``}
                                             ${req.session.user.adminrole == '08' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Delete Staff Folder" href="/hrm/${['08','07','06'].includes(req.session.user.role) ? 'remstaff':'delstaff'}/${row.nox}" onclick="return confirm(\'Delete Staff?\');"><i class="fa fa-trash"></i></a>`:``}
                                          </div>`;     
                                            row.action += `<div class="btn-group" style="width:155px;margin:5px 0 5px -50px;">
                                            ${req.session.user.adminrole != '01' ?`<a class="btn btn-danger btn-sm" href="/hrm/exitstaff/${row.nox}" title="End Service for Staff!" onclick="return confirm('End Service of Staff - ${row.name} ?')"><i class="fa fa-power-off"></i></a>`:``}
                                            ${req.session.user.adminrole == '01' ?`<a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/gotousp/${row.nox}"><i class="fa fa-power-off"></i></a>`:``}
                                            ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" target="_blank" title="Goto USP" href="${process.env.NODE_ENV == 'development' ? 'http://localhost/sportal':'https://staffportal.ucc.edu.gh'}/hrmsapp/${row.nox}?token=${token}" onclick="return confirm(\'Goto USP of Staff ?\');"><i class="fa fa-chevron-right"></i> USP</a>`:``}
                                          </div>`;            
                            }
                            return row;
                    }));
                    res.json({
                        draw : Number(params.draw),
                        recordsTotal : Number(rowsTot.length),
                        recordsFiltered : Number(rowsTot.length),
                        data: data
                    });    
            });
        
            // Inactive Staff Module - JSON
            app.post('/hrm/staff/inactive/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(9);
                columns[0] = 'staff_no';
                columns[1] = 'name';
                columns[2] = 'gender';
                columns[3] = 'phone';
                columns[4] = 'job_title';
                columns[5] = 'long_name';
                columns[6] = 'staff_status';
                columns[7] = 'exit_remark';          
                columns[8] = 'action';          
                
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or b.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or phone like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select DATE_FORMAT(s.exit_date,'%Y-%m-%d') as exit_date,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.staff_no as nox,s.*,u.*,sc.*,b.title as job_title,sc.grade as scale from staff s left join promotion p on s.promo_id = p.id left join job b on p.job_id = b.id left join unit u on u.id = p.unit_id left join scale sc on sc.id = p.scale_id where s.flag_delete = 0 and (s.staff_status != 'TEMPORAL' and s.staff_status != 'PERMANENT') ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                        row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.staff_no += '<center><h5 style="'+(row.staff_group != null ? row.staff_group+'-':'')+(row.staff_status == 'DEAD' ? 'color:#eea236' : (row.staff_status == 'RETIRED' ? 'color:seagreen' : (row.staff_status == null ? 'color:seablue' : 'color:brown')))+'">'+row.nox+'</h5></center>';
                        row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;">
                                         ${req.session.user.adminrole == '07' || req.session.user.adminrole == '08' ?`<a class="btn btn-primary btn-sm" href="/hrm/staff/page/${row.nox}" title="Goto Staff Folder"><i class="fa fa-folder-open"></i></a>`:``}
                                         <a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/staff/view/${row.nox}"><i class="fa fa-file-text-o"></i></a>
                                         ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Upload Staff Photo" href="/hrm/photos/${row.nox}" onclick="return confirm(\'Upload Staff Photo?\');"><i class="fa fa-photo"></i></a>`:``}
                                      </div>`;  
                        row.staff_status = `<button class="btn btn-sm"><b><small>${row.staff_status}</small></b></button><br><center><small>Exited On: ${row.exit_date != null ? row.exit_date : 'Date Not Set'}</small></center>`; 
                        row.exit_remark = row.exit_remark != null ? `<button class="btn btn-sm btn-warning"><b> <i class="fa fa-calendar"></i>&nbsp;&nbsp;<small>${row.exit_remark}</small></b></button>` : '';         
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
            });


            // Staff Module - JSON
            app.post('/hrm/parttimers/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(9);
                columns[0] = 'appt_no';
                columns[1] = 'name';
                columns[2] = 'gender';
                columns[3] = 'phone';
                columns[4] = 'job_title';
                columns[5] = 'long_name';
                columns[6] = 'email';
                columns[7] = 'sso_mail';
                columns[8] = 'action';          
                
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.appt_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or b.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or phone like '%"+params.search.value.trim()+"%' ";
                    where += " or sso_mail like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select DATE_FORMAT(s.dob,'%Y-%m-%d') as dobx,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.appt_no as nox,s.*,u.*,sc.*,upper(ifnull(b.title,s.designation)) as job_title from aux_staff s left join promotion p on s.promo_id = p.id left join job b on p.job_id = b.id left join unit u on u.id = p.unit_id left join scale sc on sc.id = p.scale_id where s.status_id is null";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += " order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                        var token = new Date().getFullYear()+''+(new Date().getMonth()+1)+''+new Date().getDate();
                        row.appt_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.appt_no += '<center><h5 style="'+(row.staff_group != null ? row.staff_group+'-':'')+(row.staff_status == 'TEMPORAL' ? 'color:#eea236' : (row.staff_status == 'PERMANENT' ? 'color:seagreen' : (row.staff_status == null ? 'color:seablue' : 'color:brown')))+'">'+row.nox+'</h5></center>';
                        row.appt_no += row.is_member == '1' && row.ucc_no != null ? '<center><h6 style="color:brown;font-size:12px;font-weight:bolder;">( UCC STAFF NO: '+row.ucc_no+' )</h5></center>':'';
                        row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;">
                                         ${req.session.user.adminrole != '01' ?`<a class="btn btn-primary btn-sm" href="/hrm/staff/page/${row.nox}" title="Goto Staff Folder"><i class="fa fa-folder-open"></i></a>`:``}
                                         ${req.session.user.adminrole == '01' ?`<a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/staff/view/${row.nox}"><i class="fa fa-file-text-o"></i></a>`:``}
                                         ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Upload Staff Photo" href="/hrm/photos/${row.nox}" onclick="return confirm(\'Upload Staff Photo?\');"><i class="fa fa-photo"></i></a>`:``}
                                         ${req.session.user.adminrole == '08' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Delete Staff Folder" href="/hrm/${['08','07','06'].includes(req.session.user.role) ? 'remstaff':'delstaff'}/${row.nox}" onclick="return confirm(\'Delete Staff?\');"><i class="fa fa-trash"></i></a>`:``}
                                      </div>`;     
                                        row.action += `<div class="btn-group" style="width:155px;margin:5px 0 5px -50px;">
                                        ${req.session.user.adminrole != '01' ?`<a class="btn btn-danger btn-sm" href="/hrm/exitstaff/${row.nox}" title="End Service for Staff!" onclick="return confirm('End Service of Staff - ${row.name} ?')"><i class="fa fa-power-off"></i></a>`:``}
                                        ${req.session.user.adminrole == '01' ?`<a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/gotousp/${row.nox}"><i class="fa fa-power-off"></i></a>`:``}
                                        ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" target="_blank" title="Goto USP" href="${process.env.appType == 'local' ? 'http://localhost/sportal':'https://staffportal.ucc.edu.gh'}/hrmsapp/${row.nox}?token=${token}" onclick="return confirm(\'Goto USP of Staff ?\');"><i class="fa fa-chevron-right"></i> USP</a>`:``}
                                      </div>`;            
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });


            // FOYER API CALL#1  -  STAFF 
            
            // Staff Module - JSON
            app.post('/hrm/staff/foyer',async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(4);
                columns[0] = 'staff_no';
                columns[1] = 'name';
                columns[2] = 'long_name';
               // columns[3] = 'phone';
                columns[3] = 'action';          
                
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or b.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or phone like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select DATE_FORMAT(s.dob,'%Y-%m-%d') as dobx,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.staff_no as nox,s.*,u.*,sc.*,b.title as job_title,sc.grade as scale from staff s left join promotion p on s.promo_id = p.id left join job b on p.job_id = b.id left join unit u on u.id = p.unit_id left join scale sc on sc.id = p.scale_id where s.flag_delete = 0  and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT' or s.staff_status = 'CONTRACT') ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                        row.staff_no = (row.photo != null ? '<a href="http://localhost:8080'+row.photo+'" target="_blank"><img src="http://localhost:8080'+row.photo+'" style="height:40px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/></a>':'<i class="icon fa fa-camera fa-2x" style="border-radius:50%;margin:5px auto;padding-top:5px;color:#fff;text-align:center;width:40px;height:40px;background:steelblue;"></i></a>');
                        row.action = `<div class="btn-group" style="width:100px;margin-left:0px;">
                                            <button class="btn btn-sm btn-info" style="" onclick="choose('${row.nox}','STAFF')">OK</button>
                                     </div>`;            
                        }
                        row.name = `${row.name}<br><small><b style="color:steelblue;">${row.nox}</b> - <b>${row.phone != null ? row.phone : ''}</b></small>`
                        row.long_name = `<small style="color:steelblue;"><b>${row.long_name != null ? row.long_name : '' }</b></small>`
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
            });

    
            app.get('/hrm/staff/foyer',async(req,res) => {
                res.json({msg:'working yo!'})
             });


            // Staff Module - JSON
            app.get('/hrm/staff',isAuthenticated,isAdmin,async(req,res) => {              
                let rows = await dbx.query("select id,staff_no,fname,mname,lname,gender from staff s");                  
                res.render('index_hr',{
                    view:'staff',
                    title:'STAFF MODULE',
                    data: rows,
                    user: req.session.user
                });                  
            });
        

            // Staff Module - JSON
            app.get('/hrm/staff/json',isAuthenticated,isAdmin, async(req,res) => {                
                let rows = await dbx.query("select id,staff_no,fname,mname,lname,gender from staff s");                  
                res.json(rows);                  
            });

            
            // Staff Photo Data - JSON
            app.get('/hrm/staff/getdata/:data',isAuthenticated,isAdmin, async(req,res) => { 
                let stno = req.params.data; 
                let rows = await dbx.query("select staff_no,fname,mname,lname,gender,photo from staff where staff_no = "+stno);                  
                if(rows.length > 0){
                    res.json(rows[0]); 
                }else{
                    res.json({photo:null,fname:null});       
                }                            
            });

            // Staff -- Staff Remove Photo
            app.get('/hrm/staff/rempic/:id',isAuthenticated,async(req,res) => { 
                let id = req.params.id;
                let row = await dbx.query("select * from staff where staff_no = "+id);    
                try{ 
                    fs.unlinkSync('.'+row[0].photo)  
                }catch(e){
                    console.log(e);
                };
                await dbx.query("update staff set photo = null where staff_no = "+id);   
                // Redirect to Photos page
                res.redirect('/hrm/photos');           
            });


            // Staff -- Webcam Page
            app.get('/hrm/staff/cam/:id',isAuthenticated,async(req,res) => { 
                let id = req.params.id;
                let row = await dbx.query("select * from staff where staff_no = "+id);
                res.render('partials/cam',{row:row[0]});
            
            });

            // Staff -- CamSave File
            app.post('/hrm/staff/camsave/',isAuthenticated,cam,async(req,res) => { 
                let id = req.query.id;
                let row = await dbx.query("select * from staff where staff_no = "+id);                
                let index = row[0].staff_no;
                let imgpath = './public/staffpic/'+index+'.jpg';
                let dbpath = '/public/staffpic/'+index+'.jpg';
                if(!req.file){
                    save(req.body.data_uri, imgpath, async(err, data) => {  
                        if(err) throw err;
                        console.log(data);
                        await dbx.query("update staff set photo = '"+dbpath+"' where staff_no = "+id);               
                    });

                }else{
                    moveFile(__dirname+'/'+req.file.filename,imgpath);      
                    await dbx.query("update staff set photo = '"+dbpath+"' where staff_no = "+id);                    
                }
                // Redirect to Photos page
                res.redirect('/hrm/photos/'+id);   
            });






        // Staff Appointment Letter
        app.get('/hrm/staff/appoint/:id',isAuthenticated,async(req,res) => {                
        let rows = await dbx.query("select * from appoint_promo where category = 'APPOINTMENT' and id = "+req.params.id);                  
        let pa = rows[0].path.toString().split('\\').join('/'); 
        res.redirect("/viewer/#"+pa);                          
        });


        // Post Staff Biodata
        app.post('/hrm/poststaff',isAuthenticated,doc,async(req,res)=>{       
                         
               if(req.files != null){   
                   
                   if (req.files.birth_cert != null){
                        await dbx.query("update doc set `default` = null where category = 'BIRTH' and staff_no = "+req.body.staff_no);
                        let data = { title: 'BIRTH CERTIFICATE OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'BIRTH', path: '\\'+req.files.birth_cert[0].path, active: '1', default:'1' };
                        await dbx.query("insert into doc set ?",data);
                   }

                   if (req.files.cv_cert != null) {
                        await dbx.query("update doc set `default` = null where category = 'CV' and staff_no = "+req.body.staff_no);
                        let data = { title: 'CURRICULUM VITAE OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'CV', path: '\\' + req.files.cv_cert[0].path, active: '1', default:'1' };
                        await dbx.query("insert into doc set ?", data);
                   }

                   if (req.files.ma_cert != null) {
                        await dbx.query("update doc set `default` = null where category = 'MARITAL' and staff_no = "+req.body.staff_no);
                        let data = { title: 'MARRIAGE CERTIFICATE OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'MARITAL', path: '\\' + req.files.ma_cert[0].path, active: '1', default:'1' };
                        await dbx.query("insert into doc set ?", data);
                   }

                   if (req.files.medic_cert != null) {
                       await dbx.query("update doc set `default` = null where category = 'MEDICAL' and staff_no = "+req.body.staff_no);
                       let data = { title: 'MEDICAL DATA OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'MEDICAL', path: '\\' + req.files.medic_cert[0].path, active: '1', default:'1' };
                       await dbx.query("insert into doc set ?", data);
                   }
                   /*
                   if (req.files.appoint_cert != null) { 
                        console.log(req.files.appoint_cert);
                        await dbx.query("update doc set `default` = null where category = 'APPOINT' and staff_no = "+req.body.staff_no);
                        let data = { title: 'APPOINTMENT LETTER OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'APPOINTMENT', date: new Date(), path: '\\' + req.files.appoint_cert[0].path, active: '1', default:'1' };
                        let promo = await dbx.query("insert into promo set ?", data);
                        req.session.appoint_id = promo != null ? promo.insertId : 0;
                        req.session.save();
                       
                    }  
                   */                     
               }

                                          
                let bio = {
                    title: req.body.title,
                    gender : req.body.gender,
                    fname: req.body.fname,
                    mname: req.body.mname,
                    lname: req.body.lname,
                    dob: req.body.dob,
                    birth_place: req.body.birth_place,
                    hometown: req.body.hometown,
                    district: req.body.district,
                    region: req.body.region,
                    country: req.body.country,                  
                    phone: req.body.phone != '' ? req.body.phone : null,
                    email: req.body.email,
                    address: req.body.address,
                    mstatus: req.body.mstatus != '' ? req.body.mstatus : null,                        
                    ssnit: req.body.ssnit,
                    ucc_mail: req.body.ucc_mail,
                    staff_status: req.body.staff_status,
                    appoint_date: (req.body.appoint_date != '' && req.body.appoint_date != null) ? req.body.appoint_date : null,
                    confirm_date: (req.body.confirm_date != '' && req.body.confirm_date != null)? req.body.confirm_date : null,
                    assume_date: (req.body.assume_date != '' && req.body.assume_date != null)? req.body.assume_date : null,
                    probation: req.body.probation != '' ? req.body.probation : null,  
                    promo_id: req.body.promo_id != '' ? req.body.promo_id : null,  
                    unit_id: req.body.unit_id != '' ? req.body.unit_id : null,  
                    scale_id: req.body.scale_id != '' ? req.body.scale_id : null,  
                    job_id: req.body.job_id != '' ? req.body.job_id : null,  
                    staff_group: req.body.staff_group != '' ? req.body.staff_group : null,                         
                }

                var promo = {
                    id: req.body.promo_id != '' ? req.body.promo_id : null,
                    scale_id: req.body.scale_id != '' ? req.body.scale_id : null,
                    job_id: req.body.job_id != '' ? req.body.job_id : null,
                    unit_id: req.body.unit_id != '' ? req.body.unit_id : null, 
                    appoint_date: (req.body.appoint_date != '' && req.body.appoint_date != null) ? req.body.appoint_date : null,
                    confirm_date: (req.body.confirm_date != '' && req.body.confirm_date != null)? req.body.confirm_date : null,
                    probation: req.body.probation != '' ? req.body.probation : null,  
                    staff_group: req.body.staff_group != '' ? req.body.staff_group : null,
                }
                  // Save Data 
                  if(req.body.id == 0){
                      // Generate New Staff Number   
                      if(req.body.ex == '1'){
                        var sno = req.body.staff_no;
                      }else{
                        var lst = await dbx.query("select staff_no from staff order by staff_no desc");
                        var sno = lst[0]['staff_no'] + 1;
                      }                   
                      // Promo / Appoint
                      promo.staff_no = sno;
                      let pins = await dbx.query("insert into promotion set ?", promo);
                      // Staff Bio
                      bio.staff_no = sno;
                      bio.promo_id = pins.insertId;
                      await dbx.query("insert into staff set ?", bio);
                      // Log
                      let log = {staff_no:req.session.user.staff_no,action:'New Staff Added : '+sno,ipaddress:ip(req),datetime:new Date(),accesslevel:req.session.user.role,status:'1'};
                      await dbx.query("insert into `log` set ?",log);
                      // Role
                      let role = {staff_no:sno,username:sno,password:sno+new Date().getFullYear(),role:'03',roles:'03',active:'1'};
                      await dbx.query("insert into `user` set ?",role);
                        
                      res.redirect('/hrm/staff?sn='+sno); 
                      

                  }else{ 

                      if(promo.id != null && parseInt(promo.id) > 0){ 
                         // Promo/Appoint
                         //res.json({promo});
                         await dbx.query("update promotion set ? where id ="+req.body.promo_id,promo);
                      }else if(promo.id != null && parseInt(promo.id) == 0){
                         // Promo/Appoint
                         promo.staff_no = req.body.staff_no;
                         let pins = await dbx.query("insert into promotion set ?", promo);
                         bio.promo_id = pins.insertId;
                      }
                      // Staff Bio   
                      bio.staff_no = req.body.staff_no;             
                      await dbx.query("update staff set ? where id ="+req.body.id,bio);
                      // Log
                      let log = {staff_no:req.session.user.staff_no,action:'Staff Updated : '+bio.staff_no,ipaddress:null,datetime:new Date(),accesslevel:req.session.user.role,status:'1'};
                      await dbx.query("insert into `log` set ?",log);

                      res.redirect('/hrm/staff/page/'+req.body.staff_no+'#page1'); 
                  }    
                  
        });


        // Add New Staff Biodata
        app.get('/hrm/addstaff',isAuthenticated,isAdmin,async(req,res) => {           
                       
            let group = req.query.gp || 'JS';
            let exist = req.query.ext != undefined ? true : false;
            // Initialize Form
            let sx = await dbx.query("select staff_no from staff where staff_status in ('TEMPORAL','PERMANENT','CASUAL','PART-TIME','CONTRACT') order by staff_no desc");
            let rows = await dbx.query("select sc.* from scale sc where sc.active = '1' order by trim(grade),notch asc; select * from job where active = '1' order by trim(title) asc; select * from unit where active = '1' order by trim(long_name)");
            res.render('index_hr',{
                view:"addstaff",
                title: "ADD NEW STAFF | "+(group == 'SM'? ' SENIOR MEMBER ' : (group == 'SS' ? ' SENIOR STAFF ':' JUNIOR STAFF ')),
                data: { bio: { id: 0,staff_group: group,exist}, doc: [{ id: 0 }], scales: rows[0], jobs: rows[1], units: rows[2], appoints: null,sno: sx.length > 0 ? (sx[0].staff_no+1):null},
                user: req.session.user               
            });            
        });


         // Edit Staff Biodata
        app.get('/hrm/editstaff/:staff',isAuthenticated,isAdmin,async(req,res) => {                 
            let id = req.params.staff;
            let rows = await dbx.query("select s.*, p.appoint_date,p.confirm_date,p.staff_group,p.unit_id as unit_id,p.job_id,p.scale_id,DATE_FORMAT(dob,'%Y-%m-%d') as dobx,p.id as pid from staff s left join promotion p on p.id = s.promo_id where s.staff_no = " +id + ";select * from doc where staff_no ="+id+" and active = '1' and `default` = 1;select sc.* from scale sc where sc.active = '1' order by trim(grade),notch asc; select * from job where active = '1' order by trim(title) asc; select * from unit where active = '1' order by trim(long_name)");
            rows[0][0].appoint_date = rows[0][0].appoint_date != null ? moment(rows[0][0].appoint_date).format('YYYY-MM-DD') : null;
            rows[0][0].confirm_date = rows[0][0].appoint_date != null ? moment(rows[0][0].confirm_date).format('YYYY-MM-DD') : null;
            res.render('index_hr', {
                view: 'addstaff',
                title: 'EDIT STAFF  >  '+(rows[0][0].fname +' '+rows[0][0].mname+' '+rows[0][0].lname).toUpperCase(),
                data: { bio: rows[0][0], doc: rows[1], scales: rows[2], jobs : rows[3], units: rows[4]},
                user: req.session.user
            });                    
        });

        // Soft Delete Staff Biodata
        app.get('/hrm/delstaff/:id',isAuthenticated,async(req, res) => {
            let id = req.params.id;
            let sf = await dbx.query("select * from staff where staff_no = "+id);
            if(sf.length > 0){
                let log = {staff_no:req.session.user.staff_no,action:'Staff Deleted : '+sf[0].staff_no,ipaddress:null,datetime:new Date(),accesslevel:req.session.user.role,status:'1'};
                await dbx.query("insert into `log` set ?",log);
                await dbx.query("update staff set flag_delete = 1 where staff_no = "+id);
            }
            res.redirect('/hrm/staff');              
        });   
        
        // Hard Delete Staff
        app.get('/hrm/remstaff/:id',isAuthenticated,async(req, res) => {
            let id = req.params.id;
            let sf = await dbx.query("select * from staff where staff_no = "+id);
            if(sf.length > 0){
                let log = {staff_no:req.session.user.staff_no,action:'Staff Deleted : '+sf[0].staff_no,ipaddress:null,datetime:new Date(),accesslevel:req.session.user.role,status:'1'};
                await dbx.query("insert into `log` set ?",log);
                await dbx.query("update staff set flag_delete = 1 where staff_no = "+id);
            }
            res.redirect('/hrm/staff');              
        });        


         // Add New Staff Family
        app.get('/hrm/addfamily/:staff',isAuthenticated,isAdmin,async(req,res) => { 
            let staff = req.params.staff;            
            // res.send("Welcome Back!");
               res.render('index_hr',{
                   view:"addfamily",
                   title: "ADD NEW RELATIVE",
                   user: req.session.user,
                   row : {id:0,staff_no:staff}             
               });
       });


        // Edit Staff Family
       app.get('/hrm/editfamily/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let rows = await dbx.query("select *, DATE_FORMAT(dob,'%Y-%m-%d') as dobx from staff_rel where id = "+id);
           // res.send("Welcome Back!");
              res.render('index_hr',{
                  view:"addfamily",
                  title: "EDIT RELATIVE", 
                  user: req.session.user,
                  row: rows[0]              
              });
       });


        // Delete Family
        app.get('/hrm/delfamily/:id/:staff',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from staff_rel where id = "+id);
            // Log
            let sf = await dbx.query("select * from staff_rel where id = "+id);
            let log = {staff_no:req.session.user.staff_no,action:'Relative Deleted : '+sf[0].fname+' '+sf[0].lname,ipaddress:ip(req),datetime:new Date(),accesslevel:req.session.user.role,status:'1'};
            await dbx.query("insert into `log` set ?",log);

            res.redirect('/hrm/staff/page/'+req.params.staff+'#page2');              
        });   

        // Post Staff Biodata
        app.post('/hrm/postfamily',isAuthenticated,isAdmin,relative,async(req,res)=>{       
                         
            if(req.files != null){                
                if (req.files.photo != null){
                    req.body.photo = '\\' + req.files.photo[0].path;                    
                }
                if (req.files.birth != null) {
                    req.body.path = '\\' + req.files.birth[0].path;  
                }                                 
            } 
            // If No Date of Birth -- Set to NULL
            if(req.body.dob == null || req.body.dob == ''){                
               delete req.body.dob;                            
            }  
            // Clean Form Data not set
            req.body.mname == '' ? delete req.body.mname : '';
            req.body.phone == '' ? delete req.body.phone : '';
            req.body.dob == '' ? delete req.body.dob : '';

           
            if(req.body.relation == 'SPOUSE' && req.body.id <= 0){
                // INSERT SPOUSE
                let code = req.body.staff_no+'A';
                let exist = await dbx.query("select * from staff_rel where code = '"+code+"' and staff_no = "+req.body.staff_no);
                if(exist.length == 0){
                    req.body.code = code;
                    await dbx.query("insert into staff_rel set ?", req.body);
                }

            }else if((req.body.relation == 'CHILD' || req.body.relation == 'WARD') && req.body.id <= 0){
                // INSERT CHILD
                let child = await dbx.query("select * from staff_rel where (relation = 'CHILD' or relation = 'WARD') and staff_no = "+req.body.staff_no);
                let codes = ['B','C','D','E','F','G','H','I','J','J','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                let code = req.body.staff_no+(codes[child.length]);
                let exist = await dbx.query("select * from staff_rel where code = '"+code+"'");
                if(exist.length == 0){ 
                    req.body.code = code;
                    await dbx.query("insert into staff_rel set ?", req.body);
                }

            }else if(req.body.id <= 0){
                // INSERT PARENT               
                   await dbx.query("insert into staff_rel set ?", req.body);                

            }else{
                // UDATE ANY RELATIVE
                  console.log(req.body);
                   await dbx.query("update staff_rel set ? where id ="+req.body.id,req.body);
            }
            res.redirect('/hrm/staff/page/'+req.body.staff_no+'#page2');                
     });


       // Add Bank Account
       app.get('/hrm/addbank/:staff',isAuthenticated,isAdmin,async(req,res) => {            
        // res.send("Welcome Back!");
           res.render('index_hr',{
               view:"addbank",
               title: "ADD BANK ACCOUNT",
               user: req.session.user,
               row : {id:0,staff_no:req.params.staff}               
           });    
        });


            // Edit Bank Account
        app.get('/hrm/editbank/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let rows = await dbx.query("select * from bank where id = "+id);
            console.log(rows);
            res.render('index_hr',{
                view:"addbank",
                title: "EDIT BANK ACCOUNT",
                user: req.session.user,
                row: rows[0]            
            });
        });


        // Delete Bank Account
        app.get('/hrm/delbank/:id/:staff',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from bank where id = "+id);
            res.redirect('/hrm/staff/page/'+req.params.staff+'#page3');              
        });  
        
        
         // Post Bank Account
         app.post('/hrm/postbank',isAuthenticated,isAdmin,async(req,res)=>{ 
            let id; 
            console.log(req.body);         
            if(req.body.id <= 0){  
                req.body.date_added = new Date();                        
                let ins = await dbx.query("insert into bank set ?", req.body);  
                id = ins.insertId;               
            }else{               
                let ins = await dbx.query("update bank set ? where id ="+req.body.id,req.body);
                id = req.body.id;                
            }

            if(req.body.active == 0){
                res.redirect('/hrm/staff/page/'+req.body.staff_no+'#page3');
            }else{
                res.redirect('/hrm/setbank/'+id+'/'+req.body.staff_no);
            }                     
         });


         // Set Default Bank Account
         app.get('/hrm/setbank/:id/:staff',isAuthenticated,isAdmin,async(req,res)=>{                                    
            await dbx.query("update bank set active = '0' where staff_no = "+req.params.staff);  
            await dbx.query("update bank set active = '1' where id = "+req.params.id);  
            await dbx.query("update staff set bank_id = "+req.params.id+" where staff_no = "+req.params.staff);             
            res.redirect('/hrm/staff/page/'+req.params.staff+'#page3');                                
         });



        

       // Add Academic Certificate
       app.get('/hrm/addcert/:staff',isAuthenticated,isAdmin,async(req,res) => { 
           let staff = req.params.staff;
           //let specials = await dbx.query("select * from specialization where active = '1'");
           //let qualifies = await dbx.query("select * from qualification where active = '1'");
           // res.send("Welcome Back!");
            res.render('index_hr',{
                view:"addcert",
                title: "ADD ACADEMIC CERTIFICATE",
                user: req.session.user,
                row: {id:0,staff_no: staff}            
            });
        });


            // Edit Academic Certificate
        app.get('/hrm/editcert/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("select *,DATE_FORMAT(start_date,'%Y-%m-%d') as sdate, DATE_FORMAT(end_date,'%Y-%m-%d') as edate, DATE_FORMAT(grad_date,'%Y-%m-%d') as gdate from certificate where id = "+id);
                //let specials = await dbx.query("select * from specialization where active ='1'");
                //let qualifies = await dbx.query("select * from qualification where active ='1'");
                // res.send("Welcome Back!");
                res.render('index_hr',{
                    view:"addcert",
                    title: "EDIT ACADEMIC CERTIFICATE",
                    user: req.session.user,
                    row: rows[0]              
                });
        });


         // Post Academic Certificate
         app.post('/hrm/postcert',isAuthenticated,isAdmin,cert,async(req,res)=>{       
                         
                      
            if (req.file != null){
                req.body.path = '\\' + req.file.path; 
                console.log(req.files);                   
            }  

            req.body.qualify == '' ? delete req.body.qualify : req.body.qualify; 
            req.body.specialize == '' ? delete req.body.specialize : req.body.specialize;
            req.body.cert_rate == '' ? delete req.body.cert_rate : req.body.cert_rate;    
            req.body.start_date == '' ? delete req.body.start_date : req.body.start_date;
            req.body.end_date == '' ? delete req.body.end_date : req.body.end_date;  
            req.body.grad_date == '' ? delete req.body.grad_date : req.body.grad_date;  

            console.log(req.body);                                                
            if(req.body.id <= 0){                            
               await dbx.query("insert into certificate set ?", req.body);               
            }else{                
               await dbx.query("update certificate set ? where id ="+req.body.id,req.body);
            }
            res.redirect('/hrm/staff/page/'+req.body.staff_no+'#page4');                
        });




        // View Staff File
        app.get('/hrm/staff/view/:staff',isAuthenticated,async(req,res) => {            
            let staff = req.params.staff; 
            let bio = await dbx.query("select s.staff_no as nox,s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,upper(concat(sc.grade,', STEP ',sc.notch)) as grade,upper(j.title) as jobtitle, DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(s.confirm_date,'%d/%m/%Y') as first_confirm,DATE_FORMAT(s.first_appoint_date,'%d/%m/%Y') as first_appoint,DATE_FORMAT(p.appoint_date,'%d/%m/%Y') as appoint_date from staff s left join bank b on b.id = s.bank_id left join promotion p on p.id = s.promo_id left join scale sc on sc.id = p.scale_id left join job j on p.job_id = j.id where s.staff_no = "+staff);
            let rel = await dbx.query("select *,ifnull(DATE_FORMAT(dob,'%d/%m/%Y'),'NOT SET') as dobx,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name from staff_rel where staff_no = "+staff);
            let cert = await dbx.query("select * from certificate where staff_no = "+staff);
            let doc = await dbx.query("select * from doc where `default` = 1 and staff_no = "+staff);
            let trans = await dbx.query("select t.*,year(transfer_date) as year,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where t.staff_no = "+staff+" and t.flag_delete = 0 order by transfer_date desc,id desc");
            rel = await Promise.all(rel.map(async(row) => {
                   row.age = row.dob != null ? moment().diff(moment(row.dob,'YYYY-MM-DD'),'years'):0;
                   return row;
            }));
            // Calculate Age              
            var age = bio.length > 0 && bio[0].dob != null ? moment().diff(moment(bio[0].dob,'YYYY-MM-DD'),'years'):0;
                age > 0 ? bio[0].age = age : '';
            res.render('partials/hr_staffview',{
                view:'staffview',
                title:'STAFF FILE',
                data: {bio:bio[0],rel,cert,doc,trans},
                user: req.session.user   
            });           
        });
  

        // View Staff Page
        app.get('/hrm/staff/page/:staff',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.staff;
            // Check Whether User Account is Set
            const isSet = await dbx.query("select * from `user` where staff_no = "+id)
            if(isSet.length <= 0){
               const user = await dbx.query("select s.phone from staff s where s.staff_no = "+id)
               const pwd = user[0].phone || '12345678';
               if(user && user.length > 0) sms(pwd,`Greetings! Your UCC Staff Portal is activated! Verify at https://staffportal.ucc.edu.gh`)
               const dt = { role:'03',roles:'03',staff_no:id,username:id,password:pwd,active:'1' }
               const ins = await dbx.query("insert into `user` set ?", dt);
            }
                             
            let rows = await dbx.query("select * from bank where staff_no ="+id+"; select *,ifnull(dob,'<b><em><small>NOT SET</small></em></b>') as dob,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name from staff_rel where staff_no=" + id + "; select *,concat(qualify,' ',specialize) as program from certificate where staff_no ="+id+"; select s.*,DATE_FORMAT(s.dob,'%Y-%m-%d') as dobx, DATE_FORMAT(s.appoint_date,'%Y-%m-%d') as first_appoint,DATE_FORMAT(p.appoint_date,'%Y-%m-%d') as appoint_date,DATE_FORMAT(s.confirm_date,'%Y-%m-%d') as first_confirm,concat(sc.grade,', STEP ',sc.notch) as grade from staff s left join promotion p on s.promo_id = p.id left join scale sc on p.scale_id = sc.id where s.staff_no = "+id);
            res.render('index_hr', {
                view: 'staffpage',
                title: 'STAFF PAGE  >  ' + (rows[3][0].fname + ' ' + rows[3][0].mname + ' ' + rows[3][0].lname).toUpperCase(),
                data: { rel: rows[1], bank: rows[0], cert: rows[2] ,bio: rows[3][0]},
                user: req.session.user
            });
           
        });


  /*  LEAVE MODULE ROUTING */

    // Staff Module - JSON
    app.get('/hrm/leave',isAuthenticated,isAdmin,async(req,res) => {              
       // let data = await dbx.query("select l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse");                  
        let types = await dbx.query("select * from leave_type");
        let weights = await dbx.query("select w.*,t.title from leave_weight w left join leave_type t on w.type_id = t.id");
        let holidays = await dbx.query("select *,date_format(holiday,'%a %d %b, %Y') as day from leave_exclude where `year` > '"+(new Date().getFullYear()-1)+"' order by `year` asc");
        let constants = await dbx.query("select * from leave_constant where `year` = '"+new Date().getFullYear()+"'");  
        let balances = await dbx.query("select * from leave_balance");  
        let defer = await dbx.query("select * from leave_defer where `year` = '"+new Date().getFullYear()+"'");  
        let designs = await Promise.all(weights.map(async(weight,i,array) =>{
            if(weight.jobs != null){
                    let jb = weight.jobs.trim().split(',');
                    let outs = '';
                    for(var j of jb){
                        let sql = await dbx.query("select * from job where id = "+j);
                        if(sql.length > 0) outs += '<em style="font-size:9px;font-weight:bolder;border-radius:10px;background:pink;color:brown;padding:5px 10px;margin:5px;display:inline-block"><b>'+sql[0].title+'</b></em>'; 
                    }
                    weight.outs = outs;
            }
            return weight;
        }));               
        res.render('index_hr',{
            view:'leave',
            title:'LEAVE MODULE',
            types,designs,holidays,constants,balances,defer, 
            user: req.session.user
        });                  
    });


    // LEAVE DUMP - JSON
    app.post('/hrm/leavedump/gson',isAuthenticated,isAdmin,async(req,res) => { 
        console.log(req.body);         
        let sqlRec = "";
        let sqlTot = "";
        let where = "";           
        const params = req.body;
        const columns = Array(8);
        columns[0] = 'staff_no';
        columns[1] = 'name';
        columns[2] = 'title';
        columns[3] = 'stats';
        columns[4] = 'period';
        columns[5] = 'resume';
        columns[6] = 'action';
                                  

        if(params.search.value != ''){
            where += " and ";
            where += " (staff_no like '%"+params.search.value.trim()+"%' ";
            where += " or status like '%"+params.search.value.trim()+"%' ";
            where += " or fname like '%"+params.search.value.trim()+"%' ";
            where += " or mname like '%"+params.search.value.trim()+"%' ";
            where += " or lname like '%"+params.search.value.trim()+"%' ";
            where += " or title like '%"+params.search.value.trim()+"%' ";
            where += " or long_name like '%"+params.search.value.trim()+"%') ";
        } 

       // let sql = "select x.long_name,l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id left join unit x on p.unit_id = x.id ";
        let sql = "select long_name,lid,year,hdate,udate,start,end,resume,resume_date,id,relieved_by,approved_days,entitlement,applied_date,fname,mname,lname,staff_no,nox,title,job_id,status,flag_resumed from `vw_leave` where (status <> 'HEAD-PENDING' and status <> 'HR-PENDING') ";
        
        sqlRec += sql;
        sqlTot += sql;

        if(where != ''){
            sqlRec += where;
            sqlTot += where;
        }
        sqlRec += " order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];

        let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
        let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
        let data = await Promise.all(rowsRec.map(async (row) =>{
            let m = 0;
            if(m == 0){
                    row.staff_no = `<button class="btn btn-sm btn-primary">${row.staff_no}</button>`;
                    row.pend_days = moment().diff(moment(row.resume_date,'YYYY-MM-DD'),'days');
                    row.name = '<small>'+row.lname+', '+row.mname+' '+row.fname+'<br><em class="text-danger text-bold" style="font-size:8px;line-height:5px;">( '+row.long_name+' )</em></small>'; 
                    row.title = '<small>'+row.title+'</small>';
                    row.stats = '<button class="btn btn-lg" style="font-size:20px;">'+row.approved_days+' <small><sub>of</sub></small>  ('+row.entitlement+')</button>';
                    row.period = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:seagreen"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.start != null ? row.start.toUpperCase() : '')+'</a></div><div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:darkred"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.end != null ? row.end.toUpperCase() : '')+'</a></div>';
                    row.resume = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.resume != null ? row.resume.toUpperCase() :'')+'</a></div>';                                     
                    row.resume += (row.flag_resumed == 0 && row.status == 'ENDED')?'<center><em class="text-danger text-bold" style="font-size:10px;line-height:5px;">( Not Reported to work! )</em></small></center><span class="alert alert-warning pull-center" style="display:inline-block;font-size:10px;color:#000;">'+row.pend_days+' days late to duty</span>' : '';                                     
                    
                    var saction = '<div class="btn-group" style="width:160px;">';
                               // if(parseInt(row.relieved_by) == 0){ 
                   // saction +=    `<a class="btn btn-sm" style="font-size:10px;color:darkred" data-src="${row.relieved_by}" onclick="var p = prompt('Enter Staff Number of new Reliever!');if(p != undefined && p != ''){alert('Staff is now relieved by'+p);window.location.href='/hrm/leave/chgreliever/${row.lid}?st='+p}else{return false;}"><i class="fa fa-user-plus"></i>&nbsp;&nbsp;RELIEVER</a>`;
                               /* }else*/ if((row.status != null && row.status == 'HR-PENDING') && (req.session.user.roles.includes('05') || req.session.user.roles.includes('06') || req.session.user.roles.includes('07') || req.session.user.roles.includes('08'))){
                    saction +=    '<a class="btn btn-sm" style="font-size:10px;color:darkred" title="Approve leave" href="/hrm/leave/hrapprove/'+row.lid+'"><i class="fa fa-calendar-check-o"></i>&nbsp;&nbsp;APPROVE</a>';
                                }else{ 
                    saction +=    '<button class="btn btn-sm " style="font-size:10px;color:'+(row.status != null && (row.status == 'GRANTED' || row.status == 'ENDED') ? 'seagreen' :'darkred')+'">'+(row.status != null ? row.status.toUpperCase() :'' )+'</button>';
                                } 
                    saction +=   `<button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                    <ul class="dropdown-menu">
                                       ${row.flag_resumed == 0 ? `<li><a class="btn btn-sm" style="font-size:10px;color:seagreen" title="Verify Resumption of Staff" onclick="return confirm('Resumed Staff Duties in assigned unit?')" href="/hrm/leave/resume/${row.lid}"><i class="fa fa-calendar-check-o"></i>&nbsp;&nbsp;VERIFY RESUMPTION</a></li>`:``} 
                                        <li><a href="/hrm/leave/view/${row.lid}" target="_blank"><i class="fa-eye"></i>&nbsp;&nbsp;View Form</a></li> 
                                        <li><a href="/hrm/leave/stats/${row.nox}" target="_blank"><i class="fa-book"></i>&nbsp;&nbsp;View Statistics</a></li>  
                                        <li><a title="Edit Leave Application" href="/hrm/editleave/${row.lid}"><i class="fa-edit"></i>&nbsp;&nbsp;Edit Form</a></li>   
                                        <li><a title="Cancel Leave Application" href="/hrm/leave/cancel/${row.lid}"  onclick="return confrim('Cancel Leave Application?')"><i class="fa-trash"></i>&nbsp;&nbsp;Cancel Leave</a></li>                                           
                                        <li style="display:none;" class="divider"></li> 
                                        <li style="display:none;"><a href="#" data-src="${row.relieved_by}" onclick="alert('DHR Suggest a Reliever with the same or almost the same job designation for effectiveness!');var p = prompt('Enter Staff Number of new Reliever!');if(p != undefined && p != ''){alert('Staff is now relieved by '+p);window.location.href='/hrm/leave/chgreliever/${row.lid}?st='+p}else{return false;}"><i class="fa-send"></i>&nbsp;&nbsp;Change Reliever</a></li> 
                                        <li style="display:none;"><a target="_blank" href="/hrm/job/list/${row.job_id}" target="_blank"><i class="fa-info"></i>&nbsp;&nbsp;View Relievers</a></li> 
                                    </ul>
                                </div>`;  
                    row.action = saction;
            }
            return row;
        }));
            
        res.json({
            draw : Number(params.draw),
            recordsTotal : Number(rowsTot.length),
            recordsFiltered : Number(rowsTot.length),
            data: data
        });          
    
    });



    // HR-PENDING LEAVE APPLICATIONS - JSON
   
    app.post('/hrm/leavehrpend/gson',isAuthenticated,isAdmin,async(req,res) => { 
        console.log(req.body);         
        let sqlRec = "";
        let sqlTot = "";
        let where = "";           
        const params = req.body;
        const columns = Array(8);
        columns[0] = 'staff_no';
        columns[1] = 'name';
        columns[2] = 'title';
        columns[3] = 'stats';
        columns[4] = 'period';
        columns[5] = 'resume';
        columns[6] = 'action';
        
        if(params.search.value != ''){
            //where += " where ";
            where += " and (l.staff_no like '%"+params.search.value.trim()+"%' ";
            where += " or s.fname like '%"+params.search.value.trim()+"%' ";
            where += " or s.mname like '%"+params.search.value.trim()+"%' ";
            where += " or s.lname like '%"+params.search.value.trim()+"%' ";
            where += " or t.title like '%"+params.search.value.trim()+"%' ";
            where += " or x.long_name like '%"+params.search.value.trim()+"%' )";
        } 
        let sql = "select x.long_name,l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,relieved_by,approved_days,entitlement,head_date,s.fname,s.mname,s.lname,s.staff_no,s.staff_no as nox,t.title,p.job_id,status,p.staff_group from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join promotion p on p.id = s.promo_id left join unit x on x.id = p.unit_id where l.status = 'HR-PENDING' ";
        sqlRec += sql;
        sqlTot += sql;

        if(where != ''){
            sqlRec += where;
            sqlTot += where;
        }
        sqlRec += " order by s."+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
        let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
        let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
        let data = await Promise.all(rowsRec.map(async (row) =>{
            let m = 0;
            if(m == 0){
                    row.staff_no = `<button class="btn btn-sm btn-primary">${row.staff_no}</button>`;
                    row.pend_days = moment().diff(moment(row.head_date,'YYYY-MM-DD'),'days');
                    //row.pend_days = 0;
                    row.name = '<small>'+row.lname+', '+row.mname+' '+row.fname+'<br><em class="text-danger text-bold" style="font-size:7px;line-height:5px;">( '+row.long_name+' )</em></small>'; 
                    row.title = '<small>'+row.title+'</small>';
                    row.stats = '<button class="btn btn-lg" style="font-size:20px;">'+row.approved_days+' <small><sub>of</sub></small>  ('+row.entitlement+')</button>';
                    row.period = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:seagreen"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.start != null ? row.start.toUpperCase() : '')+'</a></div><div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:darkred"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.end != null ? row.end.toUpperCase() : '')+'</a></div>';
                    row.resume = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.resume != null ? row.resume.toUpperCase() :'')+'</a></div>';                                     
                    var saction = '<div class="btn-group" style="width:160px;">';
                                if(parseInt(row.relieved_by) == 0){ 
                    saction +=    `<a class="btn btn-sm" style="font-size:10px;color:darkred" data-src="${row.relieved_by}" onclick="var p = prompt('Enter Staff Number of new Reliever!');if(p != undefined && p != ''){alert('Staff is now relieved by'+p);window.location.href='/hrm/leave/chgreliever/${row.lid}?st='+p}else{return false;}"><i class="fa fa-user-plus"></i>&nbsp;&nbsp;RELIEVER</a>`;
                                }else if((row.status != null && row.status == 'HR-PENDING') && (req.session.user.roles.includes('05') || req.session.user.roles.includes('06') || req.session.user.roles.includes('07') || req.session.user.roles.includes('08'))){
                    saction +=    '<a class="btn btn-sm" style="font-size:10px;color:darkred" title="Approve leave" href="/hrm/leave/hrapprove/'+row.lid+'"><i class="fa fa-calendar-check-o"></i>&nbsp;&nbsp;APPROVE</a>';
                                }else{ 
                    saction +=    '<button class="btn btn-sm " style="font-size:10px;color:'+(row.status != null && (row.status == 'GRANTED' || row.status == 'ENDED') ? 'seagreen' :'darkred')+'">'+(row.status != null ? row.status.toUpperCase() :'' )+'</button>';
                                } 
                    saction +=   `<button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                    <ul class="dropdown-menu">
                                        ${parseInt(row.relieved_by) == 0 ? `<li><a class="btn btn-sm" style="font-size:10px;color:seagreen" title="Approve leave" href="/hrm/leave/hrapprove/${row.lid}"><i class="fa fa-calendar-check-o"></i>&nbsp;&nbsp;APPROVE</a></li>`:``} 
                                        <li><a href="/hrm/leave/view/${row.lid}" target="_blank"><i class="fa-eye"></i>&nbsp;&nbsp;View Form</a></li> 
                                        <li><a href="/hrm/leave/stats/${row.nox}" target="_blank"><i class="fa-book"></i>&nbsp;&nbsp;View Statistics</a></li>  
                                        <li><a title="Edit Leave Application" href="/hrm/editleave/${row.lid}"><i class="fa-edit"></i>&nbsp;&nbsp;Edit Form</a></li> 
                                        <li><a title="Cancel Leave Application" href="/hrm/leave/cancel/${row.lid}" onclick="return confrim('Cancel Leave Application?')"><i class="fa-trash"></i>&nbsp;&nbsp;Cancel Leave</a></li>                                                                                     
                                        <li class="divider"></li> 
                                        <li><a href="#" data-src="${row.relieved_by}" onclick="alert('DHR Suggest a Reliever with the same or almost the same job designation for effectiveness!');var p = prompt('Enter Staff Number of new Reliever!');if(p != undefined && p != ''){alert('Staff is now relieved by '+p);window.location.href='/hrm/leave/chgreliever/${row.lid}?st='+p}else{return false;}"><i class="fa-send"></i>&nbsp;&nbsp;Change Reliever</a></li> 
                                        <li><a target="_blank" href="/hrm/job/list/${row.job_id}" target="_blank"><i class="fa-info"></i>&nbsp;&nbsp;View Relievers</a></li> 
                                    </ul>
                                </div>`;  
                    saction += `<br><span class="alert alert-warning pull-center" style="display:inline-block;font-size:10px;color:#000;">Pended ${row.pend_days} days</span>
                                    <span class="alert alert-warning pull-center" style="display:inline-block;font-size:10px;color:#000;"> ${row.staff_group}</span>`;
                    row.action = saction;
            }
            return row;
        }));
        res.json({
            draw : Number(params.draw),
            recordsTotal : Number(rowsTot.length),
            recordsFiltered : Number(rowsTot.length),
            data: data
        });          
    });


    
    // HEAD-PENDING LEAVE APPLICATIONS - JSON
   
    app.post('/hrm/leaveheadpend/gson',isAuthenticated,async(req,res) => { 
        console.log(req.body);         
        let sqlRec = "";
        let sqlTot = "";
        let where = "";           
        const params = req.body;
        const columns = Array(8);
        columns[0] = 'staff_no';
        columns[1] = 'name';
        columns[2] = 'title';
        columns[3] = 'stats';
        columns[4] = 'period';
        columns[5] = 'resume';
        columns[6] = 'action';
        
        if(params.search.value != ''){
            where += " and ";
            where += " (l.staff_no like '%"+params.search.value.trim()+"%' ";
            where += " or l.status like '%"+params.search.value.trim()+"%' ";
            where += " or s.fname like '%"+params.search.value.trim()+"%' ";
            where += " or s.mname like '%"+params.search.value.trim()+"%' ";
            where += " or s.lname like '%"+params.search.value.trim()+"%' ";
            where += " or t.title like '%"+params.search.value.trim()+"%' ";
            where += " or x.long_name like '%"+params.search.value.trim()+"%') ";
        } 
        //let sql = "select x.long_name,l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,'<br>(',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',u.mname,'<br>(',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,'<br>(',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse left join promotion p on p.id = s.promo_id left join unit x on p.unit_id = x.id where l.status = 'HEAD-PENDING'";
        let sql = "select x.long_name,l.id as lid,year(applied_date) as year,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.id,relieved_by,approved_days,entitlement,applied_date,s.fname,s.mname,s.lname,s.staff_no,s.staff_no as nox,t.title,p.job_id,status from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join promotion p on p.id = s.promo_id left join unit x on x.id = p.unit_id where l.status = 'HEAD-PENDING' ";
        
        sqlRec += sql;
        sqlTot += sql;

        if(where != ''){
            sqlRec += where;
            sqlTot += where;
        }
        sqlRec += " order by s."+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
        let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
        let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
        let data = await Promise.all(rowsRec.map(async (row) =>{
            let m = 0;
            if(m == 0){
                    row.staff_no = `<button class="btn btn-sm btn-primary">${row.staff_no}</button>`;
                    row.pend_days = moment().diff(moment(row.applied_date,'YYYY-MM-DD'),'days');
                    row.name =  '<small>'+row.lname+', '+row.mname+' '+row.fname+'<br><em class="text-danger text-bold" style="font-size:8px;line-height:5px;">( '+row.long_name+' )</em></small>'; 
                    row.title = '<small>'+row.title+'</small>';
                    row.stats = '<button class="btn btn-lg" style="font-size:20px;">'+row.approved_days+' <small><sub>of</sub></small>  ('+row.entitlement+')</button>';
                    row.period = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:seagreen"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.start != null ? row.start.toUpperCase() : '')+'</a></div><div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;color:darkred"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.end != null ? row.end.toUpperCase() : '')+'</a></div>';
                    row.resume = '<div class="group group-xl"><a class="btn btn-sm" style="font-size:10px;"><i class="fa fa-calendar-check-o fa-lg"></i> '+(row.resume != null ? row.resume.toUpperCase() :'')+'</a></div>';                                     
                    var saction = '<div class="btn-group" style="width:160px;">';
                                if(parseInt(row.relieved_by) == 0){ 
                    saction +=    `<a class="btn btn-sm" style="font-size:10px;color:darkred" data-src="${row.relieved_by}" onclick="var p = prompt('Enter Staff Number of new Reliever!');if(p != undefined && p != ''){alert('Staff is now relieved by'+p);window.location.href='/hrm/leave/chgreliever/${row.lid}?st='+p}else{return false;}"><i class="fa fa-user-plus"></i>&nbsp;&nbsp;RELIEVER</a>`;
                                }else if((row.status != null && row.status == 'HR-PENDING') && (req.session.user.roles.includes('05') || req.session.user.roles.includes('06') || req.session.user.roles.includes('07') || req.session.user.roles.includes('08'))){
                    saction +=    '<a class="btn btn-success" style="font-size:10px;color:darkred" title="Approve leave" href="/hrm/leave/hrapprove/'+row.lid+'"><i class="fa fa-calendar-check-o"></i>&nbsp;&nbsp;APPROVE</a>';
                                }else{ 
                    saction +=    '<button class="btn btn-sm " style="font-size:10px;color:'+(row.status != null && (row.status == 'GRANTED' || row.status == 'ENDED') ? 'seagreen' :'darkred')+'">'+(row.status != null ? row.status.toUpperCase() :'' )+'</button>';
                                } 
                    saction +=   `<button type="button" class="btn btn-primary  btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                    <ul class="dropdown-menu">
                                        <li><a href="/hrm/leave/view/${row.lid}" target="_blank"><i class="fa-eye"></i>&nbsp;&nbsp;View Form</a></li> 
                                        <li><a href="/hrm/leave/stats/${row.nox}" target="_blank"><i class="fa-book"></i>&nbsp;&nbsp;View Statistics</a></li> 
                                        <li><a title="Cancel Leave Application" href="/hrm/leave/cancel/${row.lid}" onclick="return confrim('Cancel Leave Application?')"><i class="fa-trash"></i>&nbsp;&nbsp;Cancel Leave</a></li>                                            
                                        <li class="divider"></li> 
                                        <li><a href="/hrm/leave/smshead/${row.lid}" target="_blank"><i class="fa-comment"></i>&nbsp;&nbsp;Alert Via SMS</a></li>  
                                        <li><a href="/hrm/leave/mailhead/${row.lid}" target="_blank"><i class="fa-envelope"></i>&nbsp;&nbsp;Alert Via Mail</a></li>
                                        <li class="divider"></li> 
                                        <li><a href="#" onclick="if(confirm('Alert Staff on Issue?')){var p = prompt('Please enter Message!);if(p != undefined){location.href='/hrm/alertstaff/${row.nox}/'+encodeURI(p);}}"><i class="fa-envelope"></i>&nbsp;&nbsp;Notify Staff <em>( SMS & MAIL )</em></a></li>  
                                        
                                    </ul>
                                </div>`;  
                    saction += `<br><span class="alert alert-warning pull-center" style="display:inline-block;font-size:10px;color:#000;">Pended ${row.pend_days} days</span>`;
                    row.action = saction;
            }
            return row;
        }));
        res.json({
            draw : Number(params.draw),
            recordsTotal : Number(rowsTot.length),
            recordsFiltered : Number(rowsTot.length),
            data: data
        });          
    });


    // Add New Leave
    app.get('/hrm/addleave',isAuthenticated,isAdmin,async(req,res) => {   
        let types = await dbx.query("select * from leave_type where active = 1");            
        // Initialize Form
       res.render('index_hr',{
            view:"addleave",
            title: "LEAVE APPLICATION",
            types,row:{id:0},
            user: req.session.user               
        });            
    });

    // Edit Leave
    app.get('/hrm/editleave/:id',isAuthenticated,isAdmin,async(req,res) => {  
        var id = parseInt(req.params.id) || 0; 
        var row = parseInt(id) > 0 ? await dbx.query("select l.*,date_format(l.start_date,'%Y-%m-%d') as start_date,p.job_id,p.staff_group from leave_dump l left join staff s on s.staff_no = l.staff_no left join promotion p on s.promo_id = p.id where l.id = "+id) : [{id:0}];  
        console.log(row);
        let types = await dbx.query("select * from leave_type where active = 1");  
        // Initialize Form
        res.render('index_hr',{
            view:"addleave",
            title: "LEAVE APPLICATION",
            types,row:row[0],
            user: req.session.user               
        });            
    });


    // Calculate Leave Entitlement
    app.get('/hrm/getleave/:staff/:type',async(req,res) => { 
        var staff = req.params.staff; 
        var type = req.params.type; 
        if(staff != undefined && type != undefined){
            let stud = await dbx.query("SELECT s.id,s.gender,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type FROM `staff` s left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_no = "+staff);      
            type = (stud.length > 0 && stud[0].staff_status == 'TEMPORAL') ? '1' : type; // Check If Temporal Staff (Only Casual Leave Applies)
            var apply = await dbx.query("SELECT * FROM `leave_dump` where (staff_no = "+staff+" or relieved_by = "+staff+") and (status = 'GRANTED' or status = 'STAFF-PENDING' or status = 'HEAD-PENDING' or status = 'HR-PENDING') and date_format(applied_date,'%Y') ='"+(new Date().getFullYear())+"' ");  // Can Staff Apply ( Not on Relieve Roles or Still on Previous Leave)
            
            if(stud.length > 0){           
                var approved = await dbx.query("SELECT sum(approved_days) as ent FROM `leave_dump` where staff_no = "+staff+" and type_id = "+type+" and (status <> 'HR-REJECTED' and status <> 'HEAD-REJECTED' and status <> 'CANCELLED') and year(applied_date) ='"+(new Date().getFullYear())+"'");  
                var balance = await dbx.query("SELECT weight FROM `leave_balance` where staff_no = "+staff+" and active = '1'");  
                var con_add = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                var con_sub = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                var defer = await dbx.query("SELECT * FROM `leave_defer` where staff_no = "+staff+" and year = '"+new Date().getFullYear()+"'");  
                
                var weight;    
                switch(stud[0].staff_group){
                    case 'SS':
                            var k = weight = await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = "+type);  
                            console.log("Case SS: Weight:"+type+", Group:"+stud[0].staff_group); 
                            console.log(k); 
                            break;

                    case 'JS':
                            let check = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+stud[0].staff_group+"'  and type_id = "+type+" and find_in_set('"+stud[0].job_id+"',jobs) > 0");  
                            if(check.length <= 0){ 
                                //weight = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+stud[0].staff_group+"'  and type_id = "+type+" and find_in_set('"+stud[0].job_id+"',jobs) > 0");  
                                weight = await dbx.query("select * from `leave_weight` where `group` = '"+stud[0].staff_group+"' and type_id = "+type+" and jobs IS NULL");
                            }else{  
                                weight = check;
                            }  
                            console.log("Case JS:"); 
                            console.log(weight); 
                            break;

                    case 'SM':
                            weight = (stud[0].staff_type == 'NON-ACADEMIC') ? await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = "+type) : [{weight:null}];  
                            console.log("Case SM:"); 
                            console.log(weight); 
                            break;
                            
                    default : 
                            weight = [{weight:null}];
                            console.log("Case DEFAULT:"); 
                            console.log(weight); 
                            break;
                }
                
                // SELECT * FROM `leave_weight` WHERE `group` = 'JS' and jobs LIKE '%5194%';
                // SELECT * FROM `leave_weight` WHERE `group` = 'JS' and find_in_set('5194',jobs) > 0;
                
                // IF MATERNITY LEAVE & MALE
                console.log(weight);
                var ent, sub = (con_sub.length > 0 ? con_sub[0].weight : 0), add = (con_add.length > 0 ? con_add[0].weight : 0);
                var used = (approved.length > 0 ? approved[0].ent : 0), bal = (balance.length > 0 ? balance[0].weight : 0);
                
                if(stud[0].gender == 'M' && type == '3'){
                    ent = 0;
                }else{
                    console.log(weight);
                    ent = (weight.length > 0 ? weight[0].weight : 0);
                } 
                var days = (ent-used+(type == '2' ? (add+bal-sub): 0));
                var due = days > 0 ? days : 0;

                    console.log('Entitlement :'+ent);
                    console.log('Used :'+used);
                    console.log('Calculation :'+due);
                    // Initialize Form
                    if(defer.length > 0 && (type == '2' || type == '3')){
                        // Leave Deferred for the year -- both Annual & Casual Leave
                        res.json({
                            canapply:false,
                            Entitlement: 0,
                            Exhausted: 0,
                            Due: 0,
                            staff:{gender:stud[0].gender,staff_group:stud[0].staff_group,staff_type:stud[0].staff_type}
                        }); 
                    }else{
                        res.json({
                            canapply:(apply.length > 0 ? false : true),
                            Entitlement: ent,
                            Exhausted: used,
                            Due: due,
                            staff:{gender:stud[0].gender,staff_group:stud[0].staff_group,staff_type:stud[0].staff_type}
                        });  
                    }
            }else{
                    res.json({
                        canapply:false,
                        Entitlement: 0,
                        Exhausted: 0,
                        Due: 0,
                        staff:null
                    }); 
            }
        }else{
            res.json({
                canapply:false,
                Entitlement: 0,
                Exhausted: 0,
                Due: 0,
                staff:null
            }); 
        }           
    });



     // Calculate Leave Entitlement
     app.get('/hrm/getleavedata/:staff/:type',async(req,res) => { 
        let staff = req.params.staff; 
        let stud = await dbx.query("SELECT s.id,s.gender,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type FROM `staff` s left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_no = "+staff);      
        var type = (stud.length > 0 && stud[0].staff_status == 'TEMPORAL') ? '1' : req.params.type; // Check If Temporal Staff (Only Casual Leave Applies)
        var apply = await dbx.query("SELECT * FROM `leave_dump` where (staff_no = "+staff+" or relieved_by = "+staff+") and (status = 'GRANTED' or status = 'STAFF-PENDING' or status = 'HEAD-PENDING' or status = 'HR-PENDING') and date_format(applied_date,'%Y') ='"+(new Date().getFullYear())+"' ");  // Can Staff Apply ( Not on Relieve Roles or Still on Previous Leave)
        
        if(stud.length > 0){           
            var approved = await dbx.query("SELECT sum(approved_days) as ent FROM `leave_dump` where staff_no = "+staff+" and type_id = "+type+" and (status <> 'HR-REJECTED' and status <> 'HEAD-REJECTED' and status <> 'CANCELLED') and year(applied_date) ='"+(new Date().getFullYear())+"'");  
            var balance = await dbx.query("SELECT weight FROM `leave_balance` where staff_no = "+staff+" and active = '1'");  
            var con_add = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
            var con_sub = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
            var defer = await dbx.query("SELECT * FROM `leave_defer` where staff_no = "+staff+" and year = '"+new Date().getFullYear()+"'");  
            
            var weight;    
            switch(stud[0].staff_group){
                case 'SS':
                        var k = weight = await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = "+type);  
                        break;

                case 'JS':
                        let check = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+stud[0].staff_group+"'  and type_id = "+type+" and find_in_set('"+stud[0].job_id+"',jobs) > 0");  
                        if(check.length <= 0){ 
                            weight = await dbx.query("select * from `leave_weight` where `group` = '"+stud[0].staff_group+"' and type_id = "+type+" and jobs IS NULL");
                        }else{  
                            weight = check;
                        }  
                        break;

                case 'SM':
                        weight = (stud[0].staff_type == 'NON-ACADEMIC') ? await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = "+type) : [{weight:null}];  
                        break;
                        
                default : 
                        weight = [{weight:null}];
                        break;
            }
            
            var ent, sub = (con_sub.length > 0 ? con_sub[0].weight : 0), add = (con_add.length > 0 ? con_add[0].weight : 0);
            var used = (approved.length > 0 ? approved[0].ent : 0), bal = (balance.length > 0 ? balance[0].weight : 0);
            
            if(stud[0].gender == 'M' && type == '3'){
                ent = 0;
            }else{
                ent = (weight.length > 0 ? weight[0].weight : 0);
            } 
            var days = (ent-used+(type == '2' ? (add+bal-sub): 0));
            var due = days > 0 ? days : 0;
            // Initialize Form
            if(defer.length > 0 && (type == '2' || type == '3')){
                res.json({
                    canapply:false,
                    deferred : true,
                    entitlement: 0,
                    balance: 0,
                    deduction: 0,
                    used: 0,
                    due: 0
                }); 
            }else{
                res.json({
                    canapply:(apply.length > 0 ? false : true),
                    deferred : false,
                    entitlement: ent,
                    balance: bal,
                    deduction: Math.abs(add-sub),
                    used: used,
                    due: due
                });  
            }
         }else{
            res.json({
                canapply:false,
                deferred : false,
                entitlement: 0,
                balance: 0,
                deduction: 0,
                used: used,
                due: due
            }); 
         }          
    });


    // Check End Date of Leave 
    app.get('/hrm/leavendate/:start/:days',isAuthenticated,async(req,res) => { 
        let start = moment(req.params.start).format('YYYY-MM-DD'),end,resume;
        let days = parseInt(req.params.days) || 0; 
        if(req.session.user.staff_group != 'SM'){
                end = moment(start).businessAdd(days-1).format('MMMM DD, YYYY');           
                resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            
        }else{
                end = moment(start).add((days-1),"days").format('DD M, YYYY');           
                //resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');
        }
        res.json({success : (end == null || end == undefined ? false : true),endate:end.toUpperCase()});  
        console.log({success : (end == null || end == undefined ? false : true),endate:end});
    });


    // Check Reliever Status -- Leave
    app.get('/hrm/canrelieve/:staff',isAuthenticated,async(req,res) => { 
        let staff = req.params.staff; 
        let relieve = await dbx.query("SELECT * FROM `leave_dump` where (staff_no = "+staff+" or relieved_by = "+staff+") and (status = 'GRANTED' or status = 'STAFF-PENDING' or status = 'HEAD-PENDING' or status = 'HR-PENDING') and date_format(applied_date,'%Y') ='"+(new Date().getFullYear())+"' ");  
        // Initialize Form
        console.log({canrelieve : (relieve.length > 0 ? false : true)}); 
        res.json({canrelieve : (relieve.length > 0 ? false : true)});  
    });


    // Post Leave Form
    app.post('/hrm/postleave',isAuthenticated,leave,loadmoment,async(req,res)=>{  
        let doc; 
        let start,end,resume,days;
        if(req.body.staff_group != 'SM'){
            if(req.body.type == 1 || req.body.type == 2 || req.body.type == 6){
                // CASUAL LEAVE, ANNUAL LEAVE,SPECIAL LEAVE
                days = parseInt(req.body.approved_days) || 0;
                start = moment(req.body.start_date).format('YYYY-MM-DD');
                end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            

            }else if(req.body.type == 3 || req.body.type == 4){
                // , MARTENITY LEAVE, SICK LEAVE 
                days = parseInt(req.body.approved_days) || 0;
                start = moment(req.body.start_date).format('YYYY-MM-DD');
                end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
            }else if(req.body.type == 5 ){
                // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                days = parseInt(req.body.approved_days) || 0;
                start = moment(req.body.start_date).format('YYYY-MM-DD');
                end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                resume = moment(end).businessAdd(4).format('YYYY-MM-DD');
            }
        }else{

            if(req.body.type != 5 ){
                // ALL LEAVE 
                days = parseInt(req.body.approved_days) || 0;
                start = moment(req.body.start_date).format('YYYY-MM-DD');
                end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                //resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');
            }else{
                // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                days = parseInt(req.body.approved_days) || 0;
                start = moment(req.body.start_date).format('YYYY-MM-DD');
                end = moment(start).add((days-1),"days").format('YYYY-MM-DD');            
                resume = moment(end).add(4,"days").format('YYYY-MM-DD'); 
            }
        }
 
        let bio = {
            type_id : req.body.type,
            start_date: start,
            end_date: end,
            applied_date: moment(new Date()).format('YYYY-MM-DD'),
            resume_date: resume,
            entitlement: req.body.entitlement,
            approved_days: req.body.approved_days,             
            staff_no: req.body.staff_no,
            relieved_by: req.body.relieved_by != null ? req.body.relieved_by : null,
            emergency_note: req.body.emergency_note,                  
            emergency_contact: req.body.emergency_contact
        }
            // Add Certificate upload  
            if (req.file != null) {
                bio.doc = '\\' + req.file.path;
            } 

           // Clean Empty form fields
           req.body.apply_note != '' ?  bio.apply_note = req.body.apply_note : ''; 
           
           // Endorsements
           if(req.body.id > 0 && ['HEAD-PENDING','HR-PENDING'].includes(req.body.status)){
              //bio.head_endorse = req.body.head_endorse, bio.head_date = new Date(), bio.hr_endorse = req.session.user.staff_no, bio.hr_date = new Date();
           }else{
              bio.status = 'GRANTED', bio.head_endorse = req.session.user.staff_no, bio.head_date = new Date(), bio.hr_endorse = req.session.user.staff_no, bio.hr_date = new Date();
           }
           
           /* Update Staff leave Flag */
           const stdata = { flag_leave:1,flag_leave_lock:1 }
           await dbx.query("update staff set ? where staff_no ="+req.body.staff_no,stdata);
           let st = await dbx.query("SELECT phone,fname,lname FROM `staff` where staff_no = "+staff);  
           // Notify Applicant of Approval
           let msg = `Your leave application has been approved, and you are scheduled to resume on ${resume}.`;
           const send = await sms(st[0].phone,msg);
        
           // Reliever Leave Flag
           var rl = await dbx.query("select s.id,l.relieved_by from leave_dump l left join staff s on l.relieved_by = s.staff_no where l.id ="+req.body.id);
           if(rl.length > 0 &&  (rl[0].id != null && rl[0].relieved_by > 0)){
             /* Remove Old Reliever */
             const rldata = { flag_leave:0,flag_leave_lock:0 }
             await dbx.query("update staff set ? where id ="+rl[0].id,rldata);
           }
           if(req.body.relieved_by > 0){
            /* Add New Reliever */
             const rndata = { flag_leave:2,flag_leave_lock:1 }
             await dbx.query("update staff set ? where staff_no ="+req.body.relieved_by,rndata);
             let rt = await dbx.query("SELECT phone FROM `staff` where staff_no = "+req.body.relieved_by);  
             // Notify Reliever
             let msg = `You have been selected to relieve ${st[0].fname} ${st[0].lname}, who will be on leave from ${start} to ${end} and is scheduled to resume on ${resume}.`;
             const send = await sms(rt.phone,msg);
           }

        // Save Data   
        if(req.body.id == 0){
           await dbx.query("insert into leave_dump set ?",bio);
        }else{ 
            if(req.old_amount == req.body.approved_days){
                 delete bio.approved_days, delete bio.applied_date, delete bio.status;
            } else {
                 delete bio.applied_date, delete bio.status;
            }    await dbx.query("update leave_dump set ? where id ="+req.body.id,bio);
        }        
        res.redirect('/hrm/leave');   
    });



    // Post Leave Form
    app.post('/hrm/posthapprove',isAuthenticated,leave,loadmoment,async(req,res)=>{  
                let start,end,resume,days;
                if(req.body.staff_group != 'SM'){
                    if(req.body.type == 1 || req.body.type == 2 || req.body.type == 6){
                        // CASUAL LEAVE, ANNUAL LEAVE,SPECIAL LEAVE
                        days = parseInt(req.body.approved_days) || 0;
                        start = moment(req.body.start_date).format('YYYY-MM-DD');
                        end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                        resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            

                    }else if(req.body.type == 3 || req.body.type == 4){
                        // , MARTENITY LEAVE, SICK LEAVE 
                        days = parseInt(req.body.approved_days) || 0;
                        start = moment(req.body.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                        resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                    }else if(req.body.type == 5 ){
                        // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                        days = parseInt(req.body.approved_days) || 0;
                        start = moment(req.body.start_date).format('YYYY-MM-DD');
                        end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                        resume = moment(end).businessAdd(4).format('YYYY-MM-DD');
                    }
                }else{
                    if(req.body.type != 5 ){
                        // ALL LEAVE 
                        days = parseInt(req.body.approved_days) || 0;
                        start = moment(req.body.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                        resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                    }else{
                        // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                        days = parseInt(req.body.approved_days) || 0;
                        start = moment(req.body.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');            
                        resume = moment(end).add(4,"days").format('YYYY-MM-DD'); 
                    }
                }
        
                let bio = {
                    start_date: start,
                    end_date: end,
                    resume_date: resume,
                    approved_days: req.body.approved_days,             
                    relieved_by: req.body.relieved_by != null ? req.body.relieved_by : null,
                    head_endorse: req.session.user.staff_no,
                    head_date: new Date(),
                    status : 'HR-PENDING'
                            
                }
                await dbx.query("update leave_dump set ? where id ="+req.body.id,bio);
                // Applied by Head
                res.redirect('/hrm/st/head/leave/');
        
        });


       
        // HR HEAD - Approve Leave
        app.get('/hrm/leave/hrapprove/:id',isAuthenticated,isAdmin,async(req,res) => { 
            var id = req.params.id;        
            await dbx.query("update leave_dump set status = 'GRANTED',hr_date = NOW(),hr_endorse = "+req.session.user.staff_no+" where id ="+id);
            let st = await dbx.query("select s.*,l.* from leave_dump l left join staff s on l.staff_no = s.staff_no where l.id ="+id);
            // Notification - Staff
            let data = {action : 'Leave Approval - DHR',message : 'Leave application with STAT( D:'+st[0].approved_days+',E:'+st[0].entitlement+' ) pending approval at DHR has been granted at '+st[0].hr_date, staff_no : st[0].staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
            await dbx.query("insert into notification set ?",data);
            // Update Leave Balance Used_flag = 1
            //await dbx.query("update leave_balance set flag_used = 1 where staff_no ="+st[0].staff_no+" and year = '"+new Date().getFullYear()+"'");
            // Mail Staff
            mailer(st[0].ucc_mail,st[0].fname+' '+st[0].mname+' '+st[0].lname,'DHR - LEAVE NOTICE','Leave application with Statistics ( DAYS:'+st[0].approved_days+', ENTITLEMENT:'+st[0].entitlement+' ) has been granted, Resumption date is on '+moment(st[0].resume_date).format('DD/MM/YYYY')+'. Please note that your outstanding leave balance is '+(st[0].entitlement-st[0].approved_days)+' days for your next leave application., <em>Please enjoy your leave!</em>');
            // Update Staff leave Flag
            const stdata = {flag_leave:1,flag_leave_lock:1}
            await dbx.query("update staff set ? where staff_no ="+st[0].staff_no,stdata);
        
            // Reliever Leave Flag
            if(st[0].relieved_by > 0){
              const rndata = {flag_leave:2,flag_leave_lock:1}
              await dbx.query("update staff set ? where staff_no ="+st[0].relieved_by,rndata);
            }
            res.redirect('/hrm/leave');  

        });
       
  
        // View Leave Statistics for Staff
        app.get('/hrm/leave/stats/:staff',isAuthenticated,async(req,res) => { 
          var staff = req.params.staff;        
          var rows = await dbx.query("select l.id as lid,t.title,year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.staff_no = "+staff+" order by year(applied_date) desc,lid desc,t.title,l.status");
              if(rows.length > 0){  
                  res.render('partials/hr_leavestat',{
                      view:'leavestat',
                      title:'LEAVE STATISTICS',
                      data: rows,
                      user: req.session.user
                  }); 
              }else{
                  res.redirect('/hrm/leave');
              }    
        });

        // View Leave Form
        app.get('/hrm/leave/view/:id',isAuthenticated,async(req,res) => { 
          var id = req.params.id;        
          var rows = await dbx.query("select l.id as lid,j.title as jobtitle, year(applied_date) as year,date_format(applied_date,'%a %b %d, %Y') as adate,date_format(hr_date,'%a %b %d, %Y') as hdate,date_format(head_date,'%a %b %d, %Y') as udate,date_format(start_date,'%a %b %d, %Y') as start,date_format(end_date,'%a %b %d, %Y') as end,date_format(resume_date,'%a %b %d, %Y') as resume,l.*,s.*,t.*,l.emergency_contact,concat(r.lname,', ',r.fname,' ',r.mname,' (',l.relieved_by,')') as relieve,concat(u.lname,', ',u.fname,' ',ifnull(u.mname,''),' (',l.head_endorse,')') as uhead,concat(h.lname,', ',h.fname,' ',h.mname,' (',l.hr_endorse,')') as hhead from `leave_dump` l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id  = p.job_id left join leave_type t on t.id = l.type_id left join staff r on r.staff_no = l.relieved_by left join staff u on u.staff_no = l.head_endorse left join staff h on h.staff_no = l.hr_endorse where l.id = "+id);
            res.render('partials/hr_leavev',{
            view:'leavev',
            title:'LEAVE FORM',
            data: rows[0],
            user: req.session.user
            });     
        });


         // Update or Verify Resumption 
         app.get('/hrm/leave/resume/:id',isAuthenticated,async(req,res) => { 
            var id = req.params.id;        
            var rows = await dbx.query("update leave_dump set flag_resumed = 1 where id = "+id);
            res.redirect('/hrm/leave#page3'); 
          });

     

        // View Leave Statistics for Staff
        app.get('/hrm/leave/chgreliever/:id',isAuthenticated,async(req,res) => { 
            var id = req.params.id; 
            var st = req.query.st; 

            // Get Old Reliever and Notify of Change
            var oldst = await dbx.query("select l.relieved_by,s.* from leave_dump l left join staff s on l.relieved_by = s.staff_no where l.id = "+id);
            if(oldst[0].relieved_by != null && parseInt(oldst[0].relieved_by) != 0){
                // Notification - Old Reliever
                var data = {action : 'Leave Reliever Changed - DHR',message : ' Staff : '+oldst[0].relieved_by+' has been relieved from leave duties', staff_no : oldst[0].relieved_by, datetime : new Date(),read_flag : '0',priority : '1'}
                await dbx.query("insert into notification set ?",data);
                // Update Reliver Staff Leave Status 
                const rldata = {flag_leave:0,flag_leave_lock:0}
                await dbx.query("update staff set ? where staff_no = "+oldst[0].relieved_by,rldata);
                // Mail Staff - Old Reliever
                mailer(oldst[0].ucc_mail,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,'LEAVE RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES',oldst[0].relieved_by,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,oldst[0].photo,'UCC-HRMS || RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES');
            }

            // Get New Reliever and Notify of Change 
            var newst = await dbx.query("select s.* from staff s where s.staff_no = "+st);
            console.log(newst);
            if(newst.length > 0 ){
                // Notification - New Reliever
                var data = {action : 'Leave Reliever Changed - DHR',message : ' Staff : '+newst[0].staff_no+' has been placed on leave duties as a reliever', staff_no : newst[0].staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                await dbx.query("insert into notification set ?",data);
                // Update Reliver Staff Leave Status 
                const rldata = {flag_leave:2,flag_leave_lock:1}
                await dbx.query("update staff set ? where staff_no = "+st,rldata);
                // Mail Staff
                mailer(newst[0].ucc_mail,newst[0].fname+' '+newst[0].mname+' '+newst[0].lname,'LEAVE RELIEVER CHANGED','YOUR HAVE BEEN PLACED ON LEAVE DUTIES AS A RELIEVER')
                // Update Leave Reliever
                var rows = await dbx.query("update leave_dump set relieved_by = "+st+" where id = "+id);
            }
            res.redirect('/hrm/leave#page1');
           
        });
        
        app.get('/hrm/leave/rmreliever/:stno',isAuthenticated,async(req,res) => { 
            var id = req.params.stno; 
            // Get Old Reliever and Notify of Change
            var oldst = await dbx.query("select l.relieved_by,s.*,l.id as lid from leave_dump l left join staff s on l.relieved_by = s.staff_no where l.relieved_by = "+id+" order by l.id desc limit 1");
            console.log(oldst);
            if(oldst.length > 0){
                if(oldst[0].relieved_by != null && parseInt(oldst[0].relieved_by) != 0){
                    // Notification - Old Reliever
                    var data = {action : 'Leave Reliever Changed - DHR',message : ' Staff : '+oldst[0].relieved_by+' has been relieved from leave duties', staff_no : oldst[0].relieved_by, datetime : new Date(),read_flag : '0',priority : '1'}
                    await dbx.query("insert into notification set ?",data);
                    // Update Reliver Staff Leave Status 
                    const rldata = {flag_leave:0,flag_leave_lock:0}
                    await dbx.query("update staff set ? where staff_no = "+oldst[0].relieved_by,rldata);
                    // Mail Staff - Old Reliever
                    mailer(oldst[0].ucc_mail,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,'LEAVE RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES',oldst[0].relieved_by,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,oldst[0].photo,'UCC-HRMS || RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES');
                    // Update Original Leave with (No reliever = 000)
                    await dbx.query("update leave_dump set relieved_by = 0 where id = "+oldst[0].lid);
                }
            }else{
                const rldata = {flag_leave:0,flag_leave_lock:0}
                await dbx.query("update staff set ? where staff_no = "+id,rldata);
            }
            res.redirect('/hrm/leave#page1');
         });

         app.get('/hrm/leave/cancel/:id',isAuthenticated,async(req,res) => { 
            var id = req.params.id; 
            // Get Old Reliever and Notify of Change
            var oldst = await dbx.query("select l.relieved_by,s.*,l.id as lid,l.staff_no as nox from leave_dump l left join staff s on l.relieved_by = s.staff_no where l.id = "+id);
            if(oldst[0].relieved_by != null && parseInt(oldst[0].relieved_by) > 0){
                // Notification - Old Reliever
                var data = {action : 'Leave Reliever Changed - DHR',message : ' Staff : '+oldst[0].relieved_by+' has been relieved from leave duties', staff_no : oldst[0].relieved_by, datetime : new Date(),read_flag : '0',priority : '1'}
                await dbx.query("insert into notification set ?",data);
                // Update Reliver Staff Leave Status 
                const rldata = {flag_leave:0,flag_leave_lock:0}
                await dbx.query("update staff set ? where staff_no = "+oldst[0].relieved_by,rldata);
                // Mail Staff - Old Reliever
                mailer(oldst[0].ucc_mail,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,'LEAVE RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES',oldst[0].relieved_by,oldst[0].fname+' '+oldst[0].mname+' '+oldst[0].lname,oldst[0].photo,'UCC-HRMS || RELIEVER CHANGED','YOU HAVE BEEN RELIEVED OF LEAVE DUTIES');
            }
             // Update Actual Staff Leave Status 
              const rldata = {flag_leave:0,flag_leave_lock:0}
              await dbx.query("update staff set ? where staff_no = "+oldst[0].nox,rldata);
              
             // Update Original Leave Application Status 
              await dbx.query("update leave_dump set status = 'CANCELLED' where id = "+oldst[0].lid);
              res.redirect('/hrm/leave#page1');
         });

        // Test Moment business Days
         app.get('/hrm/testleave/:date/:day',loadmoment,async(req,res) => { 
                let day = req.params.day;
                let date = req.params.date;
                var out = moment(date,'DD-MM-YYYY').businessAdd(day)._d;
                //var out = moment('02-01-2021','DD-MM-YYYY').businessAdd(day)._d;
                //var out = moment('16-07-2018','DD-MM-YYYY').add('day',5).toString();
                let holidays  = await dbx.query("select date_format(holiday,'%m-%d-%Y') as holiday from leave_exclude where (year = '"+new Date().getFullYear()+"' or year = '"+(new Date().getFullYear()+1)+"')");
                holidays = holidays.map(h => {
                     return h.holiday;
                })
                res.json({out,holidays});
         });


        // Fix Leave on Resolve Holidays
        app.get('/hrm/fixleaveholiday',loadmoment,async(req,res)=>{  
            var hd = await dbx.query("select l.*,l.type_id as type,s.staff_group,s.phone from leave_dump l left join staff s on s.staff_no = l.staff_no where year(now()) = year(l.applied_date) and l.status in ('GRANTED','HEAD-PENDING','HR-PENDING')");
            if(hd.length > 0){
              for(var c of hd){
                var start,end,resume,days;
                c.start_date = c.start_date == '0000-00-00' ? moment(c.applied_date).businessAdd(6).format('YYYY-MM-DD') : c.start_date;
                if(c.staff_group != 'SM'){
                    if(c.type == 1 || c.type == 2 || c.type == 6){
                        // CASUAL LEAVE, ANNUAL LEAVE,SPECIAL LEAVE
                        days = parseInt(c.approved_days) || 0;
                        start = moment(c.start_date).format('YYYY-MM-DD');
                        end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                        resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            
        
                    }else if(c.type == 3 || c.type == 4){
                        // , MARTENITY LEAVE, SICK LEAVE 
                        days = parseInt(c.approved_days) || 0;
                        start = moment(c.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                        resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                    }else if(c.type == 5 ){
                        // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                        days = parseInt(c.approved_days) || 0;
                        start = moment(c.start_date).format('YYYY-MM-DD');
                        end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
                        resume = moment(end).businessAdd(4).format('YYYY-MM-DD');
                    }
                }else{
                    if(c.type != 5 ){
                        // ALL LEAVE 
                        days = parseInt(c.approved_days) || 0;
                        start = moment(c.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
                        //resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                        resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');
                    }else{
                        // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
                        days = parseInt(c.approved_days) || 0;
                        start = moment(c.start_date).format('YYYY-MM-DD');
                        end = moment(start).add((days-1),"days").format('YYYY-MM-DD');            
                        resume = moment(end).add(4,"days").format('YYYY-MM-DD'); 
                    }
                }   var data = {
                      end_date: end,
                      resume_date: resume,
                    } 
                    console.log({start:c.start_date,data});
                    var ins = await dbx.query("update leave_dump set ? where id ="+c.id,data);
                    if(ins){
                        var msg = "Greetings, Due to the recent adjustment of holidays, Your leave application has been reconciled accordingly, You shall resume on : "+resume+", Thank you!";
                        //sms(c.phone,msg);
                    }
              }
            }
            res.redirect('/hrm/leave');   
       });


       // SMS - Alert of Heads
       app.get('/hrm/leave/smshead/:id',async (req,res) => { 
            var id = req.params.id; 
            var sl = await dbx.query("select concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone,s.ucc_mail from leave_dump l left join staff b on l.staff_no = b.staff_no left join promotion p on p.id = b.promo_id left join unit u on p.unit_id = u.id left join staff s on ifnull(unit_subhead,unit_head) = s.staff_no where l.id ="+id);
            var mobile = sl[0].phone != null ? sl[0].phone : '0277675089';
            var msg = "Greetings, Please you have pending leave approvals in your staff portal dashboard. Goto http://staffportal.ucc.edu.gh to approve them!";
            sms(mobile,msg);
            res.redirect('/hrm/leave#page2');
       });


        // Mail - Alert of Heads
       app.get('/hrm/leave/mailhead/:id',async (req,res) => { 
                var id = req.params.id; 
                var sl = await dbx.query("select concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone,s.ucc_mail from leave_dump l left join staff b on l.staff_no = b.staff_no left join promotion p on p.id = b.promo_id left join unit u on p.unit_id = u.id left join staff s on ifnull(unit_subhead,unit_head) = s.staff_no where l.id ="+id);
                var email = sl[0].ucc_mail != null ? sl[0].ucc_mail : 'hrms@ucc.edu.gh';
                var msg = "You have pending leave approvals of subordinates in your dashboard. Please do well to attend to these requests quickly! Goto https://staffportal.ucc.edu.gh to access your staff portal.<br> Thank you very much.";
                var name = sl[0].name;
                var title = 'PENDING LEAVE APPROVALS';
                mailer(email,name,title,msg);
                res.redirect('/hrm/leave#page2');
       });


        // Alert of Staff
        app.get('/hrm/alertstaff/:staff/:msg',async (req,res) => { 
            var staff = req.params.id; 
            var msg = decodeURI(req.params.msg); 
            var sl = await dbx.query("select concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone,s.ucc_mail from staff s where s.staff_no ="+staff);
            var email = sl[0].ucc_mail != null ? sl[0].ucc_mail : 'hrms@ucc.edu.gh';
            var mobile = sl[0].phone != null ? sl[0].phone : '0277675089';
            var name = sl[0].name;
            var title = 'HRMS - URGENT NOTIFICATION';
            mailer(email,name,title,msg);
            sms(mobile,msg);
            res.redirect('/hrm/leave#page2');
        });



       // LEAVE TYPE - CATEGRIES

            // Add Category
       app.get('/hrm/addltype/',isAuthenticated,isAdmin,async(req,res) => {            
        // res.send("Welcome Back!");
           res.render('index_hr',{
               view:"addltype",
               title: "ADD CATEGORY",
               user: req.session.user,
               row : {id:0}               
           });    
        });


            // Edit Category
        app.get('/hrm/editltype/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let rows = await dbx.query("select * from leave_type where id = "+id);
            console.log(rows);
            res.render('index_hr',{
                view:"addltype",
                title: "EDIT CATEGORY",
                user: req.session.user,
                row: rows[0]            
            });
        });


        // Delete Category
        app.get('/hrm/delltype/:id',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from leave_type where id = "+id);
            res.redirect('/hrm/leave/#page4');              
        });  
        
        
         // Post Category
         app.post('/hrm/postltype',isAuthenticated,isAdmin,async(req,res)=>{ 
                let id;          
                if(req.body.id <= 0){                                       
                    let ins = await dbx.query("insert into leave_type set ?", req.body);                           
                }else{               
                    let ins = await dbx.query("update leave_type set ? where id ="+req.body.id,req.body);                      
                }
                res.redirect('/hrm/leave/#page4');     
         });
        


          // LEAVE TYPE - DEFERMENT

            // Add Category
       app.get('/hrm/adddefer/',isAuthenticated,isAdmin,async(req,res) => {            
        // res.send("Welcome Back!");
           res.render('index_hr',{
               view:"adddefer",
               title: "DEFER ANNUAL LEAVE",
               user: req.session.user,
               row : {id:0}               
           });    
        });


            // Edit Category
        app.get('/hrm/editdefer/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let rows = await dbx.query("select * from leave_defer where id = "+id);
            console.log(rows);
            res.render('index_hr',{
                view:"adddefer",
                title: "EDIT ANNUAL LEAVE DEFERMENT",
                user: req.session.user,
                row: rows[0]            
            });
        });


        // Delete Category
        app.get('/hrm/deldefer/:id',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from leave_defer where id = "+id);
            res.redirect('/hrm/leave/#page9');              
        });  
        
        
         // Post Category
         app.post('/hrm/postdefer',isAuthenticated,isAdmin,async(req,res)=>{ 
                let id; 
                // Get Leave Balance for 
                let stud = await dbx.query("select p.staff_group,p.job_id,p.staff_no from staff s left join promotion p on p.id = s.promo_id where s.staff_no = "+req.body.staff_no);   
                var con_add = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                var con_sub = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '"+stud[0].staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+stud[0].staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                var bal = await dbx.query("SELECT * FROM leave_balance where staff_no = "+stud[0].staff_no+" and active = '1'");  
                
                var weight;    
                switch(stud[0].staff_group){
                    case 'SS':
                            var k = weight = await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = 2");  
                            break;
    
                    case 'JS':
                            let check = await dbx.query("select * from `leave_weight` where `group` = '"+stud[0].staff_group+"' and type_id = 2 and jobs IS NULL");
                            if(check.length <= 0){ 
                                weight = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+stud[0].staff_group+"'  and type_id = 2 and find_in_set('"+stud[0].job_id+"',jobs) > 0");  
                            }else{  
                                weight = check;
                            }  
                            break;
    
                    case 'SM':
                            weight = (stud[0].staff_type == 'NON-ACADEMIC') ? await dbx.query("SELECT * FROM leave_weight where `group` = '"+stud[0].staff_group+"' and type_id = 2") : [{weight:null}];  
                            break;
                            
                    default : 
                            weight = [{weight:null}];
                            break;
                }
                var ent, sub = (con_sub.length > 0 ? con_sub[0].weight : 0), add = (con_add.length > 0 ? con_add[0].weight : 0);
                ent = weight.length > 0 ? (weight[0].weight+add-sub): 0;
                if(req.body.id <= 0){ 
                    req.body.year = new Date().getFullYear();
                    req.body.weight = ent;                                      
                    await dbx.query("insert into leave_defer set ?", req.body);
                    
                    let baldata = {staff_no:req.body.staff_no, year:new Date().getFullYear(), weight:(bal.length > 0 ? (bal[0].weight+ent):ent)};
                    if(bal.length > 0){
                        await dbx.query("update leave_balance set ? where id ="+bal[0].id,baldata);
                    }else{
                        await dbx.query("insert into leave_balance set ?",baldata);
                    } 

                }else{               
                    await dbx.query("update leave_defer set ? where id ="+req.body.id,req.body);                      
                }
                res.redirect('/hrm/leave/#page9');     
         });
        



         // LEAVE HOLIDAYS 

            // Add Holiday
       app.get('/hrm/addlexclude/',isAuthenticated,isAdmin,async(req,res) => {            
           res.render('index_hr',{
               view:"addlexclude",
               title: "ADD HOLIDAY",
               user: req.session.user,
               row : {id:0}               
           });    
        });


            // Edit Holiday
        app.get('/hrm/editlexclude/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let rows = await dbx.query("select *,date_format(holiday,'%Y-%m-%d') as holiday from leave_exclude where id = "+id);
            console.log(rows);
            res.render('index_hr',{
                view:"addlexclude",
                title: "EDIT HOLIDAY",
                user: req.session.user,
                row: rows[0]            
            });
        });


        // Delete Holiday
        app.get('/hrm/dellexclude/:id',loadmoment,isAuthenticated,async(req, res) => {
             let id = req.params.id;
            // Update All Affected Staff on Leave  -- Substract One Day from Leave
             let hol = await dbx.query("select * from leave_exclude where id = "+id)
             let sts = await dbx.query("select l.*,p.job_id,p.staff_group,s.staff_status from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id where (l.start_date <= '"+hol[0].holiday+"' and '"+hol[0].holiday+"' <= l.end_date) and (l.status = 'GRANTED' or l.status = 'HEAD-PENDING' or l.status = 'HR-PENDING') ")
             await Promise.all(sts.map(async st => {
                 var end,resume;
                 if(st.staff_group != 'SM'){
                     // ALL LEAVE
                     end = moment(st.end_date,'YYYY-MM-DD').prevBusinessDay().format('YYYY-MM-DD');           
                     resume = moment(st.end_date,'YYYY-MM-DD').format('YYYY-MM-DD');            
                 }else{
                     if(st.type == 5 || st.type == 4){
                         end = moment(st.end_date,'YYYY-MM-DD').prevBusinessDay().format('YYYY-MM-DD');           
                         resume = moment(st.end_date,'YYYY-MM-DD').format('YYYY-MM-DD');      
                     }else{
                         // ALL LEAVE 
                         end = moment(st.end_date,'YYYY-MM-DD').substract(1,"days").format('YYYY-MM-DD');           
                         resume = moment(st.end_date,'YYYY-MM-DD').format('YYYY-MM-DD');  
                     }
                 }
                 console.log(`Old : ${st.end_date}, New : ${end}`);
                 // Update New End of Leave & Resumption
                 await dbx.query("update leave_dump set end_date = '"+end+"',resume_date = '"+resume+"' where id = "+st.id);
                 
                 // Notification - Staff
                 let data = {action : 'Leave Decrement',message : 'Leave application with STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) has been decreased due to the removal of the '+moment(req.body.holiday).format('M DD, YYYY')+' holiday added! New Resumption Date is on '+resume, staff_no : st.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                 await dbx.query("insert into notification set ?",data);
                 // Mail Staff
                 // mailtheme('LEAVE DECREMENT','LEAVE APPLICATION WITH ID: '+st.lid+' AND STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) HAS BEEN DECREASED DUE TO THE REMOVAL OF THE '+moment(req.body.holiday).format('M DD, YYYY')+' HOLIDAY ADDED! NEW RESUMPTION DATE IS ON '+resume,st.staff_no,st.fname+' '+st.lname,st.photo,'UCC-HRMS - LEAVE DECREMENT','LEAVE APPLICATION WITH ID: '+st.lid+' AND STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) HAS BEEN UPGRADED DUE TO THE '+moment(req.body.holiday).format('M DD, YYYY')+' HOLIDAY OCCURRENCE! NEW RESUMPTION DATE IS ON '+resume,st.ucc_mail)
                 //mailer(email,name,title,msg);
             })); 
             await dbx.query("delete from leave_exclude where id = "+id);
             // Update Moment Holidays
             updateholidays();
             // Redirect
             res.redirect('/hrm/leave/#page5');              
        });  
        
        
         // Post Holiday
         app.post('/hrm/postlexclude',isAuthenticated,isAdmin,async(req,res)=>{ 
                let id;
                req.body.year = new Date(req.body.holiday).getFullYear();         
                if(req.body.id <= 0){                                       
                    let ins = await dbx.query("insert into leave_exclude set ?", req.body);                           
                }else{               
                    let ins = await dbx.query("update leave_exclude set ? where id ="+req.body.id,req.body);                      
                }

                // Update All Affected Staff on Leave  -- Add Extra Day to Leave
                let sts = await dbx.query("select s.*,l.*,l.id as lid,p.job_id,p.staff_group,s.staff_status from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id where (l.start_date <= '"+req.body.holiday+"' and '"+req.body.holiday+"' <= l.end_date) and l.status in ('GRANTED','HEAD-PENDING','HR-PENDING')")
                await Promise.all(sts.map(async st => {
                    var end,resume;
                    if(st.staff_group != 'SM'){
                        // ALL LEAVE
                        end = moment(st.end_date).businessAdd(1).format('YYYY-MM-DD');           
                        resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            

                    }else{
                        if(st.type == 5 || st.type == 4){
                            end = moment(st.end_date).businessAdd(1).format('YYYY-MM-DD');           
                            resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');    
                        }else{
                            // ALL LEAVE 
                            end = moment(st.end_date).add(1,"days").format('YYYY-MM-DD');           
                            resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
                        }
                    }
                    // Update New End of Leave & Resumption
                    await dbx.query("update leave_dump set end_date = '"+end+"',resume_date = '"+resume+"' where id = "+st.id);
                    
                    // Notification - Staff
                    let data = {action : 'Leave Upgrade',message : 'Leave application with STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) have been upgraded due to the '+moment(req.body.holiday).format('M DD, YYYY')+' holiday occurrence! New Resumption Date is on '+resume, staff_no : st.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                    await dbx.query("insert into notification set ?",data);
                    // Mail Staff
                    //mailtheme('LEAVE UPGRADE','LEAVE APPLICATION WITH ID: '+st.lid+' AND STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) HAS BEEN UPGRADED DUE TO THE '+moment(req.body.holiday).format('M DD, YYYY')+' HOLIDAY OCCURRENCE! NEW RESUMPTION DATE IS ON '+resume,st.staff_no,st.fname+' '+st.lname,st.photo,'UCC-HRMS - LEAVE UPGRADE','LEAVE APPLICATION WITH ID: '+st.lid+' AND STAT( D:'+st.approved_days+',E:'+st.entitlement+' ) HAS BEEN UPGRADED DUE TO THE '+moment(req.body.holiday).format('M DD, YYYY')+' HOLIDAY OCCURRENCE! NEW RESUMPTION DATE IS ON '+resume,st.ucc_mail)
                    //mailer(email,name,title,msg);
                    // SMS Staff
                    var msg = "Greetings, Your leave request has been reconciled due to an effected national holiday. Thank you!"
                    sms(st.phone,msg);
                }));
                 // Redirect
                 res.redirect('/hrm/leave/#page3');     
         });
        

    // LEAVE CONSTANTS 

            // Add Constant
       app.get('/hrm/addlconstant/',isAuthenticated,isAdmin,async(req,res) => {            
        res.render('index_hr',{
            view:"addlconstant",
            title: "ADD CONSTANT",
            user: req.session.user,
            row : {id:0}               
        });    
     });


         // Edit Constant
     app.get('/hrm/editlconstant/:id',isAuthenticated,isAdmin,async(req,res) => { 
         let id = req.params.id;
         let rows = await dbx.query("select * from leave_constant where id = "+id);
         console.log(rows);
         res.render('index_hr',{
             view:"addlconstant",
             title: "EDIT CONSTANT",
             user: req.session.user,
             row: rows[0]            
         });
     });


     // Delete Constant
     app.get('/hrm/dellconstant/:id',isAuthenticated,isAdmin,async(req, res) => {
         let id = req.params.id;
         await dbx.query("delete from leave_constant where id = "+id);
         res.redirect('/hrm/leave/#page6');              
     });  
     
     
      // Post Constant
      app.post('/hrm/postlconstant',isAuthenticated,isAdmin,async(req,res)=>{ 
             
             req.body.exclusion = req.body.exclusion == '' ? null : req.body.exclusion;
             console.log(req.body);
             if(req.body.id <= 0){ 
                 req.body.year = new Date().getFullYear();                                      
                 let ins = await dbx.query("insert into leave_constant set ?", req.body);                           
             }else{               
                 let ins = await dbx.query("update leave_constant set ? where id = "+req.body.id,req.body);                      
             }
             // Redirect
             res.redirect('/hrm/leave/#page6');     
      });
     


      // LEAVE BALANCES 

            // Add Balance
            app.get('/hrm/addlbalance/:staffno',isAuthenticated,isAdmin,async(req,res) => {
                let staff_no = req.params.staffno;
                let id = req.query.id;   
                let bl = await dbx.query("select * from leave_balance where staff_no = "+staff_no);
                let weight;
                let data;
                if(bl.length > 0){
                    weight = parseInt(id)+bl[0].weight;
                    data = {staff_no,weight,active:'1',history :'A_'+parseInt(id)+','+bl[0].history, year : new Date().getFullYear()};
                    await dbx.query("update leave_balance set ? where id ="+bl[0].id,data);
                }else{
                    weight = parseInt(id);
                    data = {staff_no,weight,active:'1',history :'A_'+parseInt(id),year : new Date().getFullYear(),flag_used : '0'};
                    await dbx.query("insert into leave_balance set ?",data);
                }
                res.redirect('/hrm/leave/#page8');    
            });


            // Substract Balance
            app.get('/hrm/sublbalance/:staffno',isAuthenticated,isAdmin,async(req,res) => {
                let staff_no =  req.params.staffno;
                let id = req.query.id;   
                let bl = await dbx.query("select * from leave_balance where staff_no = "+staff_no);
                let weight;
                let data;
                if(bl.length > 0){
                    weight = (bl[0].weight-parseInt(id)) > 0 ? (bl[0].weight-parseInt(id)) : 0;
                    data = {staff_no,weight,active:'1',history :'S_'+parseInt(id)+','+bl[0].history, year : new Date().getFullYear()};
                    await dbx.query("update leave_balance set ? where id ="+bl[0].id,data);
                }else{
                    weight = parseInt(id);
                    data = {staff_no,weight,active:'1',history :'S_'+parseInt(id),year : new Date().getFullYear(),flag_used : '0'};
                    await dbx.query("insert into leave_balance set ?",data);
                }
                res.redirect('/hrm/leave/#page8');    
             });
        
        
            // Enable Balance
             app.get('/hrm/enablebalance/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id;
                 let status = req.query.status;
                 let rows = await dbx.query("update leave_balance set active = '"+status+"' where staff_no = "+id);
                 res.redirect('/hrm/leave/#page8');    
             });
        
        
             // Delete Balance
             app.get('/hrm/dellbalance/:id',isAuthenticated,isAdmin,async(req, res) => {
                 let id = req.params.id;
                 await dbx.query("delete from leave_balance where staff_no = "+id);
                 res.redirect('/hrm/leave/#page8');              
             });  
             
            

      
           // LEAVE ENTITLEMENTS 

            // Add Entitlement
            app.get('/hrm/addlweight/',isAuthenticated,isAdmin,async(req,res) => {  
                let types = await dbx.query("select * from leave_type where active = 1"); 
                let jobs = await dbx.query("select * from job where active = '1'");          
                res.render('index_hr',{
                    view:"addlweight",
                    title: "ADD ENTITLEMENT",
                    user: req.session.user,
                    row : {id:0},types,jobs               
                });    
             });
        
        
             // Edit Constant
             app.get('/hrm/editlweight/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id;
                 let rows = await dbx.query("select * from leave_weight where id = "+id);
                 let types = await dbx.query("select * from leave_type where active = 1"); 
                 let jobs = await dbx.query("select * from job where active = '1'");        
                 console.log(rows);
                 res.render('index_hr',{
                     view:"addlweight",
                     title: "EDIT ENTITLEMENT",
                     user: req.session.user,
                     row: rows[0],types,jobs             
                 });
             });
        
        
             // Delete Constant
             app.get('/hrm/dellweight/:id',isAuthenticated,isAdmin,async(req, res) => {
                 let id = req.params.id;
                 await dbx.query("delete from leave_weight where id = "+id);
                 res.redirect('/hrm/leave/#page5');              
             });  
             
             
              // Post Constant
              app.post('/hrm/postlweight',isAuthenticated,isAdmin,async(req,res)=>{                    
                    req.body.jobs = req.body.jobs == undefined ? null :(typeof req.body.jobs === 'string' ? req.body.jobs : req.body.jobs.join(','));
                    console.log(req.body);
                     if(req.body.id <= 0){                                                   
                         let ins = await dbx.query("insert into leave_weight set ?", req.body);                           
                     }else{                                         
                         let ins = await dbx.query("update leave_weight set ? where id ="+req.body.id,req.body);                      
                     }
                     // Redirect
                     res.redirect('/hrm/leave/#page5');     
              });



              /* MAIN SYSTEM & APPLICATION REPORTS */

              // LEAVE REPORTS
              app.get('/hrm/reports/',isAuthenticated,isAdmin,async(req,res) => {  
                res.render('index_hr',{
                     view:"report",
                     title: "SYSTEM REPORTS",
                     user: req.session.user
                 });    
              });
 
              /* POST - LEAVE REPORT */
              app.post('/hrm/leavereport',isAuthenticated,async(req,res) => { 
                 //res.json(req.body);
                 var {action,type,start,end,output} = req.body;
                 //var action = req.query.action, type = req.query.type, output = req.query.output;
                 if(output == 'pdf'){
                     if(action == 'on-leave'){
                             // ON-LEAVE - print
                             var sql = "select s.staff_no,s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(l.start_date,'%D %M, %Y') as start_date,date_format(l.end_date,'%D %M, %Y') as end_date,l.approved_days,u.long_name as unitname,j.title as jobtitle,l.status from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where l.status = 'GRANTED'";
                                 sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                                 sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                             var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                             var rows = await dbx.query(sql);
                             if(rows.length > 0){  
                                 res.render('partials/hr_report_lpr_leave',{
                                     view:'report_lpr_leave',
                                     title,action,
                                     data: rows,
                                     user: req.session.user
                                 });
                             }else{
                                 res.redirect('/hrm/reports/');
                             } 
                     }else if(action == 'expired-leave'){
                        // EXPIRED-LEAVE - print
                        var sql = "select s.staff_no,s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(l.start_date,'%D %M, %Y') as start_date,date_format(l.end_date,'%D %M, %Y') as end_date,l.approved_days,u.long_name as unitname,j.title as jobtitle,l.status from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where l.status = 'ENDED'";
                            sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                            sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_lpr_leave',{
                                view:'report_lpr_leave',
                                title,action,
                                data: rows,
                                user: req.session.user
                            });
                        }else{
                            res.redirect('/hrm/reports/');
                        } 
                    }else if(action == 'pended-leave'){
                        // PENDED-LEAVE - print
                        var sql = "select s.staff_no,s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(l.start_date,'%D %M, %Y') as start_date,date_format(l.end_date,'%D %M, %Y') as end_date,l.approved_days,u.long_name as unitname,j.title as jobtitle,l.status from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where (l.status = 'HEAD-PENDING' or l.status = 'HR-PENDING' or l.status = 'STAFF-PENDING')";
                            sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                            sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_lpr_leave',{
                                view:'report_lpr_leave',
                                title,action,
                                data: rows,
                                user: req.session.user
                            });
                        }else{
                            res.redirect('/hrm/reports/');
                        } 
                     }
     
                 }else{
     
                     if(action == 'on-leave'){
                         // ON-LEAVE - Excel
                         var sql = "select s.staff_no as 'STAFF NUMBER',s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',date_format(l.start_date,'%D %M, %Y') as 'START DATE',date_format(l.end_date,'%D %M, %Y') as 'END DATE',l.approved_days as 'APPROVED DAYS',u.long_name as 'UNIT',j.title as 'DESIGNATION',l.status as 'LEAVE STATUS' from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where l.status = 'GRANTED'";
                         sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                         sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                         var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                         var rows = await dbx.query(sql);
                         if(rows.length > 0){  
                             res.xls(title+'.xlsx',rows); 
                         }else{
                             res.redirect('/hrm/reports/');
                         }   
                     }else if(action == 'expired-leave'){
                        // EXPIRED-LEAVE - Excel
                        var sql = "select s.staff_no as 'STAFF NUMBER',s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',date_format(l.start_date,'%D %M, %Y') as 'START DATE',date_format(l.end_date,'%D %M, %Y') as 'END DATE',l.approved_days as 'APPROVED DAYS',u.long_name as 'UNIT',j.title as 'DESIGNATION',l.status as 'LEAVE STATUS' from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where l.status = 'ENDED'";
                        sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.xls(title+'.xlsx',rows); 
                        }else{
                            res.redirect('/hrm/reports/');
                        }   
                    }else if(action == 'pended-leave'){
                        // PENDED-LEAVE - Excel
                        var sql = "select s.staff_no as 'STAFF NUMBER',s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',date_format(l.start_date,'%D %M, %Y') as 'START DATE',date_format(l.end_date,'%D %M, %Y') as 'END DATE',l.approved_days as 'APPROVED DAYS',u.long_name as 'UNIT',j.title as 'DESIGNATION',l.status as 'LEAVE STATUS' from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id where (l.status = 'HEAD-PENDING' or l.status = 'HR-PENDING' or l.status = 'STAFF-PENDING')";
                        sql += (start != '' && end != '' ? " and (start_date >= date('"+start+"') and end_date <= date('"+end+"')) " : ' and year(start_date) = year(NOW())')
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' STAFF '+action.toUpperCase()+' ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.xls(title+'.xlsx',rows); 
                        }else{
                            res.redirect('/hrm/reports/');
                        }   
                    }
                 }
         });
     



             
        
         // USERS & ROLES

            // Fetch Users
            app.get('/hrm/users/',isAuthenticated,isAdmin,async(req,res) => {  
                let users = await dbx.query("select u.*,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.phone as mobile from user u left join staff s on s.staff_no = u.staff_no  where u.active = '1' and (find_in_set('01',u.roles) > 0 or find_in_set('05',u.roles) > 0 or find_in_set('02',u.roles) > 0 or find_in_set('07',u.roles) > 0 or find_in_set('06',u.roles) > 0 or find_in_set('08',u.roles) > 0)"); 
                let staff = await dbx.query("select * from user u where u.active = '1' and find_in_set('03',u.roles) > 0 "); 
                
                users = await Promise.all(users.map(async user => {
                    let roles = await Promise.all(user.roles.split(',').map(async userole => {
                         let role = await dbx.query("select * from user_roles where role = '"+userole+"'"); 
                         return role[0].desc.toUpperCase();
                    }));
                    user.role = '<button class="btn btn-sm">'+roles.join('</button><br/><button class="btn btn-sm btn-primary" style="margin-top:5px;">')+'</button>';
                    return user;
                }));
                
               
                
                console.log(users);         
                res.render('index_hr',{
                    view:"user",
                    title: "ROLES",
                    user: req.session.user,
                    users,staff              
                });    
            });



            // DOB - JSON
            app.post('/hrm/users/heads/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(5);
                columns[0] = 'staff_no';
                columns[1] = 'name';
                columns[2] = 'role';
                columns[3] = 'mobile';
                columns[4] = 'action';
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%') ";
                } 
    
                let sql = "select u.*,concat(s.fname,' ',ifnull('',s.mname),' ',s.lname) as name,s.phone as mobile from user u left join staff s on s.staff_no = u.staff_no  where u.active = '1' and (find_in_set('04',u.roles) > 0) ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += " order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (user) =>{
                    let m = 0;
                    if(m == 0){
                        let roles = await Promise.all(user.roles.split(',').map(async userole => {
                            let role = await dbx.query("select * from user_roles where role = '"+userole+"'"); 
                            return role[0].desc.toUpperCase();
                        }));
                        user.role = '<button class="btn btn-sm">'+roles.join('</button><br/><button class="btn btn-sm btn-primary" style="margin-top:5px;">')+'</button>';
                        user.action = `<div class="btn-group">                                                       
                                            <a class="btn btn-default btn-sm" href="/hrm/edituser/${user.staff_no}" title="Update Head Roles"><i class="fa fa-edit"></i> Access</a>
                                            <a class="btn btn-default btn-sm" href="/hrm/remhaccess/${user.staff_no}" title="Remove Head Roles"><i class="fa fa-trash"></i> Access</a>
                                       </div>`;  
                       user.staff_no = `<button class="btn btn-sm">${user.staff_no}</button>`;
                    }
                    return user;
                }));
                    
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });


            // Add User
            app.get('/hrm/adduser/',isAuthenticated,isAdmin,async(req,res) => {  
                let roles = await dbx.query("select * from user_roles");          
                res.render('index_hr',{
                    view:"adduser",
                    title: "ADD USER PRIVILEGE",
                    user: req.session.user,
                    row : {id:0},roles              
                });    
             });
        

            // Add Staff Access 
            app.get('/hrm/addsaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("select * from user where staff_no = "+id);
                if(rows.length == 0){
                  let data = {staff_no:id,username:id,password:md5('hrms123456'),active:'1'}
                  await dbx.query("insert into user set ?",data);
                }
                res.redirect('/hrm/edituser/'+id);
            });

            // Add Head Access 
             app.get('/hrm/addhaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let role = await dbx.query("select * from user where staff_no = "+id);  
                let access = role[0].roles.split(',').filter(row => {
                    return row != '03';
                });
                access = [...access,'04'];
                let data = {roles:access.toString(), role:access[0], active:'1'}
                await dbx.query("update user set ? where staff_no = "+id,data);
                res.redirect('/hrm/users#page1');
            });

            // Disable Staff Access 
            app.get('/hrm/disaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("update user set active = '0' where staff_no = "+id);
                res.redirect('/hrm/users/#page1');
            });

             // Disable Staff Access 
            app.get('/hrm/enbaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("update user set active = '1' where staff_no = "+id);
                res.redirect('/hrm/users/#page1');
            });


            // Reset Access 
            app.get('/hrm/resaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let data = md5('hrms123456');
                let rows = await dbx.query("update user set password = '"+data+"' where staff_no = "+id);
                res.redirect('/hrm/users#page1');
            });

            // Remove Admin Access 
             app.get('/hrm/remaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let role = await dbx.query("select * from user where staff_no = "+id);  
                let access = role[0].roles.split(',').filter(row =>{
                      return (row == '03' || row == '04');
                });        
                let data = {roles:access.toString(),role:access[0],active:'1'}
                await dbx.query("update user set ? where staff_no = "+id,data);
                res.redirect('/hrm/users#page1');
            });

            // Remove Head Access 
            app.get('/hrm/remhaccess/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let role = await dbx.query("select * from user where staff_no = "+id);  
                let access = role[0].roles.split(',').filter(row => {
                      return row != '04';
                });
                console.log(access);
                access = [...access,'03'];
                console.log(access);
                let data = {roles:access.toString(), role:access[0], active:'1'}
                await dbx.query("update user set ? where staff_no = "+id,data);
                res.redirect('/hrm/users#page1');
            });

             /*
            // Setup User Access 
            app.get('/hrm/users/setup',isAuthenticated,isAdmin,async(req,res) => { 
                let users = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL)");  
                if(users.length > 0){
                    users.map(async user => {
                        // let st = await dbx.query("select * from user where staff_no = "+user.staff_no);
                        var hd = await dbx.query("select * from unit where unit_head = "+user.staff_no+" or unit_subhead = "+user.staff_no);
                        var srole = hd.length > 0 ? '04':'03';
                        if(user.role != null && user.roles != null){
                            var roles = user.roles.split(',').map(row => {
                                return (row != '03' && row != '04');
                            });
                            var new_roles = roles.length > 0 ? (srole+','+roles.join(',')) : srole;
                            console.log(new_roles);
                            console.log(roles.join(','));
                            await dbx.query("update user set roles = '"+new_roles+"',role = '"+srole+"' where staff_no = "+user.staff_no); 
                        }else{
                            var pass = md5('hrms123456');
                            await dbx.query("insert into user set roles = '"+srole+"',staff_no = "+user.staff_no+",role = '"+srole+"',username = '"+user.staff_no+"',password = '"+pass+"',active = '1'");
                        }
                    });
                }
                res.redirect('/hrm/users#page1');
            });
             */
            app.get('/hrm/users/setup',isAuthenticated,isAdmin,async(req,res) => { 
                let users = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where (s.ucc_mail <> '' or s.ucc_mail IS NOT NULL)");  
                if(users.length > 0){
                    users.map(async user => {
                        // let st = await dbx.query("select * from user where staff_no = "+user.staff_no);
                        var hd = await dbx.query("select * from unit where unit_head = "+user.staff_no+" or unit_subhead = "+user.staff_no);
                        var srole = hd.length > 0 ? '04':'03';
                        if(user.role != null && user.roles != null){
                            var roles = user.roles.split(',').map(row => {
                                return (row != '03' && row != '04');
                            });
                            var new_roles = roles.length > 0 ? (srole+','+roles.join(',')) : srole;
                            console.log(new_roles);
                            console.log(roles.join(','));
                           // await dbx.query("update user set roles = '"+new_roles+"',role = '"+srole+"' where staff_no = "+user.staff_no); 
                        }else{
                            var pass = md5('hrms123456');
                            //await dbx.query("insert into user set roles = '"+srole+"',staff_no = "+user.staff_no+",role = '"+srole+"',username = '"+user.staff_no+"',password = '"+pass+"',active = '1'");
                        }
                    });
                }
                res.redirect('/hrm/users#page1');
             });

             // Edit User
             app.get('/hrm/edituser/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id;
                 let rows = await dbx.query("select * from user where staff_no = "+id);
                 let roles = await dbx.query("select * from user_roles");           
                 console.log(rows);
                 res.render('index_hr',{
                     view:"adduser",
                     title: "EDIT USER PRIVILEGE",
                     user: req.session.user,
                     row: rows[0],roles               
                 });
             });
        

             // Post User Privileges
             app.post('/hrm/postuser',isAuthenticated,isAdmin,async(req,res) => { 
                    req.body.roles = req.body.roles.toString();
                    req.body.role = req.body.roles.split(',').length > 1 ? req.body.roles.split(',').filter(role => {return role != '03' || role != '04'})[0] : req.body.roles.split(',')[0];
                    if(req.body.id <= 0){                                                   
                        let ins = await dbx.query("insert into user set ?", req.body);                           
                    }else{                                         
                        let ins = await dbx.query("update user set ? where id ="+req.body.id,req.body);                      
                    }
                    // Redirect
                    res.redirect('/hrm/users/#page1');     
             });

                        
             // UNITS & HEADS

             // Fetch Units
             app.get('/hrm/units/',isAuthenticated,isAdmin,async(req,res) => {  
                let units = await dbx.query("select u.*,p.long_name as parent_name,c.long_name as college,f.long_name as faculty,d.long_name as dept,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' (',h.staff_no,')') as head_name,concat(m.fname,' ',ifnull(m.mname,''),' ',m.lname,' (',m.staff_no,')') as sub_name from unit u left join unit p on u.parent_id = p.id left join unit c on u.college_id = c.id left join unit f on u.faculty_id = f.id left join unit d on u.dept_id = d.id left join staff h on u.unit_head = h.staff_no left join staff m on m.staff_no = u.unit_subhead order by trim(u.long_name)"); 
                let parents = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name from unit u left join staff h on u.unit_head = h.staff_no where u.parent_flag = 1 and u.parent_id = u.id"); 
                let colleges = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name  from unit u  left join staff h on u.unit_head = h.staff_no where u.type='ACADEMIC' and u.level='1'"); 
                let faculties = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' (',h.staff_no,' )') as head_name,c.long_name as college from unit u left join staff h on u.unit_head = h.staff_no left join unit c on u.college_id = c.id where u.type='ACADEMIC' and u.level='2'"); 
                let depts = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name,c.long_name as college,f.long_name as faculty from unit u left join staff h on u.unit_head = h.staff_no  left join unit c on u.college_id = c.id left join unit f on u.faculty_id = f.id where u.type='ACADEMIC' and u.level='3'"); 
                let directs = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name  from unit u  left join staff h on u.unit_head = h.staff_no where type='NON-ACADEMIC' and level='1'"); 
                let divs = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name,d.long_name as direct  from unit u left join staff h on u.unit_head = h.staff_no left join unit d on u.parent_id = d.id where u.type='NON-ACADEMIC' and u.level='2'"); 
                let subs = await dbx.query("select u.*,concat(h.fname,' ',ifnull(h.mname,''),' ',h.lname,' ( ',h.staff_no,' )') as head_name,d.long_name as direct from unit u left join staff h on u.unit_head = h.staff_no left join unit d on u.parent_id = d.id where u.type='NON-ACADEMIC' and u.level='3'"); 
                parents = await Promise.all(parents.map(async parent => {
                    let count = await dbx.query("select * from unit where parent_id <> id and parent_id = "+parent.id);
                    //let count = await dbx.query("select * from unit where parent_flag = null and parent_id = "+parent.id);   
                    parent.count = count.length;
                    return parent;
                }));
                colleges = await Promise.all(colleges.map(async college => {
                    let count = await dbx.query("select * from unit where level = '2' and college_id = "+college.id);
                    college.fac = count.length;
                    let counts = await dbx.query("select * from unit where level = '3' and college_id = "+college.id);
                    college.dep = counts.length;
                    return college;
                }));
                faculties = await Promise.all(faculties.map(async faculty => {
                    let counts = await dbx.query("select * from unit where level = '3' and faculty_id = "+faculty.id);
                    faculty.dep = counts.length;
                    return faculty;
                }));
                directs = await Promise.all(directs.map(async direct => {
                    let count = await dbx.query("select * from unit where level = '2' and parent_id = "+direct.id);
                    direct.div = count.length;
                    let counts = await dbx.query("select * from unit where level = '3' and parent_id = "+direct.id);
                    direct.unit = counts.length;
                    return direct;
                }));
                console.log(parents);
                res.render('index_hr',{
                    view:"unit",
                    title: "UNITS & SECTIONS",
                    user: req.session.user,
                    units,parents,colleges,faculties,depts,directs,divs,subs            
                });    
             });


            // Merge Unit
            app.get('/hrm/units/gson',async(req,res) => { 
                let rows = await dbx.query("select * from unit order by long_name asc");
                 if(rows.length > 0){
                    res.json({success:true,data:rows}); 
                 }else{
                    res.json({success:false,data:null}); 
                 }
            });

            // Add Unit
            app.get('/hrm/addunit/',isAuthenticated,isAdmin,async(req,res) => {  
                let colleges = await dbx.query("select * from unit where type='ACADEMIC' and level='1'"); 
                let faculties = await dbx.query("select * from unit where type='ACADEMIC' and level='2'"); 
                let depts = await dbx.query("select * from unit where type='ACADEMIC' and level='3'"); 
                let parents = await dbx.query("select * from unit order by trim(long_name)"); 
                res.render('index_hr',{
                    view:"addunit",
                    title: "ADD UNIT",
                    user: req.session.user,ref:1,
                    row : {id:0},faculties,colleges,depts,parents              
                });    
             });
        
        
            // Edit Unit
            app.get('/hrm/editunit/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; let ref = req.query.url;
                 let rows = await dbx.query("select * from unit where id = "+id);
                 let colleges = await dbx.query("select * from unit where type='ACADEMIC' and level='1'"); 
                 let faculties = await dbx.query("select * from unit where type='ACADEMIC' and level='2'"); 
                 let depts = await dbx.query("select * from unit where type='ACADEMIC' and level='3'"); 
                 let parents = await dbx.query("select * from unit order by trim(long_name)"); 
                 console.log(rows);
                 res.render('index_hr',{
                     view:"addunit",
                     title: "EDIT UNIT",
                     user: req.session.user,ref,   
                     row: rows[0],faculties,colleges,depts,parents              
                 });
             });


             // List Units Staff
             app.get('/hrm/unit/list/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("select u.*,s.staff_no,s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,j.title from unit u left join promotion p on p.unit_id = u.id left join staff s on p.staff_no = s.staff_no left join job j on j.id = p.job_id where u.id = "+id);
                console.log(rows);
                res.render('partials/hr_unitlist',{
                    view:'unitlist',
                    title:rows[0].long_name,
                    data: rows,
                    user: req.session.user
                }); 
             });


              // List All Units Staff
              app.get('/hrm/unit/alist/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let units = [];
                let title = await dbx.query("select long_name from unit where id = "+id);
                let rows = await dbx.query("select id,long_name from unit where parent_id = "+id);
                rows.map(row => {
                    units.push(row.id);
                });
                let uid = units.join(',');
                let mx = await dbx.query("select distinct(s.staff_no),s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,u.*,j.title from staff s left join promotion p on p.id = s.promo_id left join job j on p.job_id = j.id left join unit u on u.id = p.unit_id where find_in_set(p.unit_id,'"+uid+"') > 0 order by s.staff_no asc");
                res.render('partials/hr_unitlist',{
                    view:'unitlist',
                    title:rows[0].long_name,
                    data:mx,
                    user: req.session.user
                }); 
             });


             // Merge Unit
             app.get('/hrm/unitmerge/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id; let master = req.query.id.trim();
                let rows = await dbx.query("select * from unit where id = "+id);
                // Clean all tables with master unit id
                await dbx.query("update staff set unit_id = "+master+" where unit_id = "+id); // Staff table
                await dbx.query("update promotion set unit_id = "+master+" where unit_id = "+id); // Promotion table
                await dbx.query("update transfer set from_unit = "+master+" where from_unit = "+id); // Transfer#1 table
                await dbx.query("update transfer set to_unit = "+master+" where to_unit = "+id); // Transfer#2 table
                await dbx.query("update unit_head set unit_id = "+master+" where unit_id = "+id); // Unit_head table
                // Delete Old Unit ID
                await dbx.query("delete from unit where id = "+id);
                // Redirect
                res.redirect('/hrm/units#page1'); 
            });

            // Post Unit
            app.post('/hrm/postunit',isAuthenticated,isAdmin,async(req,res)=>{  
                let data = {}; let ref = req.body.ref; delete(req.body.ref);
                if(req.body.parent_id == 'self') {
                    data['parent_flag'] = 1; data['parent_id'] = req.body.parent_id; delete(req.body.parent_id);
                }else if(req.body.parent_id.trim() == '') { req.body.parent_id = null; data['parent_flag'] = null;}
                if(req.body.college_id == 'self') {
                    data['college_id'] = req.body.college_id; delete(req.body.college_id);
                }else if(req.body.college_id.trim() == '') { req.body.college_id = null;}
                if(req.body.faculty_id == 'self') {
                    data['faculty_id'] = req.body.faculty_id; delete(req.body.faculty_id);
                }else if(req.body.faculty_id.trim() == '') { req.body.faculty_id = null;}
                if(req.body.dept_id == 'self') {
                    data['dept_id'] = req.body.dept_id; delete(req.body.dept_id);
                }else if(req.body.dept_id.trim() == '') { req.body.dept_id = null;}
                
                // Access 
                req.body.unit_subhead = req.body.unit_subhead.trim() != '' ? req.body.unit_subhead : null;
                req.body.unit_head = req.body.unit_head.trim() != '' ? req.body.unit_head : null;
                req.body.old_unit_subhead = req.body.old_unit_subhead.trim() != '' ? req.body.old_unit_subhead : null;
                req.body.old_unit_head = req.body.old_unit_head.trim() != '' ? req.body.old_unit_head : null;
                let old_sub = req.body.old_unit_subhead,sub = req.body.unit_subhead,old_hod = req.body.old_unit_head,hod = req.body.unit_head;
                delete req.body.old_unit_head,delete req.body.old_unit_subhead; // Remove Old Records
                /*
                if((old_sub != null && sub != null) && old_sub != sub){
                     // Remove Sub Head access from old
                     let sl_old = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where s.staff_no = "+old_sub);  
                     if(sl_old.length > 0 && (sl_old[0].role != null && sl_old[0].roles != null)){
                        var ss = await dbx.query("select * from unit where unit_head = "+old_sub);
                        var roles = sl_old[0].roles.split(',').filter(row => {
                            return (row != '03' && row != '04');
                        });
                        if(ss.length == 1){ // If Privilege was with only 1 unit - ['03' is set for staff ]
                            var new_roles = roles.length > 0 ? ('03,'+roles.join(',')) : '03';
                            if(roles.length > 0){
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+old_sub); 
                            }else{
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+old_sub); 
                            }
                        }else if(ss.length > 1){ // If Privilege was with 2 or more units - ['04' still holds for staff]
                            var new_roles = roles.length > 0 ? ('04,'+roles.join(',')) : '04';
                            if(roles.length > 0){
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+old_sub); 
                            }else{
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+old_sub); 
                            }
                        }
                    }

                     // Add new Sub Head Access to New Hod
                     let sl_sub = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where s.staff_no = "+sub);  
                     if(sl_sub.length > 0 && (sl_sub[0].role != null && sl_sub[0].roles != null)){
                        var roles = sl_sub[0].roles.split(',').filter(row => {
                            return (row != '03' && row != '04');
                        });
                        var new_roles = roles.length > 0 ? ('04,'+roles.join(',')) : '04';
                        if(roles.length > 0){
                            await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+sub); 
                        }else{
                            await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+sub); 
                        }
                     }
                }
                */

                if(old_hod != null && hod != null && old_hod != hod){
                    // Remove Main Head access from old
                     let sl_hod = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where s.staff_no = "+old_hod);  
                     if(sl_hod.length > 0 && (sl_hod[0].role != null && sl_hod[0].roles != null)){
                        var ss = await dbx.query("select * from unit where unit_head = "+old_hod);
                        var roles = sl_hod[0].roles.split(',').filter(row => {
                            return (row != '03' && row != '04');
                        });
                        if(ss.length == 1){ // If Privilege was with only 1 unit - ['03' is set for staff ]
                            var new_roles = roles.length > 0 ? ('03,'+roles.join(',')) : '03';
                            if(roles.length > 0){
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+old_hod); 
                            }else{
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+old_hod); 
                            }
                        }else if(ss.length > 1){ // If Privilege was with 2 or more units - ['04' still holds for staff]
                            var new_roles = roles.length > 0 ? ('04,'+roles.join(',')) : '04';
                            if(roles.length > 0){
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+old_hod); 
                            }else{
                                await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+old_hod); 
                            }
                        }
                
                     }

                     // Add new Main Access to New Hod
                     let sl_sub = await dbx.query("select s.staff_no,u.role,u.roles,u.id from staff s left join user u on s.staff_no = u.staff_no where s.staff_no = "+hod);  
                     if(sl_sub.length > 0 && (sl_sub[0].role != null && sl_sub[0].roles != null)){
                        var roles = sl_sub[0].roles.split(',').filter(row => {
                            return (row != '03' && row != '04');
                        });
                        var new_roles = roles.length > 0 ? ('04,'+roles.join(',')) : '04';
                        if(roles.length > 0){
                            await dbx.query("update user set roles = '"+new_roles+"',role = '"+roles[0]+"' where staff_no = "+hod); 
                        }else{
                            await dbx.query("update user set roles = '"+new_roles+"',role = '"+new_roles+"' where staff_no = "+hod); 
                        }
                     }
                }
               
                
                // Insert or Update Units
                if(req.body.id <= 0){  
                    let ins = await dbx.query("insert into unit set ?", req.body); 
                    if(data.parent_id != undefined) {
                        data['parent_id'] = ins.insertId;
                    }
                    if(data.faculty_id != undefined) {
                        data['faculty_id'] = ins.insertId;
                    }
                    if(data.college_id != undefined) {
                        data['college_id'] = ins.insertId;
                    }
                    if(data.dept_id != undefined) {
                        data['dept_id'] = ins.insertId;
                    } 
                    await dbx.query("update unit set ? where id ="+ins.insertId,data);                                
                 
                }else{    
                    if(req.body.id == req.body.parent_id) {
                        req.body.parent_flag = 1;
                    }else{
                        req.body.parent_flag = null;
                    }                                   
                    await dbx.query("update unit set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/units#page'+ref);     
            });


            // Delete Unit
            app.get('/hrm/delunit/:id',isAuthenticated,isAdmin,async(req, res) => {
                let id = req.params.id;let ref = req.query.url;
                await dbx.query("delete from unit where id = "+id);
                res.redirect('/hrm/units/#page'+ref);              
            });  
         




            
              // DESIGNATIONS

             // Fetch Designation
             app.get('/hrm/jobs/',isAuthenticated,isAdmin,async(req,res) => {  
                res.render('index_hr',{
                    view:"job",
                    title: "JOB DESIGNATIONS",
                    user: req.session.user
                });    
             });

              // DOB - JSON
              app.post('/hrm/jobs/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(6);
                columns[0] = 'id';
                columns[1] = 'title';
                columns[2] = 'type';
                columns[3] = 'rank_years';
                columns[4] = 'nostaff';
                columns[5] = 'action';
                
                if(params.search.value != ''){
                    where += " where ";
                    where += " title like '%"+params.search.value.trim()+"%' ";
                    where += " or type like '%"+params.search.value.trim()+"%' ";
                } 
    
                let sql = "select * from job";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += " order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (job) =>{
                    let m = 0;
                    if(m == 0){
                        let count = await dbx.query("select s.* from staff s left join promotion p on s.promo_id = p.id where p.job_id = "+job.id);   
                        job.nostaff = count.length;
                        job.list = '<a class="btn btn-primary btn-sm  btn-icon btn-left" title="View Staff With the Job role" target="_blank" href="/hrm/job/list/'+job.id+'"><i class="icon fa fa-file-text-o "></i></a>';                
                        job.rank_years =  job.rank_years != null ? '<button class="btn btn-default btn-sm  btn-icon btn-left">'+job.rank_years+'</button>' :'';                
                        job.nostaff = '<a class="btn btn-lg" style="font-size:20px; padding:7px 10px;" href="/hrm/job/list/'+job.id+'">'+job.nostaff+'</a><br>';   
                        job.action =  `<div class="btn-group" style="width:200px;margin-left:-50px;">                                                       
                                            <a class="btn btn-default btn-sm" href="/hrm/editjob/${job.id}?url=1" title="Edit Unit" onclick="return confirm('Edit Designation?')"><i class="fa fa-edit"></i></a>
                                            <a class="btn btn-default btn-sm" href="/hrm/deljob/${job.id}?url=1" title="Delete Unit" onclick="return confirm('Delete Designation?')"><i class="fa fa-trash"></i></a>
                                            <a class="btn btn-default btn-sm" href="javascript:;" onclick="var n = prompt('Enter Master Designation ID to Merge with!');if(n != undefined && n != ''){window.location='/hrm/jobmerge/${job.id}?id='+parseInt(n);Alert('Job merged sucessfully!');}else{return false;}" title="Merge Designations">merge</a>
                                        </div>`;   
                    }
                    return job;
                }));
                    
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });


            // Add Designation
            app.get('/hrm/addjob/',isAuthenticated,isAdmin,async(req,res) => {  
               res.render('index_hr',{
                    view:"addjob",
                    title: "ADD DESIGNATION",
                    user: req.session.user,ref:1,
                    row : {id:0}            
                });    
             });
        
        
            // Edit Designation
            app.get('/hrm/editjob/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; let ref = req.query.url;
                 let rows = await dbx.query("select * from job where id = "+id);
                 console.log(rows);
                 res.render('index_hr',{
                     view:"addjob",
                     title: "EDIT DESIGNATION",
                     user: req.session.user,ref,   
                     row: rows[0]            
                 });
             });


             // List Designation
             app.get('/hrm/job/list/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("select j.*,s.staff_no,s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,u.long_name as unitname from job j left join promotion p on j.id = p.job_id left join staff s on s.staff_no = p.staff_no left join unit u on u.id = p.unit_id where j.id = "+id);
                console.log(rows);
                /*
                res.render('index_hr',{
                    view:"joblist",
                    title: rows[0].title,
                    user: req.session.user,   
                    data:rows          
                });*/
                res.render('partials/hr_joblist',{
                    view:'joblist',
                    title:rows[0].title,
                    data: rows,
                    user: req.session.user
                }); 
            });

             // Merge Unit
             app.get('/hrm/jobmerge/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id; let master = req.query.id.trim();
                let rows = await dbx.query("select * from job where id = "+id);
                // Clean all tables with master unit id
                await dbx.query("update staff set job_id = "+master+" where job_id = "+id); // Staff table
                await dbx.query("update promotion set job_id = "+master+" where job_id = "+id); // Promotion table
                // Delete Old Unit ID
                await dbx.query("delete from job where id = "+id);
                // Redirect
                res.redirect('/hrm/jobs#page1'); 
            });

            // Post Unit
            app.post('/hrm/postjob',isAuthenticated,isAdmin,async(req,res)=>{  
                let ref = req.body.ref; delete(req.body.ref);
               
                if(req.body.id <= 0){  
                    let ins = await dbx.query("insert into job set ?", req.body); 
                }else{    
                    await dbx.query("update job set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/jobs#page'+ref);     
            });


            // Delete Unit
            app.get('/hrm/deljob/:id',isAuthenticated,isAdmin,async(req, res) => {
                let id = req.params.id;let ref = req.query.url;
                await dbx.query("delete from job where id = "+id);
                res.redirect('/hrm/jobs/#page'+ref);              
            });  




            // DATE OF BIRTH

            // Fetch DOB
             app.get('/hrm/dobs/',isAuthenticated,isAdmin,async(req,res) => {  
                let dobs = await dbx.query("select id,staff_no,concat(fname,' ',ifnull(mname,''),' ',lname) as name,photo, date_format(dob,'%M %d, %Y') as dob from staff order by staff_no desc"); 
                console.log(dobs);
                res.render('index_hr',{
                    view:"dob",
                    title: "DATES OF BIRTHS",
                    user: req.session.user,
                    dobs            
                });    
             });


            // DOB - JSON
             app.post('/hrm/dobs/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'staff_no';
                columns[1] = 'photo';
                columns[2] = 'name';
                columns[3] = 'status';
                columns[4] = 'age';
                columns[5] = 'snnitdob';
                columns[6] = 'dob';
                columns[7] = 'action';
              
                if(params.search.value != ''){
                    where += " where ";
                    where += " staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                let sql = "select id,staff_no,concat(fname,' ',ifnull(mname,''),' ',lname) as name,ssnit,photo,date_format(dob,'%Y-%m-%d') as age,date_format(dob,'%M %d, %Y') as dob from staff ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    var age = moment().diff(moment(row.age,'YYYY-MM-DD'),'years');
                    var newdob = null;
                    console.log(row.ssnit);
                   
                    if(row.ssnit != null && row.ssnit != '' && row.ssnit.length > 12){
                        newdob = row.ssnit.slice(3,6);
                        console.log(newdob);
                        var yi = newdod.slice(0,2);
                        var mi = newdod.slice(2,2); 
                        var di = newdod.slice(4,2);
                        var doa = moment(`${di}/${mi}/${yi}`,'DD/MM/YY');
                        console.log("SSNIT DOB : ");
                        console.log(doa);
                    }

                    if(m == 0){
                      row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';  
                      row.age = (row.age != null ?  '<a class="btn btn-icon btn-left text-bold" style="font-size:25px;'+(age >= 60 ? 'color:brown' : (age >= 55 && age <= 59 ? 'color:#ffc107' : 'color:seagreen'))+'">'+age+'</a>':'--') ;  
                      row.status = ( row.dob != null  ? 'SET' : 'NONE' );                
                      row.dob = '<a class="btn btn-warning btn-sm  btn-icon btn-left">'+row.dob+'</a>';   
                      row.ssnitdob = '<a class="btn btn-warning btn-sm  btn-icon btn-left">'+(row.ssnit != null && row.ssnit != '' ? (row.ssnit.length < 13 ? '<em>OLD SSNIT ALGO</em>' : doa) : '<em>NO SSNIT</em>')+'</a>';  
                      row.ssnitdob += (row.ssnit != null && row.ssnit != '' ) ? '<small style="font-size:8px;color:brown;">'+row.ssnit+'</small>' : '';
                      row.action = '<div class="group group-xl"><a class="btn btn-default btn-sm" href="/hrm/editdob/'+row.id+'" title="Update Date of Birth" onclick="return confirm(\'Update Date of Birth?\')"><i class="fa fa-edit"></i> update</a></div>';            
                      
                    }
                    return row;
                }));
                    
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });
            
    
            // Edit DOB
            app.get('/hrm/editdob/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; 
                 let rows = await dbx.query("select dob,staff_no,id from staff where id = "+id);
                 rows[0].dob = moment(rows[0].dob).format('YYYY-MM-DD');
                 res.render('index_hr',{
                     view:"adddob",
                     title: "EDIT DATE OF BITH",
                     user: req.session.user, 
                     row: rows[0]            
                 });
             });


            // Post DOB
            app.post('/hrm/postdob',isAuthenticated,isAdmin,async(req,res)=>{  
                let ref = req.body.staff_no; delete(req.body.staff_no);
                if(req.body.id > 0){  
                    await dbx.query("update staff set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/dobs');     
            });





            //## GRADES & NOTCH

            // Fetch Grades
            app.get('/hrm/grades/',isAuthenticated,isAdmin,async(req,res) => {  
                let grades = await dbx.query("select * from scale order by grade asc,notch desc"); 
                console.log(grades);
                res.render('index_hr',{
                    view:"grade",
                    title: "GRADES",
                    user: req.session.user,
                    grades            
                });    
             });


            // GRADE - JSON
             app.post('/hrm/grades/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'id';
                columns[1] = 'photo';
                columns[2] = 'staff_no';
                columns[3] = 'name';
                columns[4] = 'status';
                columns[5] = 'dob';
                columns[6] = 'action';
              
                if(params.search.value != ''){
                    where += " where ";
                    where += " staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                let sql = "select id,staff_no,concat(fname,' ',ifnull(mname,''),' ',lname) as name,photo, date_format(dob,'%M %d, %Y') as dob from staff ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by staff_no desc,"+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                      row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';            
                      row.dob = '<a class="btn btn-warning btn-sm  btn-icon btn-left">'+row.dob+'</a>';            
                      row.status = ( row.dob != null  ? 'SET' : 'NONE' );            
                      row.action = '<div class="group group-xl"><a class="btn btn-default btn-sm" href="/hrm/editdob/'+row.id+'" title="Update Date of Birth" onclick="return confirm(\'Update Date of Birth?\')"><i class="fa fa-edit"></i> update</a></div>';            
                    }
                    return row;
                }));
                    
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });
            
    
            // Add GRADE
            app.get('/hrm/addgrade',isAuthenticated,isAdmin,async(req,res) => { 
                res.render('index_hr',{
                    view:"addgrade",
                    title: "",
                    user: req.session.user, 
                    row: {id:0}            
                });
            });



            // Edit GRADE
            app.get('/hrm/editgrade/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; 
                 let rows = await dbx.query("select * from scale where id = "+id);
                 rows[0].dob = moment(rows[0].dob).format('YYYY-MM-DD');
                 res.render('index_hr',{
                     view:"addgrade",
                     title: "",
                     user: req.session.user, 
                     row: rows[0]            
                 });
             });


            // Post GRADE
            app.post('/hrm/postgrade',isAuthenticated,isAdmin,async(req,res)=>{  
                if(req.body.id <= 0){  
                    let ins = await dbx.query("insert into scale set ?", req.body); 
                }else{    
                    let ins = await dbx.query("update scale set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/grades');     
            });


            // List Staff With Grade-Notch
            app.get('/hrm/grade/list/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id;
                let title = await dbx.query("select * from scale where id = "+id); 
                let rows = await dbx.query("select j.*,s.staff_no,s.photo,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name from staff s left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id left join scale u on u.id = p.scale_id where p.scale_id = "+id);
                console.log(rows);
                res.render('index_hr',{
                    view:"gradelist",
                    title: 'STAFF ON GRADE '+title[0].grade+', NOTCH '+title[0].notch,
                    user: req.session.user,   
                    data:rows          
                });
            });




            //## VEHICLE - MAINTENANCE

            // Fetch Vehicle
            app.get('/hrm/vehicles/',isAuthenticated,isAdmin,async(req,res) => {  
                let current = await dbx.query("select v.*,date_format(reg_date,'%M %d, %Y') as reg_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner from vehicle v left join staff s on v.staff_no = s.staff_no where v.active = '1' order by v.reg_date asc"); 
                let history = await dbx.query("select v.*,date_format(reg_date,'%M %d, %Y') as reg_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner from vehicle v left join staff s on v.staff_no = s.staff_no where v.active = '0' and v.owner_changed = '1' order by v.reg_date asc"); 
                console.log(current);
                console.log(history);
                res.render('index_hr',{
                    view:"vehicle",
                    title: "VEHICLES & MAINTENANCE",
                    user: req.session.user,
                    current,history            
                });    
             });


            // GRADE - JSON
             app.post('/hrm/vehicles/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'id';
                columns[1] = 'photo';
                columns[2] = 'staff_no';
                columns[3] = 'name';
                columns[4] = 'status';
                columns[5] = 'dob';
                columns[6] = 'action';
              
                if(params.search.value != ''){
                    where += " where ";
                    where += " staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                let sql = "select id,staff_no,concat(fname,' ',ifnull(mname,''),' ',lname) as name,photo, date_format(dob,'%M %d, %Y') as dob from staff ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by staff_no desc,"+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                      row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';            
                      row.dob = '<a class="btn btn-warning btn-sm  btn-icon btn-left">'+row.dob+'</a>';            
                      row.status = ( row.dob != null  ? 'SET' : 'NONE' );            
                      row.action = '<div class="group group-xl"><a class="btn btn-default btn-sm" href="/hrm/editdob/'+row.id+'" title="Update Date of Birth" onclick="return confirm(\'Update Date of Birth?\')"><i class="fa fa-edit"></i> update</a></div>';            
                    }
                    return row;
                }));
                    
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });
            
    
            // Add Vehicle
            app.get('/hrm/addvehicle',isAuthenticated,isAdmin,async(req,res) => { 
                res.render('index_hr',{
                    view:"addvehicle",
                    title: "",
                    user: req.session.user, 
                    row: {id:0}            
                });
            });



            // Edit Vehicle
            app.get('/hrm/editvehicle/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; 
                 let rows = await dbx.query("select * from vehicle where id = "+id);
                 rows[0].reg_date = moment(rows[0].reg_date).format('YYYY-MM-DD');
                 res.render('index_hr',{
                     view:"addvehicle",
                     title: "",
                     user: req.session.user, 
                     row: rows[0]            
                 });
             });


            // Delete Vehicle
            app.get('/hrm/delvehicle/:id',isAuthenticated,isAdmin,async(req, res) => {
                let id = req.params.id;
                await dbx.query("delete from vehicle where id = "+id);
                res.redirect('/hrm/vehicles');              
            }); 
            

            // Change Vehicle Owner 
            app.get('/hrm/vehicle/changeowner/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let oldstaff = req.params.id; let newstaff = req.query.new.trim();
                let rows = await dbx.query("select * from vehicle where staff_no =  "+oldstaff+" and active = '1'");
                // Insert New Owner
                let body = rows[0];
                    body.new = newstaff;
                    body.old = oldstaff;
                    body.staff_no = newstaff;
                    body.reg_date = moment().format('YYYY-MM-DD');
                    body.active = '1';
                    body.id = 0;
                let ins = await dbx.query("insert into vehicle set ?",body);
                await dbx.query("update vehicle set owner_changed = '1',active = '0' where staff_no = "+oldstaff+" and active = '1'");

                // Redirect
                res.redirect('/hrm/editvehicle/'+ins.insertId); 
            });

            // List Staff on Vehicle Allowance
            app.get('/hrm/vehicle/alist',isAuthenticated,isAdmin,async(req,res) => { 
                let rows = await dbx.query("select v.*,date_format(reg_date,'%M %d, %Y') as reg_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,s.photo,u.long_name as unitname from vehicle v left join staff s on v.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id where v.active = '1' order by v.reg_date asc"); 
                console.log(rows);
                res.render('index_hr',{
                    view:"vehicalist",
                    title: 'VEHICLES ON ALLOWANCE',
                    user: req.session.user,   
                    data:rows          
                });
            });

            // List Staff Off- Vehicle Allowance
            app.get('/hrm/vehicle/nlist',isAuthenticated,isAdmin,async(req,res) => { 
                let rows = await dbx.query("select v.*,date_format(reg_date,'%M %d, %Y') as reg_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,s.photo,u.long_name as unitname from vehicle v left join staff s on v.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id where v.active = '0' and v.owner_changed = '1' order by v.reg_date asc"); 
                console.log(rows);
                res.render('index_hr',{
                    view:"vehicalist",
                    title: 'VEHICLES OFF-ALLOWANCE',
                    user: req.session.user,   
                    data:rows          
                });
            });

            // Post Vehicle
            app.post('/hrm/postvehicle',isAuthenticated,isAdmin,async(req,res)=>{  
                if(req.body.id <= 0){  
                    req.body.active = '1';
                    let ins = await dbx.query("insert into vehicle set ?", req.body); 
                }else{    
                    let ins = await dbx.query("update vehicle set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/vehicles');     
            });





            //## CONFIRMATIONS

            // Fetch Confirmation
            app.get('/hrm/confirm/',isAuthenticated,isAdmin,async(req,res) => {  
                //let current = await dbx.query("select s.*,date_format(appoint_date,'%M %d, %Y') as appoint_date,date_format(confirm_date,'%M %d, %Y') as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,j.title as jobtitle, u.long_name as unitname from staff s left join unit u on s.unit_id = u.id left join job j on j.id = s.job_id where s.appoint_date IS NOT NULL and s.confirm_date IS NOT NULL order by s.confirm_date desc"); 
                let upcome = await dbx.query("select s.*,date_format(appoint_date,'%M %d, %Y') as appoint_date,date_format(confirm_date,'%M %d, %Y') as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,j.title as jobtitle, u.long_name as unitname from staff s left join unit u on s.unit_id = u.id left join job j on j.id = s.job_id where s.appoint_date IS NOT NULL and s.confirm_date IS NULL and (CURDATE() <= DATE_ADD(appoint_date, INTERVAL (ifnull(probation,1)) YEAR))  order by s.appoint_date desc;"); 
                upcome = upcome.map(r => {
                     let dn = moment(r.appoint_date).add(1,'year');
                     r.days = dn.diff(moment(),'days');
                     return r;
                })
               // console.log(current);
                console.log(upcome);
                res.render('index_hr',{
                    view:"confirm",
                    title: "CONFIRMATIONS",
                    user: req.session.user,
                    upcome            
                });    
             });


            // Confirmation - GSON
             app.post('/hrm/confirm/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(7);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'jobtitle';
                columns[3] = 'appoint_date';
                columns[4] = 'probation';
                columns[5] = 'staff_group';
                columns[6] = 'status';
              
                if(params.search.value != ''){
                    where += " and ( p.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%') ";
                  // where += " or DATE(p.appoint_date) like DATE('%"+params.search.value.trim()+"%')) ";
                   
                    //where += " or mname like '%"+params.search.value.trim()+"%' ";
                    //where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                //let sql = "select s.*,date_format(appoint_date,'%M %d, %Y') as appoint_date,date_format(confirm_date,'%M %d, %Y') as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,j.title as jobtitle, u.long_name as unitname from staff s left join unit u on s.unit_id = u.id left join job j on j.id = s.job_id where s.appoint_date IS NOT NULL and s.confirm_date IS NOT NULL ";
                let sql = "select p.*,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as owner,upper(date_format(p.appoint_date,'%M %d, %Y')) as appoint_date,upper(date_format(p.confirm_date,'%M %d, %Y')) as confirm_date,j.title as jobtitle from staff s left join promotion p on p.id = s.promo_id left join job j on j.id = s.job_id where (p.apply_type = 'APPOINTMENT' and p.apply_type IS NOT NULL and p.appoint_date IS NOT NULL and p.confirm_date IS NULL) and (s.staff_status = 'PERMANENT' or s.staff_status = 'TEMPORAL' or s.staff_status = 'CONTRACT')  ";
                
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by p.appoint_date desc limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                      const end = moment(row.appoint_date).add(row.probation,'years');
                      row.pro_days = row.appoint_date != null ? end.diff(moment(),'days') : 0;
                      row.confirm_date = row.confirm_date != null ? '<div class="group group-xl"><a class="btn btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.confirm_date+'</a></div>' : '';            
                      row.appoint_date = row.appoint_date != null ? '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.appoint_date+'</a></div>' :'';            
                      row.staff_group = row.staff_group == 'SM'? 'SENIOR MEMBER (SM)' : (row.staff_group == 'JS' ? 'JUNIOR STAFF (JS)':'SENIOR STAFF (SS)'); 
                      row.staff_no = `<button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>${row.staff_no}</b></button>`;
                      row.probation = `<button class="btn btn-sm"><i class="fa fa-calendar fa-sm"></i> <b>${row.probation != null ? row.probation : 'no'} yr(s)</b></button>`;
                      row.status = row.probation != null ? (row.pro_days > 0 ? '<span class="alert alert-warning pull-center" style="display:inline-block;font-size:10px;color:#000;font-weight:bold;">'+row.pro_days+' days to confirmation</span>':'<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;"><b>Confirmation is due!</b></span><a href="/hrm/appoint/edit/'+row.id+'" class="btn btn-sm btn-warning pull-left"><i class="fa fa-edit"></i></a>') : '';                                     
                    }
                    return row;
                }));   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });  
            });


             // Confirm Staff
             app.get('/hrm/editconfirm/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id; 
                let rows = await dbx.query("select * from staff where id = "+id);
                res.render('index_hr',{
                    view:"addconfirm",
                    title: "",
                    user: req.session.user, 
                    row: rows[0]            
                });
            });
            
    
            // NOTIFY Staff on Confirmation
            app.get('/hrm/notifyconfirm/:id',isAuthenticated,isAdmin,async(req,res) => { 
                 let id = req.params.id; 
                 let rows = await dbx.query("select * from staff where staff_no = "+id);
                 let dn = moment(rows[0].appoint_date).add((rows[0].probation != null ? rows[0].probation : 1),'year');
                 let days = dn.diff(moment(),'days');
                 //rows[0].dob = moment(rows[0].dob).format('YYYY-MM-DD');
                 let output = `
                 <!DOCTYPE>
                 <html lang="en">
                 <head>
                     <title>STAFF | ${rows[0].staff_no}</title>
                     <link href="http://www.allfont.de/allfont.css?fonts=arial-narrow" rel="stylesheet" type="text/css" />
                     <style type="text/css" >
                           body{
                             background-color:#eee;              
                           }
                 
                           .cover{
                               width: 90%;             
                               margin: 10px auto;  
                               box-shadow:2px 2px 4px #999;
                               padding:10px 17px; 
                               background:#fff;           
                           }
                 
                           .title{
                               text-align: center;
                               font-size:32px;
                               color: rgb(8, 8, 148); 
                           }
                 
                           .subtitle{
                               font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                               font-weight:bolder;
                               text-align: center;
                               font-size:25px;
                               word-spacing:0.5em;
                               color: red;
                               font-style:italic;
                               margin-top:-20px;
                           }
                 
                           .subnote{
                              display: flex;
                              width:100%;
                              justify-content:space-between;
                              align-items: center;
                              height:80px; 
                              clear:both;            
                           }
                 
                           .cover_adds{
                               display:block;
                               font-size:12px;
                               color:rgb(8, 8, 148); 
                               line-height:18px;           
                           }
                 
                          .ucc_title{
                               display:block;
                               text-align:right; 
                               font-size:18px;
                               line-height:25px;
                               word-spacing:0.35em;
                               font-weight:bold;                         
                           }
                           .ucc_logo{
                               display:block;
                               height: 80px;  
                               width: 90px;                 
                           }
                 
                           content{
                               font-family:'Arial Narrow', Arial, sans-serif;
                               font-size: 17px;
                               display:block;
                               padding-top: 50px;
                           }
                 
                           address{
                               font-style:normal;
                           }
                 
                           .signatory{
                               width:200px;
                               height:130px;
                               background-image:url(cid:ucclogo);
                               background-repeat: no-repeat;             
                               background-position: 0% 0%;
                               background-size: 200px 65px;
                               position: relative;
                           }
                 
                           .signer{
                               position:absolute;
                               left:0;
                               bottom:0;
                           }
                 
                           .salute{
                               margin-top:20px;
                           }
                 
                           .ref{
                               margin-bottom:20px;
                           }
                 
                           .end{
                               position:relative;              
                           }
                 
                           .copies{
                               position: absolute;
                               right:25%;
                               top: 0;
                           }
                 
                           footer{
                               margin:80px 0 10px;
                               font-size:10px;
                               font-family:cursive;
                               font-style:italic;
                           }
                 
                           .heading{
                               text-align:center;
                               background:#b80924;
                               color:#fff;
                               padding:10px 5px 10px 60px;
                               text-indent: 80px;
                           }
                 
                           .table{
                               border-collapse: collapse;
                               width: 100%;
                               border:2px solid #ccc;
                               padding: 20px;
                               vertical-align:middle;
                               text-algn:center;
                               background:#f1f2f3;
                           }
                 
                           .table tr{
                               border-bottom: thin solid #000;             
                           }
                 
                           .table td{
                               border-right: thin solid #000;
                               padding: 10px;            
                           }
                 
                           .certv{
                               text-align:center;
                           }
                 
                           .vbtn{
                               padding:5px;
                               margin-top:-20px;
                               text-decoration:none;
                               font-size:10px;
                               background-color:green;
                               color:#fff;
                               position:relative;
                               top:-10px;
                               border-radius:10px;
                           }
                 
                           .sbody{
                               font-weight:600;
                               font-size:15px;
                               display:inline-block;
                           }
                 
                           .file_photo{
                               display:block;
                               height:120px;
                               right:0;
                               float:right;
                               margin:-25px 15px 10px 0;
                               padding:2px;
                               border:3px solid #b80924;
                               border-radius:10px;
                               background-color:#f1f2f3;
                           }
                 
                           .marital{
                               padding:5px;
                               margin-top:-20px;             
                               font-size:15px;
                               font-weight:bolder;
                               background-color:#b80924;
                               text-decoration:none;
                               color:#fff;
                               position:relative;
                               top:1px;              
                           }
                 
                          .staff_no{
                               padding:5px 10px;
                               margin:5px 10px;
                               font-size:23px;
                               font-weight:bolder;
                               background-color:#0d2d62;
                               text-decoration:none;
                               color:#fff;      
                           }
                 
                 
                           @media print {
                               body{
                                   background:none;
                               }
                 
                               .cover{
                                   padding:0;
                                   background:none;
                                   box-shadow:none;
                               }
                 
                               .vbtn{
                                   display:none;
                               }
                           }
                 
                     </style>
                 </head>
                 <body>
                     <div class="cover">
                           <header>
                               <h1 class="title">UNIVERSITY OF CAPE COAST</h1>
                               <h2 class="subtitle">DIRECTORATE OF HUMAN RESOURCE</h2>
                               <div class="subnote">
                                     <div class="cover_adds">
                                         <dl class="note">
                                             <dt>Cellphone:  <div style="display:inline-block;vertical-align:top;font-weight:bold;">+233-3321-32480/3 Exts.: 223/225/205<br>233-3321-32484/5</div></dt>
                                             <dt>E-mail:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">dhr.enquiries@ucc.edu.gh</div></dt>
                                             <dt>Website:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">www.ucc.edu.gh</div></dt>                   
                                         </dl>                       
                                     </div>
                                    <div> <img src="cid:ucclogo" alt="UCC LOGO" class="ucc_logo"/></div>
                                    <div> 
                                            <address class="ucc_title">
                                                    UNIVERSITY POST OFFICE<br/>
                                                    CAPE COAST, GHANA
                                            </address>
                                    </div>
                               </div>
                           </header>  
                           <content>
                               <img src="cid:staffpic" class="file_photo"/>
                               ${(days > 0 && rows[0].confirm_date == null) ? ' <h2 class="heading"><span class="staff_no"> CONFIRMATION ALERT </span> ${days} DAYS TO CONFIRMATION OF APPOINTMENT</h2>':'<h2 class="heading"><span class="staff_no"> CONFIRMATION ALERT </span> ${rows[0].fname} ${rows[0].lname}, YOU ARE NOW FULLY CONFIRMED AS STAFF OF UCC!</h2>'}
                               <!--<h2 class="heading"><span class="staff_no"> CONFIRMATION ALERT </span> ${days} DAYS TO CONFIRMATION OF APPOINTMENT</h2>              
                               <div class="content">
                                     <table class="table"><tr><td><p style="font-size:18px"><b>DEAR <em>${rows[0].fname+' '+rows[0].mname+' '+rows[0].lname}</em>, PLEASE TAKE NOTICE THAT YOUR CONFIRMATION OF APPOINTMENT IN THE UNIVERSITY SHALL BE IN <span class="staff_no">${days}</span> DAYS.</b><p></td></tr></table>
                               </div>-->
                           </content>
                           <footer>
                               <span>All rights reserved HRMS, &copy; ${new Date().getFullYear()} MIS-DICTS, University of Cape Coast </span>
                           </footer>   
                     </div>
                 </body>
                 </html>
                 `;
                 
                 let data = {
                    sender: 'hrms-noreply@ucc.edu.gh',
                    to: (rows[0].ucc_mail != null ? rows[0].ucc_mail : 'ebenezer.ackah@ucc.edu.gh'),
                    subject: 'HRMS CONFIRMATION - TEST',
                    text: 'Test Mail',
                    html: output,
                    attachments: [{
                        filename: 'logo-170x172.png',
                        path: './public/images/logo-170x172.png',
                        cid: 'ucclogo' //same cid value as in the html img src
                    },
                    {
                        filename: (rows[0].photo != null ? '.'+rows[0].staff_no+'.jpg' : 'none.png'),
                        path: (rows[0].photo != null ? '.'+rows[0].photo : './public/images/none.png'),
                        cid: 'staffpic' //same cid value as in the html img src
                    }
                   ]
                 };
                    mail.sendMail(data,(err,info)=>{
                            if(err) console.log(err);
                            console.log(info);
                    });
                    res.redirect('/hrm/confirm#page2');
             });


            // List of Confirmation Upcoming
            app.get('/hrm/confirm/alist',isAuthenticated,isAdmin,async(req,res) => { 
                let rows = await dbx.query("select v.*,date_format(reg_date,'%M %d, %Y') as reg_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,s.photo,u.long_name as unitname from vehicle v left join staff s on v.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id where v.active = '1' order by v.reg_date asc"); 
                console.log(rows);
                res.render('index_hr',{
                    view:"vehicalist",
                    title: 'VEHICLES ON ALLOWANCE',
                    user: req.session.user,   
                    data:rows          
                });
            });


            // Post Confirmation Form
            app.post('/hrm/postconfirm',isAuthenticated,isAdmin,async(req,res)=>{  
                if(req.body.id > 0){  
                    let ins = await dbx.query("update staff set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/confirm#page2');     
            });







             //## PROMOTIONS

            // Fetch Promotions
            app.get('/hrm/promo/',isAuthenticated,isAdmin,async(req,res) => {  
                //let ss = await dbx.query("select s.*,date_format(appoint_date,'%M %d, %Y') as appoint_date,date_format(confirm_date,'%M %d, %Y') as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner,j.title as jobtitle, u.long_name as unitname from staff s left join unit u on s.unit_id = u.id left join job j on j.id = s.job_id where s.appoint_date IS NOT NULL and s.confirm_date IS NOT NULL order by s.confirm_date desc"); 
                let sm = await dbx.query("select p.*,j.type,s.staff_group,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner from promotion p left join staff s on s.staff_no = p.staff_no left join job j on p.job_id = j.id where s.staff_group = 'SM' "); 
                sm = await Promise.all(sm.map(async r => {
                     let renew = await dbx.query("select * from renewal where promo_id = "+r.id+" order id desc");
                     r.renew_no = renew.length;
                     if(renew.length > 0){
                        r.renew_date = moment(renew[0].start_date).add((renew[0].renewal_period != null ? renew[0].renewal_period : 4),'year').format('DD-MM-YYYY');
                        //r.renew_date = dn.diff(moment(),'days');
                     }else{
                         if(r.staff_group == 'SS' || r.staff_group == 'JS'){
                            r.renew_date = moment(r[0].appoint_date).add(1,'year');
                         }else if(r.staff_group == 'SM' && r.type == 'NON-ACADEMIC' ){
                            r.renew_date = moment(r[0].appoint_date).add(4,'year');
                         }else if(r.staff_group == 'SM' && r.type == 'ACADEMIC' && r.jid == '5239'){
                            r.renew_date = moment(r[0].appoint_date).add(5,'year');
                         }else if(r.staff_group == 'SM' && r.type == 'ACADEMIC' && r.jid == '5205'){
                            r.renew_date = moment(r[0].appoint_date).add((r.staff_group != '' ? rows[0].probation : 1),'year');
                         }
                        
                     }
                     
                     return r;
                }))
               // console.log(current);
                console.log(sm);
                res.render('index_hr',{
                    view:"promo",
                    title: "PROMOTIONS",
                    user: req.session.user,
                    sm            
                });    
             });


            // Promotion - GSON
             app.post('/hrm/promo/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'jobtitle';
                columns[3] = 'unitname';
                columns[4] = 'confirm_date';
                columns[5] = 'appoint_date';
                columns[6] = 'staff_group';
              
                if(params.search.value != ''){
                    where += " and ( staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or staff_group like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value.trim()+"%' ";
                    where += " or appoint_date like '%"+params.search.value.trim()+"%')";
                   
                    //where += " or mname like '%"+params.search.value.trim()+"%' ";
                    //where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                let sql = "select s.*,date_format(appoint_date,'%M %d, %Y') as appoint_date,date_format(confirm_date,'%M %d, %Y') as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as `owner`,j.title as jobtitle, u.long_name as unitname from staff s left join unit u on s.unit_id = u.id left join job j on j.id = s.job_id where s.appoint_date IS NOT NULL and s.confirm_date IS NOT NULL ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by s.confirm_date desc limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                      row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';            
                      row.confirm_date = '<div class="group group-xl"><a class="btn btn-warning btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.confirm_date+'</a></div>';            
                      row.appoint_date = '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.appoint_date+'</a></div>';            
                      row.staff_group = row.staff_group == 'SM'? 'SENIOR MEMBER (SM)' : (row.staff_group == 'JS' ? 'JUNIOR STAFF (JS)':'SENIOR STAFF (SS)'); 
                    }
                    return row;
                }));   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });  
            });


            /* PROMOTION REQUESTS */

            // Fetch Promotions
            app.get('/hrm/promoreq/',isAuthenticated,isAdmin,async(req,res) => {  
                res.render('index_hr',{
                    view:"promoreq",
                    title: "PROMOTION REQUESTS",
                    user: req.session.user,
                       
                });    
             });


            // Promotion current request - GSON
             app.post('/hrm/promoreq/current/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(7);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'jobtitle';
                columns[3] = 'unitname';
                columns[4] = 'status';
                columns[5] = 'date';
                columns[6] = 'action';
              
              
                if(params.search.value != ''){
                    where += " and ( staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or staff_group like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value.trim()+"%' ";
                    where += " or hr_date like '%"+params.search.value.trim()+"%')";
                   
                    //where += " or mname like '%"+params.search.value.trim()+"%' ";
                    //where += " or lname like '%"+params.search.value.trim()+"%' ";
                    //where += " or "+params.search.value.trim()+" like dob";
                } 
    
                let sql = "select r.id,s.staff_no,p.staff_group,s.photo,s.staff_no as nox,date_format(hr_date,'%M %d, %Y') as date,date_format(apply_date,'%M %d, %Y') as apply_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as `owner`,j.title as jobtitle, u.long_name as unitname,v.data as status,form_attachment,paper_attachment,report_attachment from promotion_request r left join staff s on r.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id left join job j on j.id = p.job_id left join hr_variable v on r.hr_status = v.id where (r.hr_status <> '08' and r.hr_status <> '11') ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by r.hr_date desc limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                        var form = await docfinder(row.form_attachment);
                        var paper = await docfinder(row.paper_attachment);
                        var report = await docfinder(row.report_attachment);
                        row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.staff_no += '<center><h6 style="color:brown">'+row.nox+'</h6></center>';
                        row.action = `<div class="btn-group" style="width:205px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/promoreq/stats/${row.id}" title="View Request"><i class="fa fa-file-text-o"></i></a><a class="btn btn-sm btn-warning" target="_blank" href="/hrm/promoreq/track/${row.id}" title="Request tracking"><i class="fa fa-minus-square"></i></a><a class="btn btn-default btn-sm" href="/hrm/editpromoreq/${row.id}" title="Update Request"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Request" href="/hrm/delpromoreq/${row.id}" onclick="return confirm(\'Delete Request?\');"><i class="fa fa-trash"></i></a></div>`;            
                        row.jobtitle = `<button class="btn btn-sm"><b><small>${row.jobtitle} <em>(${row.staff_group})</em></small></b></button>`; 
                        row.owner = `<small style="font-size:11px;font-weight:bolder">${row.owner}</small>`;
                        row.unitname = `<small style="font-size:11px;;font-weight:bolder">${row.unitname}</small>`;
                        row.status = `<button class="btn btn-sm"><b><small style="font-size:11px;color:darkred">${row.status}</small></b></button>`; 
                        row.date = `<button class="btn btn-sm"><b><small style="font-size:11px;">${row.date.toUpperCase()}</small></b></button>`; 
                        row.action += `<div class="btn-group" style="width:300px;margin-left:-50px;margin-top:5px;font-size:8px;text-align:center">
                               ${form  != null ? '<a class="btn btn-sm" target="_blank" href="'+form+'" title="View Request" style="font-size:9px;">FORM</a>':''}
                               ${form  != null ? '<a class="btn btn-sm" target="_blank" href="'+report+'" title="View Request" style="font-size:9px;">REPORTS</a>':''}
                               ${form  != null ? '<a class="btn btn-sm" target="_blank" href="'+paper+'" title="View Request" style="font-size:9px;">PAPERS</a>':''}
                              </div>`;            
                        
                       
                    }
                    return row;
                }));   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });  
            });


            
        // Add New Promotion Request
        app.get('/hrm/addpromoreq',isAuthenticated,isAdmin,async(req,res) => {  
            let vars = await dbx.query("select * from hr_variable");
            res.render('index_hr',{
                view:"addpromoreq",
                title:"ADD PROMOTION REQUEST",
                row: { id: 0},
                user: req.session.user,vars               
            });            
         });
 
             // Edit Promotion Request
        app.get('/hrm/editpromoreq/:id',isAuthenticated,isAdmin,async(req,res) => { 
            let id = req.params.id;
            let vars = await dbx.query("select * from hr_variable");
            let rows = await dbx.query("select d.*, date_format(hr_date,'%Y-%m-%d') as hr_date,v.path as paperpath,w.path as formpath,x.path as reportpath from promotion_request d left join doc v on d.paper_attachment = v.id left join doc w on d.form_attachment = w.id left join doc x on d.report_attachment = x.id where d.id = "+id);
            let papers = await dbx.query("select * from paper where staff_no = "+rows[0].staff_no+" and `valid` = '1'");
            
            res.render('index_hr',{
                view:"addpromoreq",
                title: "EDIT PROMOTION REQUEST",
                user: req.session.user,
                row: rows[0],vars,papers
            });
        });
 
 
        // Delete Promotion Request 
        app.get('/hrm/delpromoreq/:id',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from promotion_request where id = "+id);
            res.redirect('/hrm/promoreq');              
        });  
        
        
        // Post Promotion Data
        app.post('/hrm/postpromoreq',isAuthenticated,isAdmin,doc,async(req,res)=>{ 
            req.body.paper_attachment == ''? delete req.body.paper_attachment : '';
            req.body.report_attachment == ''? delete req.body.report_attachment : '';
            req.body.form_attachment == ''? delete req.body.form_attachment : '';
            const sid = req.body.sid; delete req.body.sid;
            const track = req.body.track; delete req.body.track;
            if(req.body.papers){
                req.body.papers = req.body.papers.length > 1 ? req.body.papers.join(',') : req.body.papers;
            }

            if(req.files.paper_attachment){
                 const time = new Date();
                 const filename = 'PAPERS_'+req.body.staff_no+'_'+(time.getFullYear()+'.'+time.getMonth()+'.'+time.getDate()+'.'+time.getHours()+'.'+time.getMinutes())+'.pdf';
                 const docfilepath = './public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const docdbpath = '/public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const folder = './public/docs/staff/'+req.body.staff_no;
                 if(!fs.existsSync(folder)){
                    fs.mkdirSync(folder);
                 }
                 moveFile(req.files.paper_attachment[0].path,docfilepath);      
                 // Save into Document table
                 let docinfo = {title:'COMBINED PAPERS OF STAFF : '+req.body.staff_no+' ON '+(time.getFullYear()+'-'+time.getMonth()+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()),path:docdbpath, staff_no:req.body.staff_no, active:'1'}
                 let docins = await dbx.query("insert into doc set ?",docinfo);
                 req.body.paper_attachment = docins.insertId;
            }
            if(req.files.form_attachment){
                 const time = new Date();
                 const filename = 'PROMO-FORM_'+req.body.staff_no+'_'+(time.getFullYear()+'.'+time.getMonth()+'.'+time.getDate()+'.'+time.getHours()+'.'+time.getMinutes())+'.pdf';
                 const docfilepath = './public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const docdbpath = '/public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const folder = './public/docs/staff/'+req.body.staff_no;
                 if(!fs.existsSync(folder)){
                    fs.mkdirSync(folder);
                 }
                 moveFile(req.files.form_attachment[0].path,docfilepath);      
                 // Save into Document table
                 let docinfo = {title:'PROMOTION FORM OF STAFF : '+req.body.staff_no+' ON '+(time.getFullYear()+'-'+time.getMonth()+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()),path:docdbpath, staff_no:req.body.staff_no, active:'1'}
                 let docins = await dbx.query("insert into doc set ?",docinfo);
                 req.body.form_attachment = docins.insertId;
            }
            if(req.files.report_attachment){
                 const time = new Date();
                 const filename = 'PROMO-REPORTS_'+req.body.staff_no+'_'+(time.getFullYear()+'.'+time.getMonth()+'.'+time.getDate()+'.'+time.getHours()+'.'+time.getMinutes())+'.pdf';
                 const docfilepath = './public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const docdbpath = '/public/docs/staff/'+req.body.staff_no+'/'+filename;
                 const folder = './public/docs/staff/'+req.body.staff_no;
                 if(!fs.existsSync(folder)){
                    fs.mkdirSync(folder);
                 }
                 moveFile(req.files.report_attachment[0].path,docfilepath);      
                 // Save into Document table
                 let docinfo = {title:'PROMOTION REPORTS OF STAFF : '+req.body.staff_no+' ON '+(time.getFullYear()+'-'+time.getMonth()+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()),path:docdbpath, staff_no:req.body.staff_no, active:'1'}
                 let docins = await dbx.query("insert into doc set ?",docinfo);
                 req.body.report_attachment = docins.insertId;
            } 

            if(req.body.id <= 0){  
                 req.body.hr_date = moment(new Date()).format('YYYY-MM-DD');
                 req.body.hr_track = req.body.hr_status+':'+req.body.hr_date;
                let ins = await dbx.query("insert into promotion_request set ?", req.body); 
            }else{  
                req.body.hr_track = sid != req.body.hr_status ? req.body.hr_status+':'+req.body.hr_date+(track != '0' ? ','+track:'') : track;
                let ins = await dbx.query("update promotion_request set ? where id = "+req.body.id,req.body);
            }

            // NOTIFICATION CHECK
            if(sid == 0 || (sid != 0 && (sid != req.body.hr_status))){
                 let ss = await dbx.query("select *,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name from staff where staff_no = "+req.body.staff_no);
                 let se = await dbx.query("select * from hr_variable where id = '"+req.body.hr_status+"'");
                 const msg = "PROMOTION APPLICATION STATUS CHANGED TO : "+se[0].data;
                 const title = "PROMOTION STATUS CHANGED";
                 //Send SMS
                  sms(ss[0].phone,msg);
                 //Send Mail
                  mailer(ss[0].ucc_mail,ss[0].name,title,msg)
                 //Send Notificatation
                 let note = {type:'SYSTEM',staff_no:req.body.staff_no, title,message:msg, datetime:new Date()};
                 let ins_m = await dbx.query("insert into notification set ?",note);

            }
            res.redirect('/hrm/promoreq');                
        });
 
 
         // Promotion Request Statistics
         app.get('/hrm/promoreq/stats/:id',isAuthenticated,async(req,res) => {          
             var id = req.params.id;        
             var rows = await dbx.query("select d.*,s.staff_no,p.staff_group,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,g.data as status,s.photo,s.staff_no as nox,date_format(hr_date,'%M %d, %Y') as date,j.title as jobtitle,u.long_name as unitname,v.path as paperpath,w.path as formpath,x.path as reportpath from promotion_request d left join staff s on d.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id left join job j on j.id = p.job_id left join hr_variable g on d.hr_status = g.id left join doc v on d.paper_attachment = v.id left join doc w on d.form_attachment = w.id left join doc x on d.report_attachment = x.id where d.id = "+id);
             let papers = await dbx.query("select * from paper where staff_no = "+rows[0].staff_no+" and `valid` = '1'");
               
                 if(rows.length > 0){  
                     res.render('partials/hr_promoreqstat',{
                         view:'promoreqstat',
                         title:'PROMOTION STATISTICS',
                         data: rows[0],
                         user: req.session.user,papers
                     }); 
                 }else{
                     res.redirect('/hrm/promoreq');
                 }              
         });
 
 
          //  All Promotion Requests Stats
          app.get('/hrm/promoreq/list/:staff',isAuthenticated,async(req,res) => {          
             var staff = req.params.staff;        
             var rows = await dbx.query("select r.id,s.staff_no,p.staff_group,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.photo,s.staff_no as nox,date_format(hr_date,'%M %d, %Y') as date,date_format(apply_date,'%M %d, %Y') as apply_date,j.title as jobtitle, u.long_name as unitname,v.data as status from promotion_request r left join staff s on r.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id left join job j on j.id = p.job_id left join hr_variable v on r.hr_status = v.id where r.staff_no = "+staff);
                 if(rows.length > 0){  
                     res.render('partials/hr_promoreqlist',{
                         view:'promoreqlist',
                         title:'PROMOTION REQUESTS',
                         data: rows,
                         user: req.session.user
                     }); 
                 }else{
                     res.redirect('/hrm/promoreq');
                 }              
         });



          // Promotion Request Tracking
          app.get('/hrm/promoreq/track/:id',isAuthenticated,async(req,res) => {          
            var id = req.params.id;        
            var row = await dbx.query("select d.*,s.staff_no,p.staff_group,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,g.data as status,s.photo,s.staff_no as nox,date_format(hr_date,'%M %d, %Y') as date,j.title as jobtitle,u.long_name as unitname,v.path as paperpath,w.path as formpath,x.path as reportpath from promotion_request d left join staff s on d.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join unit u on p.unit_id = u.id left join job j on j.id = p.job_id left join hr_variable g on d.hr_status = g.id left join doc v on d.paper_attachment = v.id left join doc w on d.form_attachment = w.id left join doc x on d.report_attachment = x.id where d.id = "+id);
            
            let tracks = row[0].hr_track.split(',');
            let datas = await Promise.all(tracks.map(async tr =>{
                 let status = tr.split(':');
                 let b = await dbx.query("select * from hr_variable where id ='"+status[0]+"'");
                 return {date: status[1], action: b[0].data}
            }))
            if(row.length > 0){  
                res.render('partials/hr_promoreqtrack',{
                    view:'promoreqtrack',
                    title:'PROMOTION REQUEST TRACKING',
                    data: row[0],datas,
                    user: req.session.user
                }); 
            }else{
                res.redirect('/hrm/promoreq');
            }              
        });


 
 








             /* APPOINTMENT & PROMOTION */

            // Fetch Appointment
            app.get('/hrm/appoint/',isAuthenticated,isAdmin,async(req,res) => {  
               res.render('index_hr',{
                    view:"appoint",
                    title: "APPOINTMENTS",
                    user: req.session.user
                });    
             });


             // APPOINTMENTS - GSON
             app.post('/hrm/appoint/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(7);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'appoint_date';
                columns[3] = 'confirm_date';
                columns[4] = 'jobtitle';
                columns[5] = 'grade';
                columns[6] = 'status';
              
                if(params.search.value != ''){
                   // where += " where ( s.staff_no like '%"+params.search.value.trim()+"%' ";
                   // where += " or p.staff_group like '%"+params.search.value.trim()+"%' ";
                  //  where += " or s.fname like '%"+params.search.value.trim()+"%' ";
                  //  where += " or s.mname like '%"+params.search.value.trim()+"%' ";
                  //  where += " or s.lname like '%"+params.search.value.trim()+"%' ";
                  //  where += " or j.title like '%"+params.search.value.trim()+"%' ";
                  //  where += " or u.long_name like '%"+params.search.value.trim()+"%' )";
                    //where += " or p.appoint_date like '%"+params.search.value.trim()+"%')";
                   
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or lower(p.apply_type) like lower('%"+params.search.value.trim()+"%') ";
                    where += " or j.title like '%"+params.search.value+"%') ";
                    //where += " or DATE(p.appoint_date) like DATE('%"+params.search.value.trim()+"%')) ";
                } 
    
                let sql = "select concat(fname,ifnull(concat(' ',mname),''),' ',lname) as owner,upper(date_format(p.appoint_date,'%M %d, %Y')) as appoint_date,upper(date_format(p.confirm_date,'%M %d, %Y')) as confirm_date,j.title as jobtitle,j.rank_years,j.upgradable, p.staff_group,x.grade,x.notch,concat(grade,', STEP ',notch) as grades,p.staff_no,p.apply_type,s.dob from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join scale x on x.id = p.scale_id  where (p.apply_type = 'APPOINTMENT' or p.apply_type = 'PROMOTION'  or p.apply_type = 'UPGRADE') and (s.staff_status = 'PERMANENT' or s.staff_status = 'TEMPORAL' or s.staff_status = 'CONTRACT') ";
                //let sql = "select s.*,UPPER(DATE_FORMAT(p.appoint_date,'%M %d, %Y')) as appoint_date,UPPER(DATE_FORMAT(p.confirm_date,'%M %d, %Y')) as confirm_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as owner, p.staff_group,p.staff_no,p.apply_type from promotion p left join staff s on s.staff_no = p.staff_no ";
                
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
               // sqlRec += "order by p.staff_no,p.appoint_date desc limit "+params.start+","+params['length'];
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];

                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let subdata = await dbx.query("select * from promotion where staff_no = "+row.staff_no+" order by appoint_date desc"); console.log(rowsRec);
                    let output = subdata.map((cur,i) =>{
                      return `<li><a style="font-size:10px;color:seagreen" onclick="return confirm('Edit Record?')" href="/hrm/appoint/edit/${cur.id}"><i class="fa fa-edit"></i> ${i+1}.${cur.staff_group} (${cur.apply_type})</a></li>`;
                    })
                    let m = 0;
                    if(m == 0){
                      //row.jobtitle = row.grade = "Works";
                      const end = moment(row.appoint_date).add(row.rank_years,'years');
                      const age = row.dob != null ? moment().diff(moment(row.dob),'years') : 0;
                      row.pro_days = row.appoint_date != null ? end.diff(moment(),'days') : 0;
                      row.data = subdata;
                      row.active = 1;
                      row.confirm_date = row.confirm_date != null ? '<div class="group group-xl"><a class="btn btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.confirm_date+'</a></div>' : '';            
                      row.appoint_date = row.appoint_date != null ? '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.appoint_date+'</a></div>' :'';            
                      row.status = `<div class="btn-group" style="width:220px;border-radius:5px;">
                                        <a class="btn btn-warning btn-sm" style="margin-bottom:10px;float:left;" target="_blank" href="/hrm/appoint/data/${row.staff_no}"><i class="fa fa-folder-open fa-lg"></i> ${row.staff_group} <em>(${row.data.length})</em> - <small>${row.apply_type == 'APPOINTMENT'?'A':(row.apply_type == 'PROMOTION'? 'P':'U')}</small></a>
                                        <button type="button" class="btn btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                        <a class="btn btn-danger btn-sm" href="/hrm/exitstaff/${row.staff_no}" title="End Service for Staff!" onclick="return confirm('End Service of Staff - ${row.owner} ?')"><i class="fa fa-power-off"></i></a>
                                        <ul class="dropdown-menu">${output.join('')}</ul>
                                    </div>`;
                      row.staff_no = `<button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>${row.staff_no}</b></button><br><center><small><b class="text-primary"><em>AGE: ${age}</em></b></small></center>`
                     // row.status += row.rank_years != null ? (row.pro_days > 0 ? '<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">'+row.pro_days+' days to '+(row.upgradable == '1'? 'upgrade':'promotion')+'</span>':'<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">Promotion is due ( check records )</span>') : '';                                     
                      row.grade = row.grade+',STEP '+row.notch;
                    }
                    return row;
                }));   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });  
            });


          
            // SENIOR MEMBERS APPOINTMENTS (SM)
            app.post('/hrm/appointsm/gson',isAuthenticated,isAdmin,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(7);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'appoint_date';
                columns[3] = 'confirm_date';
                columns[4] = 'jobtitle';
                columns[5] = 'unitname';
                columns[6] = 'remark';
                
                if(params.search.value != ''){
                    where += " and ( s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or p.staff_group like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or s.fname like '%"+params.search.value.trim()+"%' ";
                    where += " or s.mname like '%"+params.search.value.trim()+"%' ";
                    where += " or s.lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%' )";
                    //where += " or u.long_name like '%"+params.search.value.trim()+"%' )";
                    //where += " or appoint_date like '%"+params.search.value.trim()+"%'";
                } 
    
                let sql = "select r.start_date,r.end_date,r.renewal_period,j.type,p.postretire_id,p.probation,p.staff_no,s.dob,date_format(p.appoint_date,'%M %d, %Y') as appoint_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as owner,j.title as jobtitle,p.staff_group,s.staff_status as status from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join renewal r on p.renew_id = r.id where p.appoint_date IS NOT NULL and (p.staff_group = 'SM' or p.staff_group = 'JS' or p.staff_group = 'SS') ";
                sqlRec += sql;
                sqlTot += sql;
    
                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += " order by p.appoint_date desc limit "+params.start+","+params['length'];
    
                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                //console.log(data);  
                //let high_qualify = await dbx.query("select * from certificate where staff"); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let m = 0;
                    if(m == 0){
                        const age = moment().diff(moment(row.dob,'YYYY-MM-DD'),'years');
                        row.remark = `<a class="btn btn-warning btn-sm" style="margin-bottom:10px" target="_blank" href="/hrm/appoint/view/${row.staff_no}"><i class="fa fa-folder-open fa-lg"></i> ${row.staff_group}</a>`
                        if(row.confirm_date == null){
                            //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                            let prob = moment(row.appoint_date).add((row.probation != null ? row.probation : 2),'years');
                            let diff = moment(prob,'YYYY-MM-DD').diff(moment(),'days');
                            row.remark += `<br><b class="text-uppercase text-bold text-primary"><small style="font-size:10px;">${diff > 0 ? diff+' days to confirmation</small>' :  '<a class="btn btn-success btn-sm"><i class="fa fa-thumbs-up fa-lg"></i> confirm</a>'} </b>`
                    
                        }else if(age >= 60 && (row.staff_group != 'SM' || (row.staff_group == 'SM' && row.type == 'NON-ACADEMIC'))){ // Non-Senior Member and Approached Retirement Age - Show End of Service
                                row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Current Age is ${age} yrs.</b>
                                               <br><br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-remove fa-lg"></i> End Service</a>
                                              `
                        }else if(age >= 60 && row.staff_group == 'SM' && row.postretire_id == null && row.type == 'ACADEMIC'){
                                row.remark += `<br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-off fa-lg"></i> Add <cite abbr="Post-Retirement">PR</cite> Contract</a>`
                        
                        }else if(age >= 60  && row.staff_group == 'SM' && row.postretire_id != null && row.type == 'ACADEMIC'){
                            row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Serving Post-retirement <em>(${diff} yrs out of 5 )</em><br>Current Age is ${age} yrs.</b>
                                           <br><br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-remove fa-lg"></i> End Service</a>
                                          `
                        }else if(age < 60  && row.staff_group == 'SM' && row.renew_id != null){
                            //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                            let diff = moment(moment(row.start_date),'YYYY-MM-DD').diff(moment(),'days');
                            if(diff > 0){
                               row.remark += `<br><b class="text-uppercase text-bold text-primary"><small style="font-size:10px;">SM contract ends in ${diff} days!</small></b>`
                            }else{
                                row.remark += `<b class="text-uppercase text-bold text-primary"><a class="btn btn-success btn-sm"><i class="fa fa-upload fa-md"></i> Renew contract</a></b>`
                            }

                        }else if(row.confirm_date != null && (new Date(row.confirm_date) > Date.now())){
                                row.remark += `<br><br><b class="text-uppercase text-bold text-primary" style="font-size:10px; ">On Post-retirement <em>(${diff} yrs out of 5 )</em></b>`
                        }else{
                                row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Please Update Records</b>`
                        }
                        //row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';            
                        row.confirm_date = row.confirm_date != null ? '<div class="group group-xl"><a class="btn btn-warning btn-sm"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.confirm_date+'</a></div>':'<b class="text-danger text-uppercase">On Probation</b>';            
                        row.appoint_date = row.appoint_date != null ? '<div class="group group-xl"><a class="btn btn-success btn-sm text-uppercase"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.appoint_date+'</a></div>':'<b class="text-danger text-uppercase">None</b>';            
                        row.staff_group = row.staff_group == 'SM'? 'SENIOR MEMBER (SM)' : (row.staff_group == 'JS' ? 'JUNIOR STAFF (JS)':'SENIOR STAFF (SS)'); 
                        row.unitname = null;
                    }
                    return row;
                })); 
               // console.log(data);   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });          
            
            });
            

              // Add Appointment/Promotion Record
              app.get('/hrm/appoint/add',isAuthenticated,isAdmin,async(req,res) => {  
                var exist = req.query.ext != undefined  ? true : false;      
                var type = req.query.type || 'appointment' ;    
                let rows = await dbx.query("select sc.* from scale sc where sc.active = '1' order by trim(grade),notch asc; select * from job where active = '1' order by trim(title) asc; select * from unit where active = '1' order by trim(long_name)");
                res.render('index_hr',{
                    view:"addeappoint",
                    title: `ADD ${exist ? 'EXISTING':'NEW'} ${type.toUpperCase()}`,
                    row:{id:0,exist,type},
                    data: {scales: rows[0], jobs: rows[1], units: rows[2], appoints: null},
                    type,
                    user: req.session.user               
                });            
            });


             // Edit Appointment/Promotion Data
             app.get('/hrm/appoint/edit/:id',isAuthenticated,isAdmin,async(req,res) => {           
                let id = req.params.id;
                let row = await dbx.query("select *,scale_id,date_format(appoint_date,'%Y-%m-%d') as appoint_date,date_format(confirm_date,'%Y-%m-%d') as confirm_date from promotion where id ="+id);
                let rows = await dbx.query("select sc.* from scale sc where sc.active = '1' order by trim(grade),notch asc; select * from job where active = '1' order by trim(title) asc; select * from unit where active = '1' order by trim(long_name)");
                res.render('index_hr',{
                    view:"addeappoint",
                    title: `EDIT ${row[0].apply_type.toUpperCase()}`,
                    row:row[0],
                    data: {scales: rows[0], jobs: rows[1], units: rows[2], appoints: null},
                    type : row[0].apply_type.toLowerCase(),
                    user: req.session.user               
                });            
            });


             // Edit Appointment/Promotion Data
             app.get('/hrm/exitstaff/:stno',isAuthenticated,isAdmin,async(req,res) => {           
                let stno = req.params.stno;
                let row = await dbx.query("select *,date_format(exit_date,'%Y-%m-%d') as exit_date from staff where staff_no ="+stno);
                res.render('index_hr',{
                    view:"addexit",
                    title: "END OF SERVICE",
                    row:row[0],
                    user: req.session.user               
                });            
            });


             // Edit Appointment/Promotion Data
             app.get('/hrm/getstaff/:stno',isAuthenticated,async(req,res) => {           
                let stno = req.params.stno;
                let row = await dbx.query("select s.staff_no,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.staff_status,u.long_name as unitname,j.title as jobtitle,p.staff_group from promotion p left join staff s on p.id = s.promo_id left join unit u on u.id = p.unit_id left join job j on j.id = p.job_id where p.staff_no = "+stno+" order by p.id desc limit 1"); 
                res.json({row:row[0]});            
            });


             // Post Exit Data
             app.post('/hrm/postexit',isAuthenticated,isAdmin,async(req,res)=>{  
                req.body.exit_date == '' ? delete req.body.exit_date :'';
                req.body.exit_remark == '' ? delete req.body.exit_remark :'';
                await dbx.query("update staff set ? where id ="+req.body.id,req.body);                      
                // Redirect
                res.redirect('/hrm/staff');     
            });



            // Post Appointment/Promotion/Upgrade Data
            app.post('/hrm/postappoint',isAuthenticated,isAdmin,async(req,res)=>{  
                const exist = req.body.exist;
                delete req.body.exist;
                req.body.confirm_date == '' ? delete req.body.confirm_date :'';
                req.body.appoint_date == '' ? delete req.body.appoint_date :'';
                req.body.probation == '' ? delete req.body.probation :'';
                req.body.appoint_date == undefined ? req.body.appoint_date = null :'';
                req.body.confirm_date == undefined ? req.body.confirm_date = null :'';
                
                if(req.body.id <= 0){  
                    // Get Existing Unit ID of staff for Promotions or Upgrades
                    let st = await dbx.query("select p.unit_id from staff s left join promotion p on s.promo_id = p.id where s.staff_no = "+req.body.staff_no);
                    req.body.unit_id = (req.body.apply_type == 'APPOINTMENT' ? req.body.unit_id : st[0].unit_id);
                    // Insert Appointment,Promotion or Upgrade
                    let ins = await dbx.query("insert into promotion set ?", req.body); 
                    if(exist == '0'){
                        let dt = {promo_id : ins.insertId}   
                        await dbx.query("update staff set ? where staff_no = "+req.body.staff_no, dt); 
                    }
                }else{  
                    console.log(req.body);  
                    await dbx.query("update promotion set ? where id ="+req.body.id,req.body);                      
                }
                // Redirect
                res.redirect('/hrm/appoint');     
            });



            // HR Approve Appointment
            app.get('/hrm/approveappoint/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id; 
                let appoint = await dbx.query("select * from promotion where id ="+id)
                await dbx.query("update promotion set hr_approved = '1' where id ="+id);
                await dbx.query("update staff set promo_id = "+id+" where staff_no ="+appoint[0].staff_no);
                //rows[0].reg_date = moment(rows[0].reg_date).format('YYYY-MM-DD');
                res.redirect('/hrm/appoint');
            });


            // Appointment
            app.get('/hrm/appoint/data/:staffno',isAuthenticated,async(req,res) => {                
                let stno = req.params.staffno;  
                let rows = await dbx.query("select year(p.appoint_date) as start_year, upper(date_format(s.dob,'%M %d, %Y')) as dobx,s.photo,s.staff_no,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.staff_status,p.*,u.long_name as unitname,j.title as jobtitle,concat(sc.grade,', STEP ',sc.notch) as grade,date_format(p.confirm_date,'%d/%m/%Y') as confirm_date,date_format(p.appoint_date,'%d/%m/%Y') as appoint_date from promotion p left join staff s on p.id = s.promo_id left join unit u on u.id = p.unit_id left join job j on j.id = p.job_id left join scale sc on sc.id = p.scale_id where p.staff_no = "+stno+" order by p.appoint_date desc"); 
                res.render('partials/hr_appointstat',{
                    view:'appointstat',
                    title:'APPOINTMENT & PROMOTION DATA',
                    data:rows,
                    user: req.session.user
                });                   
            });

             // Appointment
             app.get('/hrm/appoint/view/:staffno',isAuthenticated,isAdmin,async(req,res) => {                
                let stno = req.params.staffno;  
                let rows = await dbx.query("select upper(date_format(s.dob,'%M %d, %Y')) as dobx,s.dob,s.photo,s.staff_no,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,s.staff_status,p.*,u.long_name as unitname,j.title as jobtitle,concat(sc.grade,', NOTCH ',sc.notch) as sscale,date_format(p.confirm_date,'%d/%m/%Y') as confirm_date from promotion p left join staff s on p.id = s.promo_id  left join unit u on u.id = p.unit_id left join job j on j.id = p.job_id left join scale sc on sc.id = p.scale_id where s.staff_no = "+stno+" order by p.id desc"); 
                let data = await Promise.all(rows.map(async(row,i)=>{
                     // Renewal
                     row.renewal = await dbx.query("select * from renewal where staff_no = "+row.staff_no+" order by id desc");
                     // Postretire
                     row.postretire = await dbx.query("select * from postretire where staff_no = "+row.staff_no+" order by id desc");
                     // Promotion
                     row.promotion = await dbx.query("select * from promotion where apply_type <> 'APPOINTMENT' and apply_type IS NOT NULL and staff_no = "+row.staff_no+" and promo_id = "+row.id+" order by id desc");
                     const age = moment().diff(moment(row.dob,'YYYY-MM-DD'),'years');
                     const retireyr = moment().add((60-age),'years').format('YYYY');
                     const endyr = moment().add((65-age),'years').format('YYYY');
                     row.retire = [age,retireyr,endyr];
                     return row;
                }));
                
                //
                if(row.confirm_date == null){
                    //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                    let prob = moment(row.appoint_date).add((row.probation != null ? row.probation : 2),'years');
                    let diff = moment(prob,'YYYY-MM-DD').diff(moment(),'days');
                    row.remark += `<br><b class="text-uppercase text-bold text-primary"><small style="font-size:10px;">${diff > 0 ? diff+' days to confirmation</small>' :  '<a class="btn btn-success btn-sm"><i class="fa fa-thumbs-up fa-lg"></i> confirm</a>'} </b>`
            
                }else if(age >= 60 && (row.staff_group != 'SM' || (row.staff_group == 'SM' && row.type == 'NON-ACADEMIC'))){ // Non-Senior Member and Approached Retirement Age - Show End of Service
                        row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Current Age is ${age} yrs.</b>
                                       <br><br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-remove fa-lg"></i> End Service</a>
                                      `
                }else if(age >= 60 && row.staff_group == 'SM' && row.postretire_id == null && row.type == 'ACADEMIC'){
                        row.remark += `<br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-off fa-lg"></i> Add <cite abbr="Post-Retirement">PR</cite> Contract</a>`
                
                }else if(age >= 60  && row.staff_group == 'SM' && row.postretire_id != null && row.type == 'ACADEMIC'){
                    row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Serving Post-retirement <em>(${diff} yrs out of 5 )</em><br>Current Age is ${age} yrs.</b>
                                   <br><br><a class="btn btn-success btn-sm"><i class="mdi mdi-account-remove fa-lg"></i> End Service</a>
                                  `
                }else if(age < 60  && row.staff_group == 'SM' && row.renew_id != null){
                    //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                    let diff = moment(moment(row.start_date),'YYYY-MM-DD').diff(moment(),'days');
                    if(diff > 0){
                       row.remark += `<br><b class="text-uppercase text-bold text-primary"><small style="font-size:10px;">SM contract ends in ${diff} days!</small></b>`
                    }else{
                        row.remark += `<b class="text-uppercase text-bold text-primary"><a class="btn btn-success btn-sm"><i class="fa fa-upload fa-md"></i> Renew contract</a></b>`
                    }

                }else if(row.confirm_date != null && (new Date(row.confirm_date) > Date.now())){
                        row.remark += `<br><br><b class="text-uppercase text-bold text-primary" style="font-size:10px; ">On Post-retirement <em>(${diff} yrs out of 5 )</em></b>`
                }else{
                        row.remark += `<br><br><b class="text-uppercase text-bold text-primary">Please Update Records</b>`
                }


                console.log(data);   
                //res.json(data); 
                res.render('partials/hr_promoview',{
                    view:'promoview',
                    title:'STAFF DATA FOLDER',
                    data:data[0],
                    user: req.session.user
                });                   
            });



            // Confirm Staff
            app.get('/hrm/editconfirm/:id',isAuthenticated,isAdmin,async(req,res) => { 
                let id = req.params.id; 
                let rows = await dbx.query("select * from staff where id = "+id);
                res.render('index_hr',{
                    view:"addconfirm",
                    title: "",
                    user: req.session.user, 
                    row: rows[0]            
                });
            });



           /* POST-RETIREMENT */

           // APPOINTMENTS - GSON
           app.post('/hrm/postretire/gson',isAuthenticated,async(req,res) => { 
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(6);
                columns[0] = 'staff_no';
                columns[1] = 'owner';
                columns[2] = 'start_post';
                columns[3] = 'served';
                columns[4] = 'jobtitle';
                columns[5] = 'status';
            
                if(params.search.value != ''){
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value+"%') ";
                } 

                let sql = "select r.*,upper(date_format(start_post,'%M %d, %Y')) as start_post,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as owner,j.title as jobtitle,p.staff_group,p.staff_no from postretire r left join staff s on s.staff_no = r.staff_no left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id where (p.apply_type = 'APPOINTMENT' or p.apply_type = 'PROMOTION'  or p.apply_type = 'UPGRADE') and (s.staff_status = 'PERMANENT' or s.staff_status = 'TEMPORAL' or s.staff_status = 'CONTRACT') and r.active = '1' ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by r."+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];

                let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                let data = await Promise.all(rowsRec.map(async (row) =>{
                    let subdata = await dbx.query("select * from postretire where staff_no = "+row.staff_no+"  and active = '1' order by start_post desc"); console.log(rowsRec);
                    let output = subdata.map((cur,i) =>{
                        return `<li><a style="font-size:10px;color:seagreen" onclick="return confirm('Edit Record?')" href="/hrm/editpostretire/${cur.id}"><i class="fa fa-edit"></i> Record : ${i+1}  - <em>( ID:${cur.id} )</em></a></li>`;
                    })
                    let m = 0;
                    if(m == 0){
                    //row.jobtitle = row.grade = "Works";
                    const end = moment(row.start_post,'MMMM DD, YYYY').add(row.served,'years');
                    const day = row.start_post != null ? moment(end).diff(moment(),'days') : 0;
                    row.status =   `<div class="btn-group" style="width:250px;border-radius:5px;">
                                        <a class="btn btn-warning btn-sm" style="margin-bottom:10px;float:left;" target="_blank" href="/hrm/postretire/data/${row.staff_no}"><i class="fa fa-folder-open fa-lg"></i> <em>RECORDS <em>(${subdata.length})</em></a>
                                        <button type="button" class="btn btn-sm dropdown-toggle" style="margin-bottom:10px;float:left;" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                        <ul class="dropdown-menu">${output.join('')}</ul>
                                    </div>`;
                    row.staff_no = `<button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>${row.staff_no}</b></button>`
                    row.served = row.served != null ? `<button class="btn btn-sm"><i class="fa fa-calendar fa-sm"></i> <b>${row.served} yrs</b></button>` : '';                                     
                    row.start_post = row.start_post != null ? `<button class="btn btn-sm btn-success"><i class="fa fa-calendar-check-o fa-lg"></i> <b>${row.start_post}</b></button>` : '';                                     
                    row.status += row.served != null ? (day > 0 ? '<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">'+day+' days to contract expiry</span>':'<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">Contract expired</span>') : '';                                     
                    }
                    return row;
                }));   
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });  
            });


        // Add Postretirement
        app.get('/hrm/addpostretire',isAuthenticated,isAdmin,async(req,res) => {           
            var exist = req.query.ext != undefined  ? true : false;         
            res.render('index_hr',{
               view:"addpostretire",
               title:`ADD ${exist ? 'EXISTING':'NEW'} POST-RETIREMENT CONTRACT`,
               row: {id:0,exist},
               user: req.session.user               
           });            
        });

       // Edit Transfer
       app.get('/hrm/editpostretire/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select r.*,date_format(r.start_post,'%Y-%m-%d') as start_post,date_format(r.end_post,'%Y-%m-%d') as end_post,p.id as pid from postretire r left join staff s on s.staff_no = r.staff_no left join promotion p on s.promo_id = p.id where r.id = "+id);
           res.render('index_hr',{
               view:"addpostretire",
               title: "EDIT POST-RETIREMENT CONTRACT",
               user: req.session.user,
               row: rows[0], 
           });
       });


       // Delete Postretire
         app.get('/hrm/delpostretire/:id',isAuthenticated,isAdmin,async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from postretire where id = "+id);
            res.redirect('/hrm/position');              
         });  
       
       
         // Post Post-retirement Data
         app.post('/hrm/postretire',isAuthenticated,isAdmin,async(req,res)=>{  
            const exist = req.body.exist;
            const pid = req.body.pid;
            req.body.start_post == '' ? delete req.body.start_post :'';
            req.body.end_post == '' ? delete req.body.end_post :'';
            req.body.active = exist == '0' ? '1':'0';
            delete req.body.exist;delete req.body.pid;
            if(req.body.id <= 0){  
                let ins = await dbx.query("insert into postretire set ?", req.body); 
                if(exist == '0'){
                    let dt = {postretire_id:ins.insertId}
                    await dbx.query("update promotion set ? where id = "+pid, dt); 
                }
            }else{    
                await dbx.query("update postretire set ? where id = "+req.body.id,req.body);                      
            }
            // Redirect
            res.redirect('/hrm/appoint#page5');         
        });


         // Postretire Staff Stats
         app.get('/hrm/postretire/data/:staffno',isAuthenticated,async(req,res) => {                
            let stno = req.params.staffno;  
            let rows = await dbx.query("select r.*,year(start_post) as start_year,upper(date_format(start_post,'%M %d, %Y')) as start_post,upper(date_format(end_post,'%M %d, %Y')) as end_post,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as name,j.title as jobtitle,p.staff_group,p.staff_no,s.photo from postretire r left join staff s on s.staff_no = r.staff_no left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id where (p.apply_type IS NOT NULL) and (s.staff_status = 'PERMANENT' or s.staff_status = 'TEMPORAL' or s.staff_status = 'CONTRACT') and r.active = '1' and r.staff_no = "+stno+" order by r.start_post desc"); 
            res.render('partials/hr_postretirestat',{
                view:'postretirestat',
                title:'POST-RETIREMENT CONTRACTS',
                data:rows,
                user: req.session.user
            });                   
        });





        
           /* RENEWALS */

           // Renewal - GSON
           app.post('/hrm/renewal/gson',isAuthenticated,async(req,res) => { 
            let sqlRec = "";
            let sqlTot = "";
            let where = "";           
            const params = req.body;
            const columns = Array(6);
            columns[0] = 'staff_no';
            columns[1] = 'owner';
            columns[2] = 'start_date';
            columns[3] = 'renewal_period';
            columns[4] = 'jobtitle';
            columns[5] = 'status';
        
            if(params.search.value != ''){
                where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                where += " or fname like '%"+params.search.value.trim()+"%' ";
                where += " or mname like '%"+params.search.value.trim()+"%' ";
                where += " or lname like '%"+params.search.value.trim()+"%' ";
                where += " or j.title like '%"+params.search.value+"%') ";
            } 

            let sql = "select r.*,upper(date_format(start_date,'%M %d, %Y')) as start_date,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as owner,j.title as jobtitle,p.staff_group,p.staff_no from renewal r left join staff s on s.staff_no = r.staff_no left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id where r.active = '1' and p.staff_group = 'SM' and p.job_id not in (41,299) ";
            sqlRec += sql;
            sqlTot += sql;

            if(where != ''){
                sqlRec += where;
                sqlTot += where;
            }
            sqlRec += "order by r."+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];

            let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
            let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
            let data = await Promise.all(rowsRec.map(async (row) =>{
                let subdata = await dbx.query("select r.*,upper(date_format(start_date,'%M %d, %Y')) as start_date,upper(date_format(end_date,'%M %d, %Y')) as end_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,j.title as jobtitle,p.staff_no,s.photo from renewal r left join staff s on s.staff_no = r.staff_no left join promotion p on r.promo_id = p.id left join job j on j.id = p.job_id where r.staff_no = "+row.staff_no+" and r.active = '1' order by r.start_date desc");
                console.log(rowsRec);
                let output = subdata.map((cur,i) =>{
                    return `<li><a style="font-size:10px;color:seagreen" onclick="return confirm('Edit Record?')" href="/hrm/editrenewal/${cur.id}"><i class="fa fa-edit"></i> Record : ${i+1}  - <em>( ID:${cur.id} )</em></a></li>`;
                })
                let m = 0;
                if(m == 0){
                    const end = moment(row.start_date).add(row.renewal_period,'years');
                    const day = row.start_date != null ? moment(end).diff(moment(),'days') : 0;
                    row.status =   `<div class="btn-group" style="width:250px;border-radius:5px;">
                                        <a class="btn btn-warning btn-sm" style="margin-bottom:10px;float:left;" target="_blank" href="/hrm/renewal/data/${row.staff_no}"><i class="fa fa-folder-open fa-lg"></i> <em>RECORDS <em>(${subdata.length})</em></a>
                                        <button type="button" class="btn btn-sm dropdown-toggle" style="margin-bottom:10px;float:left;" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>
                                        <ul class="dropdown-menu">${output.join('')}</ul>
                                    </div>`;
                    row.staff_no = `<button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>${row.staff_no}</b></button>`
                    row.renewal_period = row.renewal_period != null ? `<button class="btn btn-sm"><i class="fa fa-calendar fa-sm"></i> <b>${row.renewal_period} yrs</b></button>` : '';                                     
                    row.start_date = row.start_date != null ? `<button class="btn btn-sm btn-success"><i class="fa fa-calendar-check-o fa-lg"></i> <b>${row.start_date}</b></button>` : '';                                     
                    row.status += row.renewal_period != null ? (day > 0 ? '<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">'+day+' days to contract expiry!</span>':'<span class="alert alert-default pull-center" style="display:inline-block;font-size:10px;color:#000;">Contract expired!</span>') : '';                                     
                }
                return row;
            }));   
            res.json({
                draw : Number(params.draw),
                recordsTotal : Number(rowsTot.length),
                recordsFiltered : Number(rowsTot.length),
                data: data
            });  
        });


    // Add Renewal
    app.get('/hrm/addrenewal',isAuthenticated,isAdmin,async(req,res) => {           
        var exist = req.query.ext != undefined  ? true : false;   
        res.render('index_hr',{
           view:"addrenewal",
           title:`ADD ${exist ? 'EXISTING':'NEW'} RENEWAL CONTRACT`,
           row: {id:0,exist},
           user: req.session.user               
       });            
    });

   // Edit Renewal
   app.get('/hrm/editrenewal/:id',isAuthenticated,isAdmin,async(req,res) => { 
       let id = req.params.id;
       let rows = await dbx.query("select r.*,date_format(r.start_date,'%Y-%m-%d') as start_date,date_format(r.end_date,'%Y-%m-%d') as end_date from renewal r where r.id = "+id);
       res.render('index_hr',{
           view:"addrenewal",
           title: "EDIT RENEWAL CONTRACT",
           user: req.session.user,
           row: rows[0], 
       });
   });


   // Delete Renewal
     app.get('/hrm/delrenewal/:id',isAuthenticated,isAdmin,async(req, res) => {
        let id = req.params.id;
        await dbx.query("delete from renewal where id = "+id);
        res.redirect('/hrm/position');              
     });  
   

    // Fetch All Promotions & Appointment for Renewal Form
      app.get('/hrm/renewalpromo/:stno',isAuthenticated,async(req, res) => {
        let stno = req.params.stno;
        let data = await dbx.query("select p.staff_group,p.id,date_format(p.appoint_date,'%Y-%m-%d') as appoint_date,concat(s.grade,'-',s.notch) as grade from promotion p left join scale s on s.id = p.scale_id where p.staff_group = 'SM' and p.staff_no = "+stno+" order by p.appoint_date desc");
        if(data.length > 0){
            res.json({success:true,data});    
        }else{
            res.json({success:false,data:null});    
        }
     }); 
   
     // Post Renewal Data
     app.post('/hrm/postrenewal',isAuthenticated,isAdmin,async(req,res)=>{  
        const exist = req.body.exist;
        req.body.start_date == '' ? delete req.body.start_date :'';
        req.body.end_date == '' ? delete req.body.end_date :'';
        req.body.active = exist == '0' ? '1':'0';
        delete req.body.exist;
        if(req.body.id <= 0){ 
            let promo = await dbx.query("select p.id from staff s left join promotion p on p.id = s.promo_id where p.staff_no = "+req.body.staff_no); 
            req.body.promo_id = exist == '0' ? promo[0].id : req.body.promo_id;
            let ins = await dbx.query("insert into renewal set ?", req.body); 
            if(exist == '0'){
                let dt = {renew_id:ins.insertId}
                await dbx.query("update promotion set ? where id = "+promo[0].id, dt); 
                await dbx.query("update renewal set active='0' where id <> "+ins.insertId+" and staff_no = "+req.body.staff_no); 
            
            }
        }else{    
            await dbx.query("update renewal set ? where id = "+req.body.id,req.body);                      
        }
        // Redirect
        res.redirect('/hrm/appoint#page3');         
    });


     // Renewal Statistics
     app.get('/hrm/renewal/data/:staffno',isAuthenticated,async(req,res) => {                
        let stno = req.params.staffno;  
        let rows = await dbx.query("select r.*,year(r.start_date) as start_year,upper(date_format(start_date,'%M %d, %Y')) as start_date,upper(date_format(end_date,'%M %d, %Y')) as end_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name,j.title as jobtitle,p.staff_no,s.photo from renewal r left join staff s on s.staff_no = r.staff_no left join promotion p on r.promo_id = p.id left join job j on j.id = p.job_id where r.staff_no = "+stno+" order by start_date desc"); 
        res.render('partials/hr_renewalstat',{
            view:'renewalstat',
            title:'SENIOR MEMBERSHIP RENEWAL CONTRACTS',
            data:rows,
            user: req.session.user
        });                   
    });




    /* STAFF SCALE INCREMENT  */

    // Add Increment
    app.get('/hrm/addincrement',isAuthenticated,isAdmin,async(req,res) => {           
        var action = req.query.action;   
        let jobs = await dbx.query("select * from job where active = '1' order by title asc");          
        res.render('index_hr',{
           view:"addincrement",
           title:`${action == 'job' ? 'SCALE UPGRADE BY DESIGNATION':'SCALE GRADE BY LAST UPGRADE PERIOD'}`,
           row: {id:0,action},jobs,
           user: req.session.user               
       });            
    });

    
    // Post increment by Designation or Period Range
    app.post('/hrm/postincrement',isAuthenticated,isAdmin,async(req,res)=>{                    
             if(req.body.action == 'job'){
                  const jobs = req.body.jobs == undefined ? null : (typeof req.body.jobs === 'string' ? req.body.jobs : req.body.jobs.join(','));
                  const no = req.body.steps;
                  const group = req.body.group;
                 
                  if(group == 'ALL'){
                     var promo = await dbx.query("select p.id,s.notch,s.grade,s.id as sid,p.staff_no from staff x left join promotion p on x.promo_id = p.id left join scale s on p.scale_id = s.id where (x.staff_status = 'TEMPORAL' or x.staff_status = 'PERMANENT' or x.staff_status = 'CONTRACT') and p.job_id IN ('"+jobs+"')");          
                  }else{
                     var promo = await dbx.query("select p.id,s.notch,s.grade,s.id as sid,p.staff_no from staff x left join promotion p on x.promo_id = p.id left join scale s on p.scale_id = s.id where (x.staff_status = 'TEMPORAL' or x.staff_status = 'PERMANENT' or x.staff_status = 'CONTRACT') and p.staff_group = '"+group+"' and p.job_id IN ('"+jobs+"')");          
                  }   
                    promo.forEach(async row => {
                        let newscale = await dbx.query("select * from scale where grade = '"+row.grade+"' and notch ="+(row.notch+parseInt(no)));
                        if(newscale.length > 0){
                           console.log(newscale.length);
                            var vs = await dbx.query("update promotion set scale_id = "+newscale[0].id+" where id = "+row.id);
                            let dt = {staff_no:row.staff_no,action_trigger:'INCREMENT',promo_id:row.id,old_scale_id:row.sid,new_scale_id:newscale[0].id,issuer:req.session.user.staff_no,issue_date:new Date()}
                            var ls = await dbx.query("insert into scale_log set ?",dt);
                        }
                     });

             }else{
                 const no = req.body.steps;
                 const to = req.body.to;
                 const from = req.body.from;
                 const group = req.body.group;
                
                 if(group == 'ALL'){
                    var promo = await dbx.query("select g.staff_no,p.id,s.notch,s.grade,s.id as sid,p.staff_no from scale_log g left join promotion p on g.promo_id = p.id left join scale s on p.scale_id = s.id left join staff x on x.staff_no = g.staff_no ");          
                 }else{
                    var promo = await dbx.query("select g.staff_no,p.id,s.notch,s.grade,s.id as sid,p.staff_no from scale_log g left join promotion p on g.promo_id = p.id left join scale s on p.scale_id = s.id left join staff x on x.staff_no = g.staff_no where date('"+from+"') >= g.issue_date and g.issue_date <= date('"+to+"') group by g.staff_no,p.id ");          
                 }  
                 promo.forEach(async row => {
                    let newscale = await dbx.query("select * from scale where grade = '"+row.grade+"' and notch ="+(row.notch+parseInt(no)));
                    if(newscale.length > 0){
                        var vs = await dbx.query("update promotion set scale_id = "+newscale[0].id+" where id = "+row.id);
                        let dt = {staff_no:row.staff_no,action_trigger:'INCREMENT',promo_id:row.id,old_scale_id:row.sid,new_scale_id:newscale[0].id,issuer:req.session.user.staff_no,issue_date:new Date()}
                        var ls = await dbx.query("insert into scale_log set ?",dt);
                    }
                 });
             }
            
            // Redirect
            res.redirect('/hrm/appoint');  
    });

    // Change Scale of Staff / Staff Increment
    app.get('/hrm/newscale/:stno/:no',isAuthenticated,isAdmin,async(req,res) => {           
        const stno = req.params.stno;
        const no = req.params.no;
        let promo = await dbx.query("select p.id,s.notch,s.grade,s.id as sid,p.staff_no from staff x left join promotion p on x.promo_id = p.id left join scale s on p.scale_id = s.id where x.staff_no = "+stno);          
        let newscale = await dbx.query("select * from scale where grade = '"+promo[0].grade+"' and notch ="+(promo[0].notch+parseInt(no)));
        if(newscale.length > 0){
            await dbx.query("update promotion set scale_id = "+newscale[0].id+" where id = "+promo[0].id);
            let dt = {staff_no:promo[0].staff_no,action_trigger:'INCREMENT',promo_id:promo[0].id,old_scale_id:promo[0].sid,new_scale_id:newscale[0].id,issuer:req.session.user.staff_no,issue_date:new Date()}
            await dbx.query("insert into scale_log set ?",dt);
        }
         // Redirect
         res.redirect('/hrm/appoint/#page1');         
    });



    app.get('/hrm/newscaleall/:no',isAuthenticated,async(req,res) => {           
        const no = req.params.no;
        let promo = await dbx.query("select p.id,s.notch,s.grade,s.id as sid,p.staff_no from staff x left join promotion p on x.promo_id = p.id left join scale s on p.scale_id = s.id where (x.staff_status = 'TEMPORAL' or x.staff_status = 'PERMANENT' or x.staff_status = 'CONTRACT')");          
         promo.forEach(async row => {
            let newscale = await dbx.query("select * from scale where grade = '"+row.grade+"' and notch ="+(row.notch+parseInt(no)));
            if(newscale.length > 0){
                console.log(newscale.length);
                await dbx.query("update promotion set scale_id = "+newscale[0].id+" where id = "+row.id);
                let dt = {staff_no:promo[0].staff_no,action_trigger:'INCREMENT',promo_id:promo[0].id,old_scale_id:promo[0].sid,new_scale_id:newscale[0].id,issuer:req.session.user.staff_no,issue_date:new Date()}
                await dbx.query("insert into scale_log set ?",dt);
            }
        });
        // Redirect
        res.redirect('/hrm/appoint');  
               
    });


            // SYSTEM LOGS

             // Fetch Logs
             app.get('/hrm/logs/',isAuthenticated,isAdmin,async(req,res) => {  
                let logs = await dbx.query("select *,date_format(datetime,'%Y-%m-%d %h:%i %s') as datetimes from log order by datetime desc,staff_no ");
                res.render('index_hr',{
                     view:"log",
                     title: "SYSTEM LOGS",
                     user: req.session.user,
                     logs
                 });    
              });
 
 
 
              // Logs - GSON
              app.post('/hrm/logs/gson',isAuthenticated,isAdmin,async(req,res) => { 
                 console.log(req.body);         
                 let sqlRec = "";
                 let sqlTot = "";
                 let where = "";           
                 const params = req.body;
                 const columns = Array(8);
                 columns[0] = 'staff_no';
                 columns[1] = 'action';
                 columns[2] = 'datetime';
                 columns[3] = 'ipaddress';
                 columns[4] = 'status';
                
               
                 if(params.search.value != ''){
                     where += " where staff_no like '%"+params.search.value.trim()+"%' ";
                     where += " or ipaddress like '%"+params.search.value.trim()+"%' ";
                     where += " or datetime like '%"+params.search.value.trim()+"%' ";
                 } 
     
                 let sql = "select *,date_format(datetime,'%Y-%m-%d %h:%i %s') as datetimes from log";
                 sqlRec += sql;
                 sqlTot += sql;
     
                 if(where != ''){
                     sqlRec += where;
                     sqlTot += where;
                 }
                 sqlRec += " order by datetime desc,staff_no limit "+params.start+","+params['length'];
     
                 let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                 let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                 let data = await Promise.all(rowsRec.map(async (row) =>{
                     let m = 0;
                     if(m == 0){
                       //row.photo = '<img src="'+(row.photo != null ? row.photo : '/public/images/none.png')+'" height="60px"/>';            
                       //row.confirm_date = '<div class="group group-xl"><a class="btn btn-warning btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.confirm_date+'</a></div>';            
                      // row.appoint_date = '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i> '+row.appoint_date+'</a></div>';            
                      // row.staff_group = row.staff_group == 'SM'? 'SENIOR MEMBER (SM)' : (row.staff_group == 'JS' ? 'JUNIOR STAFF (JS)':'SENIOR STAFF (SS)'); 
                       row.status = '<div class="group group-xl"><a class="btn btn-default btn-sm" href="#"><i class="fa fa-check-o fa-lg"></i></a></div>';            
                       
                     }
                     return row;
                 }));   
                 res.json({
                     draw : Number(params.draw),
                     recordsTotal : Number(rowsTot.length),
                     recordsFiltered : Number(rowsTot.length),
                     data: data
                 });  
             });
 

             
             //### PHOTO BOOTH
              
             // Fetch Logs
             app.get('/hrm/photos',isAuthenticated,isAdmin,async(req,res) => {  
                res.render('index_hr',{
                        view:"photo",
                        title: "PHOTO BOOTH",
                        user: req.session.user,
                        row : null
                });    
            });


             // Fetch Logs
             app.get('/hrm/photos/:id',isAuthenticated,isAdmin,async(req,res) => {  
                let id = req.params.id; 
                let rows = await dbx.query("select * from staff where staff_no = "+id);
                res.render('index_hr',{
                        view:"photo",
                        title: "PHOTO BOOTH",
                        user: req.session.user,
                        row : rows[0]
                });    
            });



            
            // Fetch Appointment
            app.get('/hrm/position/',isAuthenticated,isAdmin,async(req,res) => {  
                res.render('index_hr',{
                     view:"position",
                     title: "POSITIONS",
                     user: req.session.user
                 });    
              });
 
 
 
              // STAFF POSITIONS - GSON
              app.post('/hrm/position/gson',isAuthenticated,isAdmin,async(req,res) => { 
                 console.log(req.body);         
                 let sqlRec = "";
                 let sqlTot = "";
                 let where = "";           
                 const params = req.body;
                 const columns = Array(7);
                 columns[0] = 'staff_no';
                 columns[1] = 'name';
                 columns[2] = 'start_date';
                 columns[3] = 'end_date';
                 columns[4] = 'unit';
                 columns[5] = 'post';
                 columns[6] = 'status';
                
               
                 if(params.search.value != ''){
                     where += " and ( p.staff_no like '%"+params.search.value.trim()+"%' ";
                     where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                     where += " or concat(fname,' ',lname) like '%"+params.search.value.trim()+"%' ";
                     where += " or fname like '%"+params.search.value.trim()+"%' ";
                     where += " or mname like '%"+params.search.value.trim()+"%' ";
                     where += " or lname like '%"+params.search.value.trim()+"%' ";
                     where += " or trim(p.post) like '%"+params.search.value.trim()+"%' ";
                     where += " or trim(p.unit_domain) like '%"+params.search.value.trim()+"%' ";
                     where += " or trim(u.long_name) like '%"+params.search.value.trim()+"%') ";
                     //where += " or p.appoint_date like '%"+params.search.value.trim()+"%')";
                    
                 } 
     
                 let sql = "select p.id,s.photo,p.post,p.staff_no,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,upper(date_format(p.start_date,'%M %d, %Y')) as start_date,upper(date_format(p.end_date,'%M %d, %Y')) as end_date,u.long_name as unitname, p.unit_domain as unitdomain,p.unit_id from position p left join staff s on s.staff_no = p.staff_no left join unit u on p.unit_id = u.id where p.active = '1' ";
                 sqlRec += sql;
                 sqlTot += sql;
     
                 if(where != ''){
                     sqlRec += where;
                     sqlTot += where;
                 }
                 sqlRec += " order by p.start_date limit "+params.start+","+params['length'];
     
                 let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
                 let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
                 //let high_qualify = await dbx.query("select * from certificate where staff"); console.log(rowsTot);
                 let data = await Promise.all(rowsRec.map(async (row) =>{
                     let m = 0;
                     if(m == 0){
                        row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/position/stats/${row.staff_no}" title="View Staff Position Records"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editposition/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Transfer" href="/hrm/delposition/${row.id}" onclick="return confirm(\'Delete Transfer?\');"><i class="fa fa-trash"></i></a></div>`;            
                        row.start_date = '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i>&nbsp; '+row.start_date+'</a></div>';            
                        row.end_date = '<div class="group group-xl"><a class="btn btn-danger btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i>&nbsp; '+row.end_date+'</a></div>';            
                        row.unit = `<b><small>${row.unitname}</small> ${row.unitdomain != null? '<br><b><button class="btn btn-sm" style="font-size:10px;color:brown"><b>'+row.unitdomain+'</b></button>' :''}</b>`; 
                        row.nox = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.staff_no += '<center><h6 style="color:seablue">'+row.nox+'</h6></center>';
                        row.post = `<a class="btn btn-lg" target="_blank" href="/hrm/position/list/${row.post}/${row.unit_id}" style="font-size:20px;">${row.post}</a>`
                        row.unit = row.unitname == null || row.unitname == 'null' ? row.post : row.unit;
                     }
                     return row;
                 }));   
                 res.json({
                     draw : Number(params.draw),
                     recordsTotal : Number(rowsTot.length),
                     recordsFiltered : Number(rowsTot.length),
                     data: data
                 });  
             });


         // STAFF POSITIONS - GSON
         app.post('/hrm/position/inactive/gson',isAuthenticated,isAdmin,async(req,res) => { 
            console.log(req.body);         
            let sqlRec = "";
            let sqlTot = "";
            let where = "";           
            const params = req.body;
            const columns = Array(7);
            columns[0] = 'staff_no';
            columns[1] = 'name';
            columns[2] = 'start_date';
            columns[3] = 'end_date';
            columns[4] = 'unit';
            columns[5] = 'post';
            columns[6] = 'status';
           
          
            if(params.search.value != ''){
                where += " and ( p.staff_no like '%"+params.search.value.trim()+"%' ";
                where += " or trim(s.fname) like '%"+params.search.value.trim()+"%' ";
                where += " or trim(s.mname) like '%"+params.search.value.trim()+"%' ";
                where += " or trim(s.lname) like '%"+params.search.value.trim()+"%' ";
                where += " or trim(p.post) like '%"+params.search.value.trim()+"%' ";
                where += " or trim(p.unit_domain) like '%"+params.search.value.trim()+"%' ";
                where += " or trim(u.long_name) like '%"+params.search.value.trim()+"%') ";
                //where += " or p.appoint_date like '%"+params.search.value.trim()+"%')";
               
            } 

            let sql = "select p.id,s.photo,p.post,p.staff_no,upper(date_format(p.start_date,'%M %d, %Y')) as start_date,upper(date_format(p.end_date,'%M %d, %Y')) as end_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as name,u.long_name as unitname, p.unit_domain as unitdomain,p.unit_id from position p left join staff s on s.staff_no = p.staff_no left join unit u on p.unit_id = u.id where p.active = '0' ";
            sqlRec += sql;
            sqlTot += sql;

            if(where != ''){
                sqlRec += where;
                sqlTot += where;
            }
            sqlRec += " order by p.start_date limit "+params.start+","+params['length'];

            let rowsRec = await dbx.query(sqlRec); console.log(rowsRec);
            let rowsTot = await dbx.query(sqlTot); console.log(rowsTot);
            //let high_qualify = await dbx.query("select * from certificate where staff"); console.log(rowsTot);
            let data = await Promise.all(rowsRec.map(async (row) =>{
                let m = 0;
                if(m == 0){
                   row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/position/stats/${row.staff_no}" title="View Staff Position Records"><i class="fa fa-file-text-o"></i></a><button class="btn btn-warning btn-sm"><b>INACTIVE</b></button></div>`;            
                   row.start_date = '<div class="group group-xl"><a class="btn btn-success btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i>&nbsp; '+row.start_date+'</a></div>';            
                   row.end_date = '<div class="group group-xl"><a class="btn btn-danger btn-sm" href="#"><i class="fa fa-calendar-check-o fa-lg"></i>&nbsp; '+row.end_date+'</a></div>';            
                   row.unit = `<b><small>${row.unitname}</small> ${row.unitdomain != null? '<br><b><button class="btn btn-sm" style="font-size:10px;color:brown"><b>'+row.unitdomain+'</b></button>' :''}</b>`; 
                   row.nox = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                   row.staff_no += '<center><h6 style="color:seablue">'+row.nox+'</h6></center>';
                   row.post = `<a class="btn btn-lg" target="_blank" href="/hrm/position/list/${row.post}/${row.unit_id}" style="font-size:20px;">${row.post}</a>`
                   row.unit = row.unitname == null || row.unitname == 'null' ? row.post : row.unit;
                }
                return row;
            }));   
            res.json({
                draw : Number(params.draw),
                recordsTotal : Number(rowsTot.length),
                recordsFiltered : Number(rowsTot.length),
                data: data
            });  
        });


         // Add Transfer
        app.get('/hrm/addposition',isAuthenticated,isAdmin,async(req,res) => {           
            //let group = req.query.gp || 'JS';
           let rows = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           res.render('index_hr',{
               view:"addposition",
               title:"ADD POSITION",
               data: { id: 0}, units : rows,type:req.query.tp,
               user: req.session.user               
           });            
        });

       // Edit Transfer
       app.get('/hrm/editposition/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select *,date_format(start_date,'%Y-%m-%d') as start_date,date_format(end_date,'%Y-%m-%d') as end_date from position where id = "+id);
           let units = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           console.log(rows);
           res.render('index_hr',{
               view:"addposition",
               title: "EDIT POSITION",
               user: req.session.user,
               data: rows[0], units, rows,type:'edit', 
           });
       });


       // Delete Position
       app.get('/hrm/delposition/:id',isAuthenticated,isAdmin,async(req, res) => {
           let id = req.params.id;
            await dbx.query("delete from position where id = "+id);
           res.redirect('/hrm/position');              
       });  
       
       
        // Post Transfer
        app.post('/hrm/postposition',isAuthenticated,isAdmin,async(req,res)=>{ 
           const type = req.body.type;
           delete req.body.type;  
           req.body.unit_domain == '' ? delete req.body.unit_domain :''; 
           if(req.body.unit_id == 'null' || req.body.unit_id == ''){
               delete req.body.unit_id;
               delete req.body.unit_head;  
           }
           req.body.access == '' ? delete req.body.access :''; 
           const start = moment(req.body.start_date);
           const end = moment(req.body.end_date);
           const now = moment(Date.now());
           if(start <=  now && now <= end){
               req.body.active = '1'
           }else{
               req.body.active = '0'
           }
           if(req.body.id <= 0){  
               if(type == 'new' && req.body.unit_id != undefined){
                    let old_hod = await dbx.query("select * from unit where id = "+req.body.unit_id);    
                    if(req.body.access == 'SUBHEAD'){
                        // Update New Sub Head
                       await dbx.query("update unit set unit_subhead = "+req.body.staff_no+" where id = "+req.body.unit_id);
                    } else if(req.body.access == 'HEAD'){
                        // Update New Head
                        await dbx.query("update unit set unit_head = "+req.body.staff_no+" where id = "+req.body.unit_id);
                        // Update Access Roles
                        await dbx.query("update `user` set `role` = '04',`roles` = '04' where staff_no = "+req.body.staff_no);
                        // Remove Old Head Access
                        await dbx.query("update `user` set `role` = '03',`roles` = '03' where staff_no = "+old_hod[0].unit_head);
                    }
                }
                let ins = await dbx.query("insert into position set ?", req.body);  
        
           }else{  
               let ins = await dbx.query("update position set ? where id ="+req.body.id,req.body);
           }
           res.redirect('/hrm/position');                
        });


       // View Position Statistics for Staff
       app.get('/hrm/position/stats/:staff',isAuthenticated,async(req,res) => { 
           var staff = req.params.staff;        
           var rows = await dbx.query("select p.id,s.photo,p.post,p.staff_no,upper(date_format(p.start_date,'%M %d, %Y')) as start_date,upper(date_format(p.end_date,'%M %d, %Y')) as end_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as name,u.long_name as unitname, p.unit_domain as unitdomain,p.active from position p left join staff s on s.staff_no = p.staff_no left join unit u on p.unit_id = u.id where p.staff_no = "+staff);
               if(rows.length > 0){  
                   res.render('partials/hr_positionstat',{
                       view:'positionstat',
                       title:'STAFF POSITION HISTORY',
                       data: rows,
                       user: req.session.user
                   }); 
               }else{
                   res.redirect('/hrm/position');
               }    
         });

       
       // View Position Statistics for Staff
       app.get('/hrm/position/list/:post/:unit',isAuthenticated,async(req,res) => { 
        var post = req.params.post;  
        var unit = req.params.unit != null ? req.params.unit : null;        
        var rows = await dbx.query("select p.id,s.photo,p.post,p.staff_no,upper(date_format(p.start_date,'%M %d, %Y')) as start_date,upper(date_format(p.end_date,'%M %d, %Y')) as end_date,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname,' (',s.staff_no,')') as name,u.long_name as unitname, p.unit_domain as unitdomain,p.active from position p left join staff s on s.staff_no = p.staff_no left join unit u on p.unit_id = u.id where p.post = '"+post+"' and p.unit_id = "+unit+" order by start_date desc");
            if(rows.length > 0){  
                res.render('partials/hr_positiondata',{
                    view:'positiondata',
                    title:'POSITION HISTORY',
                    data: rows,
                    user: req.session.user
                }); 
            }else{
                res.redirect('/hrm/position');
            }    
       });


       
        /* TRANSFERS MODULE */

        // Transfer Page
        app.get('/hrm/transfer', async(req, res) => {
          
            let months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            let rows = await dbx.query("select count(*) as no from transfer where year(transfer_date) = year(current_date())");
            let output = `<b><u>CURRENT YEAR : ${new Date().getFullYear()} </u></b><br> <small><b>ALL ( <a target="_blank" href="/hrm/transfer/list?output=pdf&type=all&year=${new Date().getFullYear()}&month=all">${rows[0].no}</a> ) =  <em>[ ` ;
                 
            var data = await Promise.all(months.map(async (month,i) => {
                 let rows = await dbx.query("select count(*) as no from transfer where month(transfer_date) = "+(i+1)+" and year(transfer_date) = year(current_date())");
                 let output = `${month} ( <a target="_blank" href="/hrm/transfer/list?output=pdf&type=all&year=${new Date().getFullYear()}&month=${i+1}">${rows[0].no}</a> )`;
                 return output;
             }));
 
             data.unshift(output);
             data.push(' ] </em></b></small>');
            
             res.render('index_hr',{
                 view:"transfer",
                 title: "TRANSFERS",
                 data : data.join('  -- '),
                 user: req.session.user,
             });   
         });
 
 
         // Staff Module - JSON
         app.post('/hrm/transfer/gson',isAuthenticated,async(req,res) => { 
                 console.log(req.body);         
                 let sqlRec = "";
                 let sqlTot = "";
                 let where = "";           
                 const params = req.body;
                 const columns = Array(7);
                 columns[0] = 'staff_no';
                 columns[1] = 'name';
                 columns[2] = 'transdate';
                 columns[3] = 'fromunit';
                 columns[4] = 'tounit';
                 columns[5] = 'jobtitle';
                 columns[6] = 'action';
                
                 if(params.search.value != ''){
                     where += " and ";
                     where += "(s.staff_no like '%"+params.search.value.trim()+"%' ";
                     where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                     where += " or fname like '%"+params.search.value.trim()+"%' ";
                     where += " or mname like '%"+params.search.value.trim()+"%' ";
                     where += " or lname like '%"+params.search.value.trim()+"%' ";
                     where += " or j.title like '%"+params.search.value.trim()+"%' ";
                     where += " or x.long_name like '%"+params.search.value+"%' ";
                     where += " or f.long_name like '%"+params.search.value+"%') ";
                    
                     // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                 }
               
                 //let sql = "select DATE_FORMAT(t.transfer_date,'%Y-%m-%d') as transdate,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,j.title as jobtitle,x.long_name as tounit,f.long_name as fromunit,s.photo,t.id from transfer t left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join staff s on t.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id";
                 let sql = "select t.*,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox,c.long_name as geounit from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id left join unit c on p.unit_id = c.id where t.flag_delete = 0 ";
                 
                 sqlRec += sql;
                 sqlTot += sql;
                
                 if(where != ''){
                     sqlRec += where;
                     sqlTot += where;
                 }
                 sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
 
                 let rowsRec = await dbx.query(sqlRec); 
                 let rowsTot = await dbx.query(sqlTot);
                 let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                         let m = 0;
                         if(m == 0){
                            let tounit = row.tounit;
                            row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                            row.staff_no += '<center><h6 style="color:seablue">'+row.nox+'</h6></center>';
                            row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/transfer/stats/${row.nox}" title="View Transfer Records"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editransfer/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Transfer" href="/hrm/deltransfer/${row.id}" onclick="return confirm(\'Delete Transfer?\');"><i class="fa fa-trash"></i></a></div>`;            
                            //row.name = null;
                            row.transdate = row.transdate.toUpperCase();
                            row.fromunit = `<small style="color:brown;font-weight:bolder"><b>${row.fromunit}</b></small>`;
                            row.tounit = `<small style="color:green;font-weight:bolder"><b>${row.tounit}</b></small>`;
                            row.tounit += (row.geounit == tounit ? `<center><small style="font-size:8px;font-weight:bolder;padding:2px 5px;background:#f1f2f3;color:#999;border-radius:3px;border:thin solid #999;">CURRENT</small></center>` : '');
                            row.jobtitle = `<small style="font-weight:bolder;font-size:11px;"><b>${row.jobtitle}</b></small>`;
                     
                         }
                         return row;
                 }));
                         
                 res.json({
                     draw : Number(params.draw),
                     recordsTotal : Number(rowsTot.length),
                     recordsFiltered : Number(rowsTot.length),
                     data: data
                 });    
         
         });
 
 
          // Add Transfer
          app.get('/hrm/addtransfer',isAuthenticated,isAdmin,async(req,res) => {           
              //let group = req.query.gp || 'JS';
             let rows = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
             res.render('index_hr',{
                 view:"addtransfer",
                 title:"ADD TRANSFER",
                 data: { id: 0}, units : rows,type:req.query.tp,
                 user: req.session.user               
             });            
          });
 
              // Edit Transfer
         app.get('/hrm/editransfer/:id',isAuthenticated,isAdmin,async(req,res) => { 
             let id = req.params.id;
             let rows = await dbx.query("select *,date_format(transfer_date,'%Y-%m-%d') as transfer_date,date_format(approved_date,'%Y-%m-%d') as approved_date from transfer where id = "+id);
             let units = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
             console.log(rows);
             res.render('index_hr',{
                 view:"addtransfer",
                 title: "EDIT TRANSFER",
                 user: req.session.user,
                 data: rows[0], units, rows,type:'edit', 
             });
         });
 
 
         // Delete Transfer
         app.get('/hrm/deltransfer/:id',isAuthenticated,isAdmin,async(req, res) => {
             let id = req.params.id;
             // Get Current Unit of Staff and compare to the to_unit
             let st = await dbx.query("select p.id as pid,p.unit_id as new_unit,t.to_unit,from_unit from transfer t left join staff s on s.staff_no = t.staff_no left join promotion p on p.id = s.promo_id where t.id = "+id);
             if(st.length > 0 && (st[0].new_unit == st[0].to_unit)){
                 await dbx.query("update promotion set unit_id = "+st[0].from_unit+" where id = "+st[0].pid);
             }
             await dbx.query("update transfer set flag_delete = 1 where id = "+id);
             res.redirect('/hrm/transfer');              
         });  
         
         
          // Post Transfer
          app.post('/hrm/postransfer',isAuthenticated,isAdmin,async(req,res)=>{ 
             let old_unit = req.body.unit_id;  
             let type = req.body.type;  
             delete req.body.type;  
             delete req.body.unit_id; 
             req.body.staff_no = req.body.staff_no != undefined ? req.body.staff_no : req.session.user.staff_no; // Staff Portal Fix
             if(req.body.id <= 0){  
                 req.body.approve_status = 1; 
                 req.body.request_by = null;  
                 req.body.request_date = null; 
 
                 // On New Transfer  -- Update Promotion of current Unit  
                 let uid = await dbx.query("select p.id from staff s left join promotion p on p.id = s.promo_id where s.staff_no = "+parseInt(req.body.staff_no));
                 if(type == 'new' && uid.length > 0){
                     if(uid[0]['id'] != null && uid[0]['id'] != ''){
                         console.log("ID");
                         await dbx.query("update promotion set unit_id = "+req.body.to_unit+" where id = "+uid[0]['id']);
                     } 
                 }
                 let ins = await dbx.query("insert into transfer set ?", req.body);  
             
             }else{  
                 // If Update, Check if current unit =  
                 let uid = await dbx.query("select p.unit_id as unit_id,p.id from staff s left join promotion p on p.id = s.promo_id where s.staff_no = "+parseInt(req.body.staff_no));
                 if(type == 'edit' && uid.length > 0){
                     if((uid[0]['id'] != null && uid[0]['id'] != '') && uid[0]['unit_id'] == old_unit){
                         await dbx.query("update promotion set unit_id = "+req.body.to_unit+" where id = "+uid[0]['id']);
                     } 
                 } 
                 // Log Transfer Record      
                 let ins = await dbx.query("update transfer set ? where id ="+req.body.id,req.body);
             }
             res.redirect('/hrm/transfer');                
          });
 
 
 
           // Post Transfer Request
           app.post('/hrm/postransfereq',isAuthenticated,async(req,res)=>{ 
             req.body.staff_no = req.session.user.staff_no;
             if(req.body.id <= 0){  
                 req.body.staff_no = req.session.user.staff_no; 
                 req.body.applied_date = new Date(); 
                 let ins = await dbx.query("insert into transfer_request set ?", req.body);  
             }else{  
                 console.log(req.body);
                 let ins = await dbx.query("update transfer_request set ? where id ="+req.body.id,req.body);
             }
             res.redirect('/hrm/st/transfer/request');                
          });
 
         // Delete Transfer
         app.get('/hrm/st/transferdel/:id',isAuthenticated,async(req, res) => {
             var id = req.params.id;      
             await dbx.query("delete from transfer_request where id = "+id);
             res.redirect('/hrm/st/transfer/request');              
         });  
 
 
         // View Leave Statistics for Staff
         app.get('/hrm/transfer/stats/:staff',isAuthenticated,async(req,res) => { 
             var staff = req.params.staff;        
             var rows = await dbx.query("select t.*,year(transfer_date) as year,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where t.staff_no = "+staff);
                 if(rows.length > 0){  
                     res.render('partials/hr_transferstat',{
                         view:'transferstat',
                         title:'TRANSFER STATISTICS',
                         data: rows,
                         user: req.session.user
                     }); 
                 }else{
                     res.redirect('/hrm/transfer');
                 }    
           });
 
         
         // Transfers List
         app.get('/hrm/transfer/list',isAuthenticated,async(req,res) => { 
                 var type = req.query.type, year = req.query.year, month = req.query.month, output = req.query.output;
                 if(output == 'pdf'){
                     var sql = "select t.*,year(transfer_date) as year,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(transfer_date,'%D %M, %Y') as transdate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where s.staff_status IN ('TEMPORAL','PERMANENT') ";
                         sql += (year != 'all' && year != '' ? " and year(t.transfer_date) = "+year : '');
                         sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                         sql += (month != 'all' ? " and month(t.transfer_date) = "+month : '');
                     var dt = new Date(year,(month != 'all' ? month : 1),1);
                     var period = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+(year != '' ? year : '')+(month != 'all' ? "/"+dt.getMonth() : '');
                     var rows = await dbx.query(sql);
                     if(rows.length > 0){  
                         res.render('partials/hr_transferlist',{
                             view:'transferlist',
                             title:'TRANSFER LIST',
                             data: rows,period,
                             user: req.session.user
                         }); 
                     }else{
                         res.redirect('/hrm/transfer/#page2');
                     }    
                 }else{
                     var sql = "select t.staff_no as 'Staff Number',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'Full Name',date_format(transfer_date,'%Y-%m-%d') as 'Transfer Date',x.long_name as 'Transferred To',f.long_name as 'Transferred From',j.title as 'Current Post' from transfer t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id where s.staff_status IN ('TEMPORAL','PERMANENT') ";
                         sql += (year != 'all' && year != '' ? " year(t.transfer_date) = "+year : '');
                         sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                         sql += (month != 'all' ? " and month(t.transfer_date) = "+month : '');
                     var period = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+(year != '' ? year : '')+(month != 'all' ? "/"+dt.getMonth() : '');
                     var rows = await dbx.query(sql);
                     if(rows.length > 0){  
                         res.xls(period+'.xlsx',rows); 
                     }else{
                         res.redirect('/hrm/transfer/#page2');
                     }    
                 }
         });
 
 
 
          // Transfers Requests
          app.post('/hrm/transfer/request/gson',isAuthenticated,async(req,res) => { 
             console.log(req.body);         
             let sqlRec = "";
             let sqlTot = "";
             let where = "";           
             const params = req.body;
             const columns = Array(7);
             columns[0] = 'staff_no';
             columns[1] = 'name';
             columns[2] = 'reason';
             columns[3] = 'profile';
             columns[4] = 'tounit';
             columns[5] = 'status';
             columns[6] = 'action';
            
             if(params.search.value != ''){
                 where += " and ";
                 where += "(s.staff_no like '%"+params.search.value.trim()+"%' ";
                 where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                 where += " or fname like '%"+params.search.value.trim()+"%' ";
                 where += " or mname like '%"+params.search.value.trim()+"%' ";
                 where += " or lname like '%"+params.search.value.trim()+"%' ";
                 where += " or j.title like '%"+params.search.value.trim()+"%' ";
                 where += " or x.long_name like '%"+params.search.value+"%' ";
                 where += " or t.status like '%"+params.search.value+"%' ";
                 where += " or f.long_name like '%"+params.search.value+"%') ";
                
                 // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
             }
           
             //let sql = "select DATE_FORMAT(t.transfer_date,'%Y-%m-%d') as transdate,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,j.title as jobtitle,x.long_name as tounit,f.long_name as fromunit,s.photo,t.id from transfer t left join unit x on x.id = t.to_unit left join unit f on f.id = t.from_unit left join staff s on t.staff_no = s.staff_no left join promotion p on s.promo_id = p.id left join job j on p.job_id = j.id";
             let sql = "select t.*,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(t.applied_date,'%D %M, %Y') as appliedate,s.photo,x.long_name as tounit,f.long_name as fromunit,j.title as jobtitle,t.id,s.staff_no as nox from transfer_request t left join staff s on s.staff_no = t.staff_no left join unit x on x.id = t.to_unit left join promotion p on s.promo_id = p.id left join unit f on f.id = p.unit_id left join job j on p.job_id = j.id ";
             
             sqlRec += sql;
             sqlTot += sql;
            
             if(where != ''){
                 sqlRec += where;
                 sqlTot += where;
             }
             sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length'];
 
             let rowsRec = await dbx.query(sqlRec); 
             let rowsTot = await dbx.query(sqlTot);
             let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                     let m = 0;
                     if(m == 0){
                        let tounit = row.tounit;
                        row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.staff_no += '<center><h6 style="color:seablue">'+row.nox+'</h6></center>';
                        //row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/transfer/stats/${row.nox}" title="View Transfer Records"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editransfer/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Transfer" href="/hrm/deltransfer/${row.id}" onclick="return confirm(\'Delete Transfer?\');"><i class="fa fa-trash"></i></a></div>`;   
                        row.action = `<div class="btn-group" style="width:160px;"><button class="btn btn-sm" style="font-size:10px;color:darkred"><b>${row.transfer_status}</b></button><button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="caret"></span></button>
                                         <ul class="dropdown-menu">
                                             <li><a class="btn btn-sm" style="font-size:10px;color:seagreen" title="Approve Transfer Request" onclick="return confirm('Approve Transfer request?')" href="/hrm/transfereq/approve/${row.id}"><i class="fa fa-check"></i>&nbsp;&nbsp;<b>APPROVE</b> </a></li> 
                                             <li><a class="btn btn-sm" style="font-size:10px;color:brown" title="Reject Transfer Request" onclick="return confirm('Reject Trasfer request')" href="/hrm/transfereq/reject/${row.id}"><i class="fa fa-remove"></i>&nbsp;&nbsp;<b>REJECT</b></a></li> 
                                         </ul>
                                     </div>`         
                        //row.name = null;
                        row.fromunit = `<small style="color:brown;font-weight:bolder"><b>${row.fromunit}</b></small>`;
                        row.tounit = `<small style="color:green;font-weight:bolder"><b>${row.tounit}</b></small>`;
                        row.tounit += (row.geounit == tounit ? `<center><small style="font-size:8px;font-weight:bolder;padding:2px 5px;background:#f1f2f3;color:#999;border-radius:3px;border:thin solid #999;">CURRENT</small></center>` : '');
                        row.jobtitle = `<small style="font-weight:bolder;font-size:11px;"><b>${row.jobtitle}</b></small>`;
                        row.profile = `<center>${row.fromunit}<br>${row.jobtitle}</center>`;
                        row.status = `<small style="font-weight:bolder;font-size:11px;"><b>${row.transfer_status}</b></small>`;
                       
                 
                     }
                     return row;
             }));
                     
             res.json({
                 draw : Number(params.draw),
                 recordsTotal : Number(rowsTot.length),
                 recordsFiltered : Number(rowsTot.length),
                 data: data
             });    
     
     });
 

      /* DISCIPLINARY - MODULE */

        // Disciplinary Page
        app.get('/hrm/discipline', (req, res) => {
            res.render('index_hr', {
                view: 'discipline',
                title: 'DISCIPLINARY RECORDS',
                user: req.session.user
            });
        });

       

        //Disciplinary - JSON
        app.post('/hrm/discipline/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'staff_no';
                columns[1] = 'name';
                columns[2] = 'unitname';
                columns[3] = 'jobtitle';
                columns[4] = 'action_type';
                columns[5] = 'issue_date';
                columns[6] = 'reason';
                columns[7] = 'status';  
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or mobile like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select s.*,upper(DATE_FORMAT(d.issue_date,'%M %d, %Y')) as issue_date,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,d.staff_no as nox,u.long_name as unitname,j.title as jobtitle,d.action_type,d.reason,d.id from disciplinary d left join staff s on s.staff_no = d.staff_no left join promotion p on p.id = s.promo_id left join unit u on u.id = p.unit_id left join job j on j.id = p.job_id where d.active = '1' ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                            row.phone = row.mobile; 
                            row.unit = row.unitname; 
                            row.reason = `<small>${row.reason}</small>`
                            row.issue_date = `<small class="btn btn-sm btn-warning" ><i class="fa fa-calendar-check-o fa-lg"></i> ${row.issue_date}</small>`
                            row.action_type = `<small class="btn btn-sm">${row.action_type}</small>`
                            row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                            row.staff_no += '<center><h5 style="color:seablue">'+row.nox+'</h5></center>';
                            row.name += '<br><br><center><h5 style="color:seablue;font-size:14px"><em>'+row.token+'</em></h5></center>';
                            row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/discipline/file/${row.id}" title="View Disciplinary Record"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editdiscipline/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Record" href="/hrm/deldiscipline/${row.id}" onclick="return confirm(\'Delete Record?\');"><i class="fa fa-trash"></i></a></div>`;            
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });

    
        // Add New Discipline
        app.get('/hrm/adddiscipline',isAuthenticated,isAdmin,async(req,res) => {           
           res.render('index_hr',{
               view:"adddiscipline",
               title:"ADD NEW DISCIPLINARY RECORD",
               row: { id: 0},
               user: req.session.user               
           });            
        });

            // Edit Discipline
       app.get('/hrm/editdiscipline/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select *, date_format(issue_date,'%Y-%m-%d') as issue_date from disciplinary where id = "+id);
           res.render('index_hr',{
               view:"adddiscipline",
               title: "EDIT DISCIPLINARY RECORD",
               user: req.session.user,
               row: rows[0],
           });
       });


       // Delete Discipline 
       app.get('/hrm/deldiscipline/:id',isAuthenticated,isAdmin,async(req, res) => {
           let id = req.params.id;
           await dbx.query("delete from disciplinary where id = "+id);
           res.redirect('/hrm/discipline');              
       });  
       
       
        // Post Disciplinary Data
        app.post('/hrm/postdiscipline',isAuthenticated,isAdmin,async(req,res)=>{ 
           const start = moment(req.body.start_date,'YYYY-MM-DD');
           if(req.body.id <= 0){  
               let ins = await dbx.query("insert into disciplinary set ?", req.body); 
           }else{  
               let ins = await dbx.query("update disciplinary set ? where id = "+req.body.id,req.body);
           }
           res.redirect('/hrm/discipline');                
        });


     


         /* HR REQUESTS WORKSPACE - MODULE */

        // Requests Page
        app.get('/hrm/workspace', (req, res) => {
            res.render('index_hr', {
                view: 'workspace',
                title: 'DHR REQUESTS MANAGER',
                user: req.session.user
            });
        });

       

        //Requests on Desk - JSON
        app.post('/hrm/workdesk/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(8);
                columns[0] = 'staff_no';
                columns[1] = 'name';
                columns[2] = 'unitname';
                columns[3] = 'jobtitle';
                columns[4] = 'action_type';
                columns[5] = 'issue_date';
                columns[6] = 'reason';
                columns[7] = 'status';  
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or j.title like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or mobile like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select s.*,upper(DATE_FORMAT(d.issue_date,'%M %d, %Y')) as issue_date,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,d.staff_no as nox,u.long_name as unitname,j.title as jobtitle,d.action_type,d.reason,d.id from disciplinary d left join staff s on s.staff_no = d.staff_no left join promotion p on p.id = s.promo_id left join unit u on u.id = p.unit_id left join job j on j.id = p.job_id where d.active = '1' ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                            row.phone = row.mobile; 
                            row.unit = row.unitname; 
                            row.reason = `<small>${row.reason}</small>`
                            row.issue_date = `<small class="btn btn-sm btn-warning" ><i class="fa fa-calendar-check-o fa-lg"></i> ${row.issue_date}</small>`
                            row.action_type = `<small class="btn btn-sm">${row.action_type}</small>`
                            row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                            row.staff_no += '<center><h5 style="color:seablue">'+row.nox+'</h5></center>';
                            row.name += '<br><br><center><h5 style="color:seablue;font-size:14px"><em>'+row.token+'</em></h5></center>';
                            row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/discipline/file/${row.id}" title="View Disciplinary Record"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editdiscipline/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Record" href="/hrm/deldiscipline/${row.id}" onclick="return confirm(\'Delete Record?\');"><i class="fa fa-trash"></i></a></div>`;            
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });

    
        // Add New Discipline
        app.get('/hrm/adddiscipline',isAuthenticated,isAdmin,async(req,res) => {           
           res.render('index_hr',{
               view:"adddiscipline",
               title:"ADD NEW DISCIPLINARY RECORD",
               row: { id: 0},
               user: req.session.user               
           });            
        });

            // Edit Discipline
       app.get('/hrm/editdiscipline/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select *, date_format(issue_date,'%Y-%m-%d') as issue_date from disciplinary where id = "+id);
           res.render('index_hr',{
               view:"adddiscipline",
               title: "EDIT DISCIPLINARY RECORD",
               user: req.session.user,
               row: rows[0],
           });
       });


       // Delete Discipline 
       app.get('/hrm/deldiscipline/:id',isAuthenticated,isAdmin,async(req, res) => {
           let id = req.params.id;
           await dbx.query("delete from disciplinary where id = "+id);
           res.redirect('/hrm/discipline');              
       });  
       
       
        // Post Disciplinary Data
        app.post('/hrm/postdiscipline',isAuthenticated,isAdmin,async(req,res)=>{ 
           const start = moment(req.body.start_date,'YYYY-MM-DD');
           if(req.body.id <= 0){  
               let ins = await dbx.query("insert into disciplinary set ?", req.body); 
           }else{  
               let ins = await dbx.query("update disciplinary set ? where id = "+req.body.id,req.body);
           }
           res.redirect('/hrm/discipline');                
        });


     


       



         /* PAPERS - MODULE */

        // Paper - Journal & Memos
        app.get('/hrm/paper',isAuthenticated,isAdmin,(req, res) => {
            res.render('index_hr', {
                view: 'paper',
                title: 'SUBMITTED PAPERS',
                user: req.session.user
            });
        });

       

        //Disciplinary - JSON
        app.post('/hrm/paper/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(7);
                columns[0] = 'title';
                columns[1] = 'staff_no';
                columns[2] = 'type';
                columns[3] = 'valid';
                columns[4] = 'used';
                columns[5] = 'link';
                columns[6] = 'status';
                
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " where (s.staff_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or valid = '"+(params.search.value.trim().toLowerCase() == 'valid'? '1':'')+"' ";
                    where += " or valid = '"+(params.search.value.trim().toLowerCase() == 'invalid'? '0':'')+"' ";
                    where += " or used = '"+(params.search.value.trim().toLowerCase() == 'used'? '1':'')+"' ";
                    where += " or used = '"+(params.search.value.trim().toLowerCase() == 'unsed'? '0':'')+"' ";
                    where += " or d.type like '%"+params.search.value+"%' ";
                    where += " or d.application_type like '%"+params.search.value+"%' ";
                    where += " or d.title like '%"+params.search.value.trim()+"%' ";
                    //where += " or d.description like '%"+params.search.value.trim()+"%') ";
                   // where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                   // where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                   // where += " or mobile like '%"+params.search.value.trim()+"%') ";
                }
                
                let sql = "select d.*,upper(DATE_FORMAT(d.date_submitted,'%M %d, %Y')) as date_submitted,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,d.staff_no as nox,v.path from paper d left join staff s on s.staff_no = d.staff_no left join doc v on d.attachment = v.id ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                            row.title = `<small class="btn btn-sm" style="font-size:10px"><b>${row.title}</b></small>`; 
                            row.staff_no = `<small class="btn btn-sm" style="font-size:11px">${row.name} <em style="font-size:10px;color:brown">(${row.staff_no})</em></small>`; 
                            row.type = `<small class="btn btn-sm" style="font-size:11px">${row.type}<br><center><em style="font-size:10px;color:brown">${row.type == 'JOURNAL' ? '('+row.journal+')' : ''}</em></center></small>`; 
                            row.valid = row.valid == '1'? `<small class="btn btn-sm" style="color:seagreen;font-size:11px;"><b>VALID</b></small>`:`<small class="btn btn-sm" style="color:brown;font-size:11px;"><b>INVALID</b></small>`; 
                            row.used = row.used == '1'? `<small class="btn btn-sm" style="font-size:11px;"><a href="" target="_blank" href="${row.application_type == 'PROMOTION' ? '/hrm/promorequest/stats/'+row.nox:''}"><b style="color:seablue">${row.application_type}</b></a></small>`:`<small class="btn btn-sm" style="font-size:11px;"><em><b>NONE</b></em></small>`; 
                            row.link = (row.link != null || row.attachment) ? `<div class="btn-group" style="width:155px;margin-left:-15px;">${row.link != null ? '<a href="'+row.link+'" target="_blank" class="btn btn-sm"><i class="fa fa-link"></i></a>': ''}${row.attachment != null ? '<a href="'+row.path+'" target="_blank" class="btn btn-sm"><i class="fa fa-file-pdf-o text-danger"></i></a>':''}</div><center><small class="" style="font-size:7px;margin-left:-85px;"><em><b> SUBMITTED ON: ${row.date_submitted}</b></em></small></center>`:`<small class="btn btn-sm" style="font-size:9px;color:brown;"><em><b>NO RESOURCE</b></em></small><center><small class="" style="font-size:7px"><em><b>ON: ${row.date_submitted}</b></em></small></center>`;
                            row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/paper/stats/${row.id}" title="View Paper" onclick="return confirm('View Paper?')"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editpaper/${row.id}" title="Edit Paper"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Paper" href="/hrm/delpaper/${row.id}" onclick="return confirm(\'Delete Paper?\');"><i class="fa fa-trash"></i></a></div>`;            
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });

    
        // Add New Paper
        app.get('/hrm/addpaper',isAuthenticated,isAdmin,async(req,res) => {           
           res.render('index_hr',{
               view:"addpaper",
               title:"ADD PAPER",
               row: { id: 0},
               user: req.session.user               
           });            
        });

            // Edit Paper
       app.get('/hrm/editpaper/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select d.*, date_format(date_submitted,'%Y-%m-%d') as date_submitted,v.path from paper d left join doc v on d.attachment = v.id where d.id = "+id);
           res.render('index_hr',{
               view:"addpaper",
               title: "EDIT PAPER",
               user: req.session.user,
               row: rows[0],
           });
       });


       // Delete Paper 
       app.get('/hrm/delpaper/:id',isAuthenticated,isAdmin,async(req, res) => {
           let id = req.params.id;
           await dbx.query("delete from paper where id = "+id);
           res.redirect('/hrm/paper');              
       });  
       
       
       // Post Paper Data
       app.post('/hrm/postpaper',isAuthenticated,isAdmin,doc,async(req,res)=>{ 
           req.body.attachment == ''? delete req.body.attachment : '';
           if(req.files.attachment){
                const time = new Date();
                const filename = req.body.type+'_'+req.body.staff_no+'_'+(time.getFullYear()+'.'+time.getMonth()+'.'+time.getDate()+'.'+time.getHours()+'.'+time.getMinutes())+'.pdf';
                const docfilepath = './public/docs/staff/'+req.body.staff_no+'/'+filename;
                const docdbpath = '/public/docs/staff/'+req.body.staff_no+'/'+filename;
                const folder = './public/docs/staff/'+req.body.staff_no;
                if(!fs.existsSync(folder)){
                   fs.mkdirSync(folder);
                }
                moveFile(req.files.attachment[0].path,docfilepath);      
                // Save into Document table
                let docinfo = {title:req.body.type+' OF STAFF : '+req.body.staff_no+' ON '+(time.getFullYear()+'-'+time.getMonth()+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()),path:docdbpath, staff_no:req.body.staff_no, active:'1'}
                let docins = await dbx.query("insert into doc set ?",docinfo);
                req.body.attachment = docins.insertId;
           }
           if(req.body.id <= 0){  
                req.body.date_submitted = new Date();
               let ins = await dbx.query("insert into paper set ?", req.body); 
           }else{  
               let ins = await dbx.query("update paper set ? where id = "+req.body.id,req.body);
           }
           res.redirect('/hrm/paper');                
       });


        // Paper Statistics
        app.get('/hrm/paper/stats/:id',isAuthenticated,isAdmin,async(req,res) => {          
            var id = req.params.id;        
            var rows = await dbx.query("select d.*,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,date_format(date_submitted,'%Y-%m-%d') as date_submitted,v.path from paper d left join doc v on d.attachment = v.id left join staff s on d.staff_no = s.staff_no where d.id = "+id);
                if(rows.length > 0){  
                    res.render('partials/hr_paperstat',{
                        view:'paperstat',
                        title:'PAPER DETAIL',
                        data: rows[0],
                        user: req.session.user
                    }); 
                }else{
                    res.redirect('/hrm/paper');
                }              
        });


         // Paper All Papers Stats
         app.get('/hrm/paper/list/:staff',isAuthenticated,async(req,res) => {          
            var staff = req.params.staff;        
            var rows = await dbx.query("select d.*,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.photo,date_format(date_submitted,'%Y/%m') as year,v.path from paper d left join doc v on d.attachment = v.id left join staff s on d.staff_no = s.staff_no where d.staff_no = "+staff);
                if(rows.length > 0){  
                    res.render('partials/hr_paperlist',{
                        view:'paperlist',
                        title:'PAPERS SUBMITTED',
                        data: rows,
                        user: req.session.user
                    }); 
                }else{
                    res.redirect('/hrm/paper');
                }              
        });


        
         // All Papers Stats
         app.get('/hrm/paper/gson/:staff',isAuthenticated,async(req,res) => {          
            var staff = req.params.staff;        
            var rows = await dbx.query("select d.*,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.photo,date_format(date_submitted,'%Y/%m') as year,v.path from paper d left join doc v on d.attachment = v.id left join staff s on d.staff_no = s.staff_no where  (used = '0' and valid = '1' and d.staff_no = "+staff+")");
                if(rows.length > 0){  
                    res.json({success:true,data:rows}); 
                }else{
                    res.json({success:false,data:null}); 
                }              
        });


        

        /* NSS - MODULE */

        // NSS Page
            app.get('/hrm/nss', (req, res) => {
            res.render('index_hr', {
                view: 'nss',
                title: 'NATIONAL SERVICE SCHEME PERSONNELS',
                user: req.session.user
            });
        });

       

        // NSS Active - JSON
        app.post('/hrm/nss/active/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(9);
                columns[0] = 'nss_no';
                columns[1] = 'name';
                columns[2] = 'gender';
                columns[3] = 'phone';
                columns[4] = 'email';
                columns[5] = 'unit';
                columns[6] = 'inyear';
                columns[7] = 'outyear';  
                columns[8] = 'status';  
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (s.nss_no like '%"+params.search.value.trim()+"%' ";
                    where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                    where += " or fname like '%"+params.search.value.trim()+"%' ";
                    where += " or mname like '%"+params.search.value.trim()+"%' ";
                    where += " or lname like '%"+params.search.value.trim()+"%' ";
                    where += " or email like '%"+params.search.value.trim()+"%' ";
                    where += " or u.long_name like '%"+params.search.value+"%' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                    where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                    where += " or mobile like '%"+params.search.value.trim()+"%') ";
                    // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
                }
                
                let sql = "select upper(DATE_FORMAT(s.start_date,'%M-%Y')) as inyear,upper(DATE_FORMAT(s.end_date,'%M-%Y')) as outyear,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.nss_no as nox,s.*,u.long_name as unitname from nss s left join unit u on u.id = s.unit_id where s.active = '1' ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                        row.phone = row.mobile; 
                        row.unit = row.unitname; 
                        row.nss_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                        row.nss_no += '<center><h5 style="color:seablue">'+row.nox+'</h5></center>';
                        row.name += '<br><br><center><h5 style="color:seablue;font-size:14px"><em>'+row.token+'</em></h5></center>';
                        /*row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;">
                                         ${req.session.user.adminrole != '01' ?`<a class="btn btn-primary btn-sm" href="/hrm/nss/page/${row.nox}" title="Goto Personnel's Folder"><i class="fa fa-folder-open"></i></a>`:``}
                                         ${req.session.user.adminrole == '01' ?`<a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/nss/view/${row.nox}"><i class="fa fa-file-text-o"></i></a>`:``}
                                         ${req.session.user.adminrole == '08' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Delete NSS Folder" href="/hrm/delnss/${row.nox}" onclick="return confirm(\'Delete Personnel?\');"><i class="fa fa-trash"></i></a>`:``}
                                      </div>`;  */
                        row.status = `<div class="btn-group" style="width:155px;margin-left:-50px;"><a class="btn btn-sm btn-primary" target="_blank" href="/hrm/nss/file/${row.id}" title="View Personnel Record"><i class="fa fa-file-text-o"></i></a><a class="btn btn-default btn-sm" href="/hrm/editnss/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Record" href="/hrm/delnss/${row.id}" onclick="return confirm(\'Delete Record?\');"><i class="fa fa-trash"></i></a></div>`;            
                                    
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });

    
        // Inactive Staff Module - JSON
        app.post('/hrm/nss/inactive/gson',isAuthenticated,async(req,res) => { 
            console.log(req.body);         
            let sqlRec = "";
            let sqlTot = "";
            let where = "";           
            const params = req.body;
            const columns = Array(9);
            columns[0] = 'staff_no';
            columns[1] = 'name';
            columns[2] = 'gender';
            columns[3] = 'phone';
            columns[4] = 'job_title';
            columns[5] = 'long_name';
            columns[6] = 'staff_status';
            columns[7] = 'exit_date';          
            columns[8] = 'action';          
            
            if(params.search.value != ''){
                //where += " where ";
                where += " and (s.staff_no like '%"+params.search.value.trim()+"%' ";
                where += " or concat(fname,ifnull(concat(' ',mname),''),' ',lname) like '%"+params.search.value.trim()+"%' ";
                where += " or fname like '%"+params.search.value.trim()+"%' ";
                where += " or mname like '%"+params.search.value.trim()+"%' ";
                where += " or lname like '%"+params.search.value.trim()+"%' ";
                where += " or b.title like '%"+params.search.value.trim()+"%' ";
                where += " or u.long_name like '%"+params.search.value+"%' ";
                where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'male'? 'M':'')+"' ";
                where += " or gender = '"+(params.search.value.trim().toLowerCase() == 'female'? 'F':'')+"' ";
                where += " or phone like '%"+params.search.value.trim()+"%') ";
                // where += " or date_format(dob,'%Y-%m-%d') like '%date_format("+(new Date(params.search.value))+",'%Y-%m-%d')%' )";
            }
            
            let sql = "select DATE_FORMAT(s.exit_date,'%Y-%m-%d') as exit_date,concat(fname,ifnull(concat(' ',mname),''),' ',lname) as name,s.staff_no as nox,s.*,u.*,sc.*,b.title as job_title,sc.grade as scale from staff s left join promotion p on s.promo_id = p.id left join job b on p.job_id = b.id left join unit u on u.id = p.unit_id left join scale sc on sc.id = p.scale_id where s.flag_delete = 0 and (s.staff_status != 'TEMPORAL' and s.staff_status != 'PERMANENT') ";
            sqlRec += sql;
            sqlTot += sql;

            if(where != ''){
                sqlRec += where;
                sqlTot += where;
            }
            sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";

            let rowsRec = await dbx.query(sqlRec); 
            let rowsTot = await dbx.query(sqlTot);
            let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                    let m = 0;
                    if(m == 0){
                    row.staff_no = (row.photo != null ? '<img src="'+row.photo+'" style="height:50px;text-align:center;margin:3px auto;border-radius:5px;display:block;"/>':'<a href="javascript:alert(\'Please take Snapshot of Staff!\');" style="display:block"><i class="icon fa fa-camera fa-3x" style="border-radius:50%;margin:3px auto;padding-top:10px;color:#fff;text-align:center;width:60px;height:60px;background:brown;"></i></a>');
                    row.staff_no += '<center><h5 style="'+(row.staff_group != null ? row.staff_group+'-':'')+(row.staff_status == 'DEAD' ? 'color:#eea236' : (row.staff_status == 'RETIRED' ? 'color:seagreen' : (row.staff_status == null ? 'color:seablue' : 'color:brown')))+'">'+row.nox+'</h5></center>';
                    row.action = `<div class="btn-group" style="width:155px;margin-left:-50px;">
                                     ${req.session.user.adminrole == '07' || req.session.user.adminrole == '08' ?`<a class="btn btn-primary btn-sm" href="/hrm/staff/page/${row.nox}" title="Goto Staff Folder"><i class="fa fa-folder-open"></i></a>`:``}
                                     <a class="btn btn-primary btn-sm " target="_blank" title="View Staff within Unit" href="/hrm/staff/view/${row.nox}"><i class="fa fa-file-text-o"></i></a>
                                     ${req.session.user.adminrole != '01' ?`<a class="btn btn-default btn-sm" style="display:block;" title="Upload Staff Photo" href="/hrm/photos/${row.nox}" onclick="return confirm(\'Upload Staff Photo?\');"><i class="fa fa-photo"></i></a>`:``}
                                  </div>`;  
                    row.staff_status = `<button class="btn btn-sm"><b><small>${row.staff_status}</small></b></button>`; 
                    row.exit_date = row.exit_date != null ? `<button class="btn btn-sm btn-warning"><b> <i class="fa fa-calendar"></i>&nbsp;&nbsp;<small>${row.staff_status}</small></b></button>` : '';         
                    }
                    return row;
            }));
            res.json({
                draw : Number(params.draw),
                recordsTotal : Number(rowsTot.length),
                recordsFiltered : Number(rowsTot.length),
                data: data
            });    
        });


         // Add New Personnel
         app.get('/hrm/addnss',isAuthenticated,isAdmin,async(req,res) => {           
           let rows = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           res.render('index_hr',{
               view:"addnss",
               title:"ADD NEW PERSONNEL FILE",
               data: { id: 0}, units : rows,
               user: req.session.user               
           });            
        });

            // Edit Personnel
       app.get('/hrm/editnss/:id',isAuthenticated,isAdmin,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select *,date_format(start_date,'%Y-%m-%d') as start_date,date_format(end_date,'%Y-%m-%d') as end_date,date_format(dob,'%Y-%m-%d') as dob from nss where id = "+id);
           let units = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           console.log(rows);
           res.render('index_hr',{
               view:"addnss",
               title: "EDIT PERSONNEL FILE",
               user: req.session.user,
               data: rows[0], units, rows, 
           });
       });


       // Delete Personnel File/Record
       app.get('/hrm/delnss/:id',isAuthenticated,isAdmin,async(req, res) => {
           let id = req.params.id;
           //await dbx.query("update nss set flag_delete = 1 where id = "+id);
           await dbx.query("delete from nss where id = "+id);
           res.redirect('/hrm/nss');              
       });  
       
       
        // Post Personnel File
        app.post('/hrm/postnss',isAuthenticated,isAdmin,nssphoto,async(req,res)=>{ 
           const start = moment(req.body.start_date,'YYYY-MM-DD');
           const end = moment(req.body.end_date,'YYYY-MM-DD');
           const now = moment();
           delete req.body.nssphoto;
           delete req.body.nssform;
           if(req.file){
               let photopath = './public/nsspic/'+req.body.nss_no+'.jpg';
               req.body.nssphoto = '/public/nsspic/'+nss_no+'.jpg';
                moveFile(__dirname+'/'+req.file.filename,photopath);      
                console.log('Photo uploaded successfully'); 
           }
           /*
           if(req.file && req.file.nssdoc){
                let docpath = './public/nssdoc/'+req.file.filename;
                req.body.nssdoc = '/public/nssdoc/'+req.file.filename
                moveFile(__dirname+'/'+req.file.filename,docpath);      
                console.log('Document uploaded successfully'); 
           }
           */
           req.body.active = (start <= now && now <= end) ? '1' : '0';
           req.body.token = Date.now();
           console.log(req.body)
           if(req.body.id <= 0){  
               let ins = await dbx.query("insert into nss set ?", req.body); 
               // Send SMS Message
               const mobile = req.body.mobile != null ? req.body.mobile : '0277675089';
               const msg = `Please goto the https://staffportal.ucc.edu.gh/nss/portal, Login with Token : ${req.body.token} and your NSS Number`;
               //sms(mobile,msg);
           }else{  
               let ins = await dbx.query("update nss set ? where id = "+req.body.id,req.body);
           }

           res.redirect('/hrm/nss');                
        });


       // View Personnel HR File
       app.get('/hrm/nss/file/:id',isAuthenticated,async(req,res) => { 
           var id = req.params.id;        
           var rows = await dbx.query("select s.*,date_format(start_date,'%Y-%m-%d') as start_date,date_format(end_date,'%Y-%m-%d') as end_date,date_format(dob,'%Y-%m-%d') as dob,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,u.long_name as unitname,nss_no as nox from nss s left join unit u on u.id = s.unit_id where s.id = "+id);
               if(rows.length > 0){  
                   const age = moment().diff(moment(rows[0].dob,'YYYY-MM-DD'),'years');
                   console.log(age);
                   rows[0].age = age;
                   rows[0].filename = rows[0].nss_form != null ? path.basename(rows[0].nss_form) : null;
                   res.render('partials/hr_nssfile',{
                       view:'nssfile',
                       title:'NATIONAL SERVICE PERSONNEL FILE',
                       data: rows[0],
                       user: req.session.user
                   }); 
               }else{
                   res.redirect('/hrm/nss');
               }    
         });



        /* DHR CIRCULARS */


        // Circular Page
        app.get('/hrm/circular', (req, res) => {
            res.render('index_hr', {
                view: 'notifier',
                title: 'UNIVERSITY CIRCULARS',
                user: req.session.user
            });
        });

       

        // Circulars - JSON
        app.post('/hrm/circular/gson',isAuthenticated,async(req,res) => { 
                console.log(req.body);         
                let sqlRec = "";
                let sqlTot = "";
                let where = "";           
                const params = req.body;
                const columns = Array(6);
                columns[0] = 'date';
                columns[1] = 'subject';
                columns[2] = 'message';
                columns[3] = 'sms_note';
                columns[4] = 'target';
                columns[5] = 'action';
                
               
                if(params.search.value != ''){
                    //where += " where ";
                    where += " and (subject like '%"+params.search.value.trim()+"%' ";
                    where += " or message like '%"+params.search.value.trim()+"%' ";
                    where += " or sms_note like '%"+params.search.value.trim()+"%' ";
                    where += " or year(created_at) like '%"+params.search.value.trim()+"%' ";
                    where += " or date_format(created_at,'%M') like '%"+params.search.value+"%' ";
                    where += " or date_format(created_at,'%M %d') like '%"+params.search.value+"%' ";
                    where += " or date_format(created_at,'%M %d, %Y') like '%"+params.search.value+"%' ";
                    where += " or date_format(created_at,'%M %d %Y') like '%"+params.search.value+"%') ";
                }
                
                let sql = "select *,date_format(created_at,'%M %d, %Y') as 'date' from circular where status = 1 ";
                sqlRec += sql;
                sqlTot += sql;

                if(where != ''){
                    sqlRec += where;
                    sqlTot += where;
                }
                sqlRec += "order by "+columns[params.order[0].column]+" "+params.order[0].dir+" limit "+params.start+","+params['length']+"";
                console.log(sqlRec);
                let rowsRec = await dbx.query(sqlRec); 
                let rowsTot = await dbx.query(sqlTot);
                let data = await Promise.all(rowsRec.map(async (row,i,array) =>{
                        let m = 0;
                        if(m == 0){
                        row.date = row.date.toUpperCase();
                        row.subject = `<small style="font-weight:bolder;font-size:10px;"><b>${row.subject.toUpperCase()}</b></small>`;
                        row.message = `<small style="font-weight:bolder;font-size:10px;"><b>${row.message.toUpperCase()}</b></small>`;
                        row.sms_note = `<small style="font-weight:bolder;font-size:10px;"><b>${row.sms_note ? row.sms_note.toUpperCase():''}</b></small>`;
                        row.target = (!row.cat_staff_no && !row.cat_job_id && !row.cat_unit_id && !row.cat_staff_group) ? `<button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>ALL UNIVERSITY STAFF</b></button>`:``;
                        row.target += (row.cat_staff_no) ? `<br><small class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>FEW UNIVERSITY STAFF</b></small>`:``;
                        row.target += (row.cat_job_id) ? `<br><button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>FEW DESIGNATIONS</b></button>`:``;
                        row.target += (row.cat_unit_id) ? `<br><button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>FEW UNITS</b></button>`:``;
                        row.target += (row.cat_staff_group) ? `<br><button class="btn btn-sm"><i class="fa fa-hashtag fa-sm"></i> <b>${row.cat_staff_group} STAFF CATEGORY</b></button>`:``;
                        row.action = `<div class="btn-group" style="width:205px;margin-left:-50px;">`;
                        row.action += row.attachment ? `<a class="btn btn-sm btn-danger" target="_blank" href="${row.attachment}" title="Circular Attachment"><i class="fa fa-file-pdf-o"></i></a>`:``;
                        //row.action += `<a class="btn btn-sm btn-primary" target="_blank" href="/hrm/notifile/${row.id}" title="View Target group"><i class="fa fa-file-text-o"></i></a>`;
                        row.action += `<a class="btn btn-default btn-sm" href="/hrm/editcircular/${row.id}" title="Edit Record"><i class="fa fa-edit"></i></a><a class="btn btn-default btn-sm" style="display:block;" title="Delete Record" href="/hrm/delcircular/${row.id}" onclick="return confirm(\'Delete Record?\');"><i class="fa fa-trash"></i></a></div>`;            
                                    
                        }
                        return row;
                }));
                res.json({
                    draw : Number(params.draw),
                    recordsTotal : Number(rowsTot.length),
                    recordsFiltered : Number(rowsTot.length),
                    data: data
                });    
        });

    

         // Add New Circular
         app.get('/hrm/addcircular',isAuthenticated,async(req,res) => {           
           let units = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           let jobs = await dbx.query("select * from job where active = '1' order by trim(title) asc");
           res.render('index_hr',{
               view:"addnotifier",
               title:"ADD NEW CIRCULAR",
               row: { id: 0}, units,jobs,
               user: req.session.user               
           });            
        });

            // Edit Personnel
       app.get('/hrm/editcircular/:id',isAuthenticated,async(req,res) => { 
           let id = req.params.id;
           let rows = await dbx.query("select * from circular where id = "+id);
           let units = await dbx.query("select * from unit where active = '1' order by trim(long_name)");
           let jobs = await dbx.query("select * from job where active = '1' order by trim(title) asc");
           res.render('index_hr',{
               view:"addnotifier",
               title: "EDIT CIRCULAR",
               row: rows[0], units,jobs,
               user: req.session.user,
           });
       });


       // Delete Personnel File/Record
       app.get('/hrm/delcircular/:id',isAuthenticated,async(req, res) => {
           let id = req.params.id;
           await dbx.query("delete from circular where id = "+id);
           res.redirect('/hrm/circular');              
       });  
       
       
        // Post Personnel File
        app.post('/hrm/postcircular',isAuthenticated,circularfile,async(req,res)=>{ 
           const file = moment().unix();
           delete req.body.nssphoto;
           delete req.body.nssform;
           req.body.cat_unit_id = ( req.body.cat_unit_id != undefined && req.body.cat_unit_id != '') ? ( typeof req.body.cat_unit_id == 'object' ? req.body.cat_unit_id.join(',') : req.body.cat_unit_id ) : null;
           req.body.cat_job_id = ( req.body.cat_job_id != undefined && req.body.cat_job_id != '') ? ( typeof req.body.cat_job_id == 'object' ? req.body.cat_job_id.join(',') : req.body.cat_job_id ) : null;
           req.body.cat_staff_group = ( req.body.cat_staff_group != undefined && req.body.cat_staff_group != '' ) ? ( typeof req.body.cat_staff_group == 'object' ? req.body.cat_staff_group.join(',') : req.body.cat_staff_group ) : null;
           req.body.cat_unit_status = ( req.body.cat_unit_status != undefined && req.body.cat_unit_status != '' ) ? ( typeof req.body.cat_unit_status == 'object' ? req.body.cat_unit_status.join(',') : req.body.cat_unit_status ) : null;

           if(req.file){
               let filepath = './public/circular/'+file+'.pdf';
               req.body.attachment = '/public/circular/'+file+'.pdf';
                moveFile(__dirname+'/'+req.file.filename,filepath);      
                console.log('Attachment uploaded successfully'); 
           }
           console.log(req.body)
           if(req.body.id <= 0){  
               let ins = await dbx.query("insert into circular set ?", req.body); 
               
               // Send SMS Message
               const mobile = req.body.mobile != null ? req.body.mobile : '0277675089';
               const msg = `Please goto the https://staffportal.ucc.edu.gh/nss/portal, Login with Token : ${req.body.token} and your NSS Number`;
               //sms(mobile,msg);
           }else{  
               let ins = await dbx.query("update circular set ? where id = "+req.body.id,req.body);
           }
           res.redirect('/hrm/circular');                
        });


       // View Personnel HR File
       app.get('/hrm/circular/target/:id',isAuthenticated,async(req,res) => { 
            var id = req.params.id;        
            var rows = await dbx.query("select s.*,date_format(start_date,'%Y-%m-%d') as start_date,date_format(end_date,'%Y-%m-%d') as end_date,date_format(dob,'%Y-%m-%d') as dob,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,u.long_name as unitname,nss_no as nox from nss s left join unit u on u.id = s.unit_id where s.id = "+id);
            if(rows.length > 0){  
                const age = moment().diff(moment(rows[0].dob,'YYYY-MM-DD'),'years');
                console.log(age);
                rows[0].age = age;
                rows[0].filename = rows[0].nss_form != null ? path.basename(rows[0].nss_form) : null;
                res.render('partials/hr_notifierfile',{
                  view:'nssfile',
                  title:'CIRCULAR TARGET GROUPS',
                  data: rows[0],
                  user: req.session.user
                }); 
            }else{
                res.redirect('/hrm/circular');
            }    
       });












         /* REPORTS ON MODULES */

          // Promotions & Appointments Reports 
        app.get('/hrm/reports/promo',isAuthenticated,async(req,res) => { 
           // res.json(req.query);
            var action = req.query.action, type = req.query.type, output = req.query.output;
            if(output == 'pdf'){
                if(action == 'rep1'){
                        // Appointments
                        var sql = "select s.staff_no,s.photo,s.gender,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.appoint_date,'%D %M, %Y') as appoint_date,u.long_name as unitname,concat(sc.grade,', STEP ',sc.notch) as grade,j.title as jobtitle from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type = 'APPOINTMENT' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                            sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' APPOINTMENTS ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data: rows,
                                user: req.session.user
                            }); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        } 

                }else if(action == 'rep2'){
                        // Promotions
                        var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.appoint_date,'%D %M, %Y') as appoint_date,u.long_name as unitname,concat(sc.grade,', STEP ',sc.notch) as grade,j.title as jobtitle from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type = 'PROMOTION' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' PROMOTIONS ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data: rows,
                                user: req.session.user
                            }); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        } 


                }else if(action == 'rep3'){
                        // On-coming Promotions
                        var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.appoint_date,'%D %M, %Y') as sappoint_date,p.appoint_date,u.long_name as unitname,concat(sc.grade,', STEP ',sc.notch) as grade,j.title as jobtitle,j.rank_years,j.upgradable from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type IS NOT NULL and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' PROMOTIONS DUE ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        rows =  rows.filter((row,i) => { 
                            const end = moment(row.appoint_date,'YYYY-MM-DD').add(row.rank_years,'years');
                            const days = (row.appoint_date != null && row.rank_years != null) ? end.diff(moment(),'days') : -1;
                            row['due_date'] = moment(row.appoint_date,'YYYY-MM-DD').add(row.rank_years,'years').format('MMMM DD, YYYY');
                            row['days'] = days;
                            return (days >= 0 && (end.format('YYYY') == new Date().getFullYear()) && (row['upgradable'] != null && row['upgradable'] == '0'));
                        });  
                        if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data:rows,
                                user: req.session.user
                            }); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        } 
                
                }else if(action == 'rep4'){
                       // Upgrades within the Year
                        var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.appoint_date,'%D %M, %Y') as appoint_date,u.long_name as unitname,concat(sc.grade,', STEP ',sc.notch) as grade,j.title as jobtitle from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type = 'UPGRADE' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' UPGRADES ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data: rows,
                                user: req.session.user
                            }); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        } 

                }else if(action == 'rep5'){
                         // Upgrades Due
                         var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.appoint_date,'%D %M, %Y') as sappoint_date,p.appoint_date,u.long_name as unitname,concat(sc.grade,', STEP ',sc.notch) as grade,j.title as jobtitle,j.rank_years,j.upgradable from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type IS NOT NULL and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                         sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                         var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' UPGRADES DUE ('+new Date().getFullYear()+')';
                         var rows = await dbx.query(sql);
                         rows =  rows.filter((row,i) => { 
                             const end = moment(row.appoint_date,'YYYY-MM-DD').add(row.rank_years,'years');
                             const days = (row.appoint_date != null && row.rank_years != null) ? end.diff(moment(),'days') : -1;
                             row['due_date'] = end.format('MMMM DD, YYYY');
                             row['days'] = days;
                             return (days >= 0 && (end.format('YYYY') == new Date().getFullYear()) && (row['upgradable'] != null && row['upgradable'] == '1'));
                         }); 
                         if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data:rows,
                                user: req.session.user
                            }); 
                         }else{
                            res.redirect('/hrm/appoint/#page6');
                         } 

                }else if(action == 'rep6'){
                       // Confirmed This Year
                        var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.confirm_date,'%D %M, %Y') as confirm_date,p.probation,u.long_name as unitname,j.title as jobtitle from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where (p.apply_type = 'APPOINTMENT' and p.apply_type IS NOT NULL and p.confirm_date IS NOT NULL) and (year(now()) = year(p.confirm_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' CONFIRMED STAFF ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data: rows,
                                user: req.session.user
                            }); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        } 

                 }else if(action == 'rep7'){
                        // Confirmation Due
                         var sql = "select s.staff_no,s.photo,concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as name,date_format(p.confirm_date,'%D %M, %Y') as confirm_date,p.appoint_date,p.probation,u.long_name as unitname,j.title as jobtitle from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where (p.apply_type = 'APPOINTMENT' and p.apply_type IS NOT NULL and p.confirm_date IS NULL and p.appoint_date IS NOT NULL and p.probation IS NOT NULL) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT') ";
                         sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                         var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' CONFIRMATION DUE ('+new Date().getFullYear()+')';
                         var rows = await dbx.query(sql);
                         rows =  rows.filter((row,i) => { 
                             const end = moment(row.appoint_date,'YYYY-MM-DD').add(row.probation,'years');
                             const days = (row.appoint_date != null && row.probation != null) ? end.diff(moment(),'days') : -1;
                             row['confirm_date'] = end.format('MMMM DD, YYYY');
                             row['days'] = days;
                             return (days >= 0 && end.format('YYYY') == new Date().getFullYear());
                         }); 
                         if(rows.length > 0){  
                            res.render('partials/hr_report_promolist',{
                                view:'report_promolist',
                                title,action,
                                data:rows,
                                user: req.session.user
                            }); 
                         }else{
                            res.redirect('/hrm/appoint/#page6');
                         } 


                }

            }else{

                if(action == 'rep1'){
                    // Appointments - Excel
                    var sql = "select s.staff_no as 'STAFF NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',upper(date_format(p.appoint_date,'%D %M, %Y')) as 'ASSUMPTION DATE',j.title as 'DESIGNATION',u.long_name as 'UNIT',concat(sc.grade,', STEP ',sc.notch) as 'GRADE' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type = 'APPOINTMENT' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                    sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                    var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' APPOINTMENTS ('+new Date().getFullYear()+')';
                    var rows = await dbx.query(sql);
                    if(rows.length > 0){  
                        res.xls(title+'.xlsx',rows); 
                    }else{
                        res.redirect('/hrm/appoint/#page6');
                    }   

                }else if(action == 'rep2'){
                    // Promotions Offered - Excel
                    var sql = "select s.staff_no as 'STAFF NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',upper(date_format(p.appoint_date,'%D %M, %Y')) as 'ASSUMPTION DATE',j.title as 'DESIGNATION',u.long_name as 'UNIT',concat(sc.grade,', STEP ',sc.notch) as 'GRADE' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id  where p.apply_type = 'PROMOTION' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                    sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                    var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' PROMOTIONS ('+new Date().getFullYear()+')';
                    var rows = await dbx.query(sql);
                    if(rows.length > 0){  
                        res.xls(title+'.xlsx',rows); 
                    }else{
                        res.redirect('/hrm/appoint/#page6');
                    }    

                }else if(action == 'rep3'){
                    // Promotion Due - Excel
                     var sql = "select s.staff_no as 'STAFF_NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL_NAME',s.gender as 'GENDER',date_format(p.appoint_date,'%Y-%m-%d') as 'ASSUMPTION_DATE',j.rank_years as 'RANK_YEARS_SERVED',j.title as 'DESIGNATION',j.upgradable,u.long_name as 'UNIT',concat(sc.grade,', STEP ',sc.notch) as 'GRADE' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type IS NOT NULL and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                     sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                     var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' PROMOTIONS DUE ('+new Date().getFullYear()+')';
                     var rows = await dbx.query(sql); 
                     rows =  rows.filter((row,i) => { 
                         const end = moment(row['ASSUMPTION_DATE'],'YYYY-MM-DD').add(row['RANK_YEARS_SERVED'],'years');
                         const days = (row['ASSUMPTION_DATE'] != null && row['RANK_YEARS_SERVED'] != null) ? end.diff(moment(),'days') : -1;
                         row['DUE_ON'] = (moment(row['ASSUMPTION_DATE'],'YYYY-MM-DD').add(row['RANK_YEARS_SERVED'],'years').format('MMMM DD, YYYY')).toUpperCase();
                         row['DAYS_TO_PROMOTION'] = days;
                         return (days >= 0 && (end.format('YYYY') == new Date().getFullYear()) && (row['upgradable'] != null && row['upgradable'] == '0'));
                     });  
                     if(rows.length > 0){  
                        res.xls(title+'.xlsx',rows); 
                     }else{
                        res.redirect('/hrm/appoint/#page6');
                     }   
                    
                }else if(action == 'rep4'){
                    // Upgrades Offered - Excel
                        var sql = "select s.staff_no as 'STAFF NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',upper(date_format(p.appoint_date,'%D %M, %Y')) as 'ASSUMPTION DATE',j.title as 'DESIGNATION',u.long_name as 'UNIT',concat(sc.grade,', STEP ',sc.notch) as 'GRADE' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id  where p.apply_type = 'PROMOTION' and (year(now()) = year(p.appoint_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' PROMOTIONS ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.xls(title+'.xlsx',rows); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        }    

                }else if(action == 'rep5'){
                    // Upgrades Due - Excel
                        var sql = "select s.staff_no as 'STAFF_NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL_NAME',s.gender as 'GENDER',date_format(p.appoint_date,'%Y-%m-%d') as 'ASSUMPTION_DATE',j.rank_years as 'RANK_YEARS_SERVED',j.title as 'DESIGNATION',j.upgradable,u.long_name as 'UNIT',concat(sc.grade,', STEP ',sc.notch) as 'GRADE' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type IS NOT NULL and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' UPGRADE DUE ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql); 
                        rows =  rows.filter((row,i) => { 
                            const end = moment(row['ASSUMPTION_DATE'],'YYYY-MM-DD').add(row['RANK_YEARS_SERVED'],'years');
                            const days = (row['ASSUMPTION_DATE'] != null && row['RANK_YEARS_SERVED'] != null) ? end.diff(moment(),'days') : -1;
                            row['DUE_ON'] = (moment(row['ASSUMPTION_DATE'],'YYYY-MM-DD').add(row['RANK_YEARS_SERVED'],'years').format('MMMM DD, YYYY')).toUpperCase();
                            row['DAYS_TO_UPGRADE'] = days;
                            return (days >= 0 && (end.format('YYYY') == new Date().getFullYear()) && (row['upgradable'] != null && row['upgradable'] == '1'));
                        });  
                        if(rows.length > 0){  
                           res.xls(title+'.xlsx',rows); 
                        }else{
                           res.redirect('/hrm/appoint/#page6');
                        }   
                }else if(action == 'rep6'){
                    // Confirmation Offered - Excel
                        var sql = "select s.staff_no as 'STAFF NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',upper(date_format(p.confirm_date,'%D %M, %Y')) as 'CONFIRMATION DATE',j.title as 'DESIGNATION',p.probation as 'PROBATION_YEARS',u.long_name as 'UNIT' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id  where (p.apply_type = 'APPOINTMENT' and p.apply_type IS NOT NULL and p.confirm_date IS NOT NULL) and (year(now()) = year(p.confirm_date)) and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type=='SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' CONFIRMED STAFF ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql);
                        if(rows.length > 0){  
                            res.xls(title+'.xlsx',rows); 
                        }else{
                            res.redirect('/hrm/appoint/#page6');
                        }    

                }else if(action == 'rep7'){
                       res.json(req.query);
                    // Confirmation Due - Excel
                        var sql = "select p.appoint_date,s.staff_no as 'STAFF_NUMBER',concat(s.fname,ifnull(concat(' ',s.mname),''),' ',s.lname) as 'FULL_NAME',s.gender as 'GENDER',j.title as 'DESIGNATION',p.probation as 'PROBATION_YEARS',u.long_name as 'UNIT' from staff s left join promotion p on s.promo_id = p.id left join unit u on u.id = p.unit_id left join job j on p.job_id = j.id left join scale sc on sc.id = p.scale_id where p.apply_type IS NOT NULL and (s.staff_status = 'TEMPORAL' or s.staff_status = 'PERMANENT')";
                        sql += (type != 'all' ? " and p.staff_group = '"+type+"' " : '');
                        var title = (type != 'all' ? (type == 'SM'?'SENIOR MEMBERS':(type == 'SS'?'SENIOR STAFF':'JUNIOR STAFF'))+' - ' : "")+' CONFIRMATION DUE ('+new Date().getFullYear()+')';
                        var rows = await dbx.query(sql); 
                        rows =  rows.filter((row,i) => { 
                            const end = moment(row.appoint_date,'YYYY-MM-DD').add(row.probation,'years');
                            const days = (row.appoint_date != null && row.probation != null) ? end.diff(moment(),'days') : -1;
                            row['CONFIRMATION DATE'] = end.format('MMMM DD, YYYY');
                            row['DAYS_TO_CONFIRMATION'] = days;
                            return (days >= 0 && end.format('YYYY') == new Date().getFullYear());
                        }); 
                        if(rows.length > 0){  
                           res.xls(title+'.xlsx',rows); 
                        }else{
                           res.redirect('/hrm/appoint/#page6');
                        }   
                }
            }
    });







        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* FIXES  */
        if(process.env.appType == 'local'){
 
        
            // Upload Manual Leave Applications
            app.post('/hrm/manleave/',isAuthenticated, async(req, res) => {
                var exceltojson;
                excel(req,res,async(err)=>{          
                    if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                        exceltojson = xlsx;
                    }else {
                        exceltojson = xls;
                    }
                    try{
                        exceltojson({
                            input: req.file.path,
                            output: null, // since we don't need output.json
                            lowerCaseHeaders:true
                        },async(err,results) => {   // staff_no,approved_days,entitlement,reliever,start_date,end_date,resume_date
                           for(var i = 0; i < results.length; i++){ 
                                if(results[i]['staff_no'].trim() != '' && results[i]['approved_days'].trim() != ''){
                                    console.log(results[i]);
                                    let stno = parseInt(results[i]['staff_no'].trim());
                                    let entitlement = parseInt(results[i]['entitlement'].trim());
                                    let approved_days = parseInt(results[i]['approved_days'].trim());
                                    let start_date  = results[i]['start_date'].trim() != '' ? moment(results[i]['start_date'].trim()).format("YYYY-MM-DD") : '';
                                    let end_date = results[i]['end_date'].trim() != '' ? moment(results[i]['end_date'].trim()).format("YYYY-MM-DD") : '';
                                    let resume_date = moment(results[i]['resume_date'].trim(),'YYYY-MM-DD').format("YYYY-MM-DD");
                                    let head_endorse = results[i]['head_endorse'].trim() != '' ? results[i]['head_endorse'].trim() : req.session.user.staff_no;
                                    let relieved_by =  results[i]['relieved_by'].trim() != '' ? results[i]['relieved_by'].trim() : '000'; 
                                    // Insert Leave Record with hr as head_endorse and hr_endorse
                                    var data = {type_id : 2,staff_no:stno,start_date,end_date,resume_date,applied_date:start_date,head_date:start_date,hr_date:start_date,head_endorse,hr_endorse:req.session.user.staff_no,entitlement,approved_days,relieved_by};
                                    let title,msg;
                                    let ext = await dbx.query("select * from leave_dump where staff_no = "+stno+" and DATE(start_date) = DATE('"+start_date+"')"); 
                                    if(ext.length <= 0){
                                            let st = await dbx.query("select * from staff where staff_no = "+stno);                    
                                            if(moment().diff(moment(results[i]['end_date'],'YYYY-MM-DD'),'days') > 0){
                                                data.status = 'ENDED';
                                                title = 'LEAVE IS EXHAUSTED';
                                                msg = 'Leave application with statistics <em>( DAYS:'+approved_days+', ENTITLEMENT:'+entitlement+' )</em> is exhausted. Please note that you are to report to duty by '+moment(resume_date).format('DD/MM/YYYY')+'. Thank you!';
                                            }else{
                                                data.status = 'GRANTED';
                                                title = 'LEAVE APPLICATION HAS BEEN GRANTED';
                                                msg = 'Leave application with statistics <em>( DAYS:'+approved_days+', ENTITLEMENT:'+entitlement+' )</em> has been granted, Resumption date is on '+moment(resume_date).format('DD/MM/YYYY')+'. Please enjoy your leave!';
                                            }   await dbx.query("insert into leave_dump set ?",data);  
                                            
                                            // Notification - Staff
                                            var datax = {action : title,message : msg, staff_no : stno, datetime : new Date(),read_flag : '0',priority : '1'}
                                            await dbx.query("insert into notification set ?",datax);
                                            // Mail Staff
                                            let name = (st[0].fname+' '+st[0].mname+' '+st[0].lname);
                                            let email = st[0].ucc_mail;
                                            mailer(email,name,title,msg);
                                    }
                                }
                            }  
                            // Remove File uploaded
                            fs.unlinkSync(req.file.path);
                            // Redirect to student page
                            res.redirect('/hrm/leave#page3');                   
                        });
                    }catch (e){
    
                            console.log({error_code:1,err_desc:"Corrupted excel file"});                 
                            // Redirect to student page
                            res.redirect('/hrm/leave#page1');   
                    }
                }); 
            }); 
    
    
    
    
           // Upload Manual Leave Applications
           app.post('/hrm/manbal/',isAuthenticated, async(req, res) => {
            var exceltojson;
            excel(req,res,async(err)=>{          
                if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                    exceltojson = xlsx;
                }else {
                    exceltojson = xls;
                }
                try{
                    exceltojson({
                        input: req.file.path,
                        output: null, // since we don't need output.json
                        lowerCaseHeaders:true
                    },async(err,results) => {   // staff_no,approved_days,entitlement,reliever,start_date,end_date,resume_date
                       for(var i = 0; i < results.length; i++){ 
                            if(results[i]['staff_no'].trim() != ''){
                                console.log(results[i]);
                                let stno = parseInt(results[i]['staff_no'].trim());
                                let weight = parseInt(results[i]['weight'].trim());
                                // Insert Leave Record with hr as head_endorse and hr_endorse
                                var data = {staff_no:stno,weight,year:new Date().getFullYear()};
                                let title,msg;
                                let ext = await dbx.query("select * from leave_balance where staff_no = "+stno); 
                                if(ext.length <= 0){
                                    let st = await dbx.query("select * from staff where staff_no = "+stno);                    
                                    title = 'LEAVE BALANCE UPLOADED';
                                    msg = 'DHR has restored your accumulated leave balances for the previous year or years, Please alert DHR with your concerns. Thank you!';
                                    await dbx.query("insert into leave_balance set ?",data);  
                                    
                                    // Notification - Staff
                                    var datax = {action : title,message : msg, staff_no : stno, datetime : new Date(),read_flag : '0',priority : '1'}
                                    await dbx.query("insert into notification set ?",datax);
                                    // Mail Staff
                                    let name = (st[0].fname+' '+st[0].mname+' '+st[0].lname);
                                    let email = st[0].ucc_mail;
                                    mailer(email,name,title,msg);
                                }
                            }
                        }  
                        // Remove File uploaded
                        fs.unlinkSync(req.file.path);
                        // Redirect to student page
                        res.redirect('/hrm/leave#page8');                   
                    });
                    }catch (e){
                        console.log({error_code:1,err_desc:"Corrupted excel file"});                 
                        // Redirect to student page
                        res.redirect('/hrm/leave#page8');   
                    }
                }); 
            }); 
    
    
    
    
            app.get('/hrm/picfix',isAuthenticated,isAdmin,async(req,res)=>{
                let pix = fs.readdirSync('./public/staffpic');
                // Update Photos to Null
                await dbx.query("update staff set photo = null");
                // Scan Staff Pic folder and Update DB
                for(var pi of pix){
                   var stno = parseInt(pi.split('.')[0].trim());
                   if(!isNaN(stno)){
                        let path = '/public/staffpic/'+pi;
                        console.log(stno + ' : '+path);
                        let st = await dbx.query("select * from staff where staff_no = "+stno);                    
                        st.length > 0 ? await dbx.query("update staff set photo = '"+path+"' where staff_no ="+stno):'';
                   }
                }           
                 //console.log(fs.readdirSync('./public/staffpic'));
                 res.redirect("/hrm/dash");
            });
    
    
    
            // Upload Excel -- Add Student
            app.get('/fixls',isAuthenticated,isAdmin,async(req, res) => {
               var exceltojson = xls; //.xls
                          
                exceltojson({
                    input: './public/hrdata.xls',
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => {   
                   
                    var sum = 0;                 
                    for(var i = 0; i < results.length; i++){                    
                      
                        results[i].appoint = (results[i].appoint_date.trim() != '' && results[i].appoint_date.trim() != '(empty)') ? moment(results[i].appoint_date, "MM/DD/YYYY").format("YYYY-MM-DD") : '1900-01-01';
                        //results[i].confirm = (results[i].confirm_date.trim() != '' && results[i].confirm_date.trim() != '(empty)') ? moment(results[i].confirm_date, "MM/DD/YYYY").add(1,"years").format("YYYY-MM-DD") : null;
                        results[i].confirm = (results[i].confirm_date.trim() != '' && results[i].confirm_date.trim() != '(empty)') ? moment(results[i].confirm_date, "MM/DD/YYYY").format("YYYY-MM-DD") : '1900-01-01';
                        results[i].dobx = results[i].dob.trim() != '' ? moment(results[i].dob, "MM/DD/YYYY").format("YYYY-MM-DD") : '1900-01-01';
                                  
                        console.log(results[i]);                      
                        if(results[i]['staffno'].trim() != ''){
                            let stno = parseInt(results[i]['staffno'].trim());
                            let st = await dbx.query("select * from staff where staff_no = "+stno);
                            if(st.length > 0) {
    
                                // SCALE
                                var scale;
                                var sc = await dbx.query("select * from scale where grade ='"+results[i]['grade'].trim()+"' and notch ="+parseInt(results[i]['notch'].trim()));
                                if(sc.length == 0){
                                    let q = await dbx.query("insert into scale(grade,notch) values('"+results[i]['grade'].trim()+"',"+parseInt(results[i]['notch'].trim())+")");
                                    scale = q.insertId;
                                }else{
                                    scale = sc[0].id;
                                } 
    
                                // JOB
                                var job;
                                var jb = await dbx.query("select * from job where title ='"+results[i]['jobtitle'].trim()+"'");
                                if(jb.length == 0){
                                    let jx = await dbx.query("insert into job(title) values('"+results[i]['jobtitle'].trim()+"')");
                                    job = jx.insertId;
                                }else{
                                    job = jb[0].id;
                                } 
    
                                // APPOINT-PROMO
                                var promo;
                                var pr = await dbx.query("select * from promotion where staff_no = "+stno+" order by id desc limit 1");
                                if(pr.length <= 0){
                                    var prm = await dbx.query("insert into promotion(staff_no,scale_id,job_id,staff_group,appoint_date,confirm_date) values("+stno+","+scale+",'"+job+"','"+results[i].staff_group+"','"+results[i].appoint+"','"+results[i].confirm+"')");                           
                                    promo = prm.insertId;
                                }else{
                                    await dbx.query("update promotion set staff_no = "+stno+", scale_id = "+scale+", job_id = '"+job+"', staff_group = '"+results[i].staff_group+"', appoint_date = '"+results[i].appoint+"',confirm_date = '"+results[i].confirm+"' where id = "+pr[0].id);                           
                                    promo = pr[0].id;
                                }
    
                                //UPDATES STAFF
                                console.log(st[0].staff_no);
                                await dbx.query("update staff set staff_status = '"+(results[i].appoint != '1900-01-01' && results[i].confirm == '1900-01-01' ? 'TEMPORAL':'PERMANENT')+"',scale_id = "+scale+", dob = '"+results[i].dobx+"', job_id = "+job+", staff_group = '"+results[i].staff_group+"',promo_id = "+promo+",appoint_date = '"+results[i].appoint+"',confirm_date = '"+results[i].confirm+"' where id = "+st[0].id);                           
                                
    
                            }else{ 
    
                                 // SCALE
                                 var scale;
                                 var sc = await dbx.query("select * from scale where grade ='"+results[i]['grade'].trim()+"' and notch ="+parseInt(results[i]['notch'].trim()));
                                 if(sc.length == 0){
                                     let q = await dbx.query("insert into scale(grade,notch) values('"+results[i]['grade'].trim()+"',"+parseInt(results[i]['notch'].trim())+")");
                                     scale = q.insertId;
                                 }else{
                                     scale = sc[0].id;
                                 } 
     
                                 // JOB
                                 var job;
                                 var jb = await dbx.query("select * from job where title ='"+results[i]['jobtitle'].trim()+"'");
                                 if(jb.length == 0){
                                     let jx = await dbx.query("insert into job(title) values('"+results[i]['jobtitle'].trim()+"'");
                                     job = jx.insertId;
                                 }else{
                                     job = jb[0].id;
                                 } 
     
                                 // APPOINT-PROMO
                                 var promo;
                                 var pr = await dbx.query("select * from promotion where staff_no = "+stno+" order by id desc limit 1");
                                 if(pr.length <= 0){
                                     var prm = await dbx.query("insert into promotion(scale_id,job_id,staff_group,appoint_date,confirm_date) values("+scale+",'"+job+"','"+results[i].staff_group+"','"+results[i].appoint+"','"+results[i].confirm+"')");                           
                                     promo = prm.insertId;
                                 }else{
                                     await dbx.query("update promotion set scale_id = "+scale+", job_id = '"+job+"', staff_group = '"+results[i].staff_group+"', appoint_date = '"+results[i].appoint+"',confirm_date = '"+results[i].confirm+"' where id = "+pr[0].id);                           
                                     promo = pr[0].id;
                                 }
     
                                 //UPDATES
                                 console.log("None DB Staff!");
                                 await dbx.query("insert into staff(scale_id,dob,promo_id,job_id,staff_group,staff_status,appoint_date,confirm_date) values("+scale+",'"+results[i].dobx+"',"+promo+","+job+",'"+results[i].staff_group+"','"+(results[i].appoint != '1900-01-01' && results[i].confirm == '1900-01-01' ? 'TEMPORAL':'PERMANENT')+"','"+results[i].appoint+"','"+results[i].confirm+"')");                           
                                 sum++;
                            }
                        } 
                    }       
                    console.log(sum+" Staff not in DB!");         
                    // Redirect to student page
                    res.redirect('/hrm/dash');                   
                });
           }); 
    
    
            // Designations fix 1
            app.get('/fixdesig',isAuthenticated,isAdmin,async(req, res) => {
                 var exceltojson = xls; //.xls
                 exceltojson({
                     input: './public/job.xls',
                     output: null, // since we don't need output.json
                     lowerCaseHeaders:true
                 },async(err,results) => {   
                    
                     var sum = 0;                 
                     for(var i = 0; i < results.length; i++){                    
                         console.log(results[i]);                      
                         if(results[i]['title'].trim() != ''){
                            let data = {id: (i+1),title : results[i]['title'].trim()}
                            let gm = await dbx.query("select * from job where title = '"+results[i]['title'].trim()+"'");
                            if(gm.length <= 0){
                                await dbx.query("insert into job set ? ",data);                           
                                console.log(results[i]['title'].trim());
                            }
                         } 
                     }       
                     // Redirect to student page
                     res.redirect('/hrm/dash');                   
                 });
            }); 
    
           // Designation fix 2 - IDs
            app.get('/fixdesig2',isAuthenticated,isAdmin, async(req, res) => {
                    let gm = await dbx.query("select * from job order by trim(title) asc");
                    if(gm.length > 0){
                        gm.map(async (g,i) => {
                            await dbx.query("update job set id =  "+(i+1)+" where id = "+g.id);                           
                        });
                    }
                    // Redirect to student page
                    res.redirect('/hrm/dash');                   
            }); 
    
    
            
            // Upload Excel -- BIODATA
            app.get('/fixbio',isAuthenticated,isAdmin, async(req, res) => {
                var exceltojson = xls; //.xls
                           
                 exceltojson({
                     input: './public/bio.xls',
                     output: null, // since we don't need output.json
                     lowerCaseHeaders:true
                 },async(err,results) => {   
                    
                     var sum = 0; var newv = 0, oldv = 0;                
                     for(var i = 0; i < results.length; i++){                    
                            
                         console.log(results[i]);                      
                         if(results[i]['staffno'].trim() != ''){
                             let stno = parseInt(results[i]['staffno'].trim());
                             let st = await dbx.query("select * from staff where staff_no = "+stno);
    
                             //results[i]['mstatus'] = results[i]['mstatus'].trim() != '' ? results[i]['mstatus'].trim() : null;
                             //results[i]['religion'] = results[i]['religion'].trim() != '' ? results[i]['religion'].trim() : null;
                             //results[i]['nationality'] = results[i]['nationality'].trim() != '' ? results[i]['nationality'].trim() : null;
    
                             if(st.length > 0) {                   
                                //UPDATES
                                 await dbx.query("update staff set ssnit = '"+results[i]['ssnit']+"',mstatus = '"+results[i]['mstatus']+"',fname = '"+results[i]['fname']+"',mname = '"+results[i]['mname']+"',lname = '"+results[i]['lname']+"',title = '"+results[i]['title'].trim()+"',gender = '"+results[i]['gender'].trim()+"',country = '"+results[i]['nationality']+"',religion = '"+results[i]['religion']+"' where staff_no = "+st[0].staff_no);                           
                                 oldv++; console.log(st[0].staff_no);
                             
                             }else{ 
                                //UPDATES
                                console.log("Checking Value : "+ results[i]['staffno'].trim());
                                 await dbx.query("insert into staff(staff_no,title,fname,mname,lname,ssnit,country,religion,mstatus,gender) values("+results[i]['staffno'].trim()+",'"+results[i]['title']+"','"+results[i]['fname']+"','"+results[i]['mname']+"','"+results[i]['lname']+"','"+results[i]['ssnit']+"','"+results[i]['nationality']+"','"+results[i]['religion']+"','"+results[i]['mstatus']+"','"+results[i]['gender']+"')");                           
                                 newv++; console.log("None DB Staff!");
                             }
                             sum++;
                         } 
                     }       
                     console.log(newv+" New Staff Added!");         
                     console.log(oldv+" Old Staff Updated!"); 
                     console.log(sum+" Total Loopcount!");                 
                     // Redirect to student page
                     res.redirect('/hrm/dash');                   
                 });
            }); 
     
           
            // Scales - Fix
            app.get('/fixscale',isAuthenticated,isAdmin, async(req, res) => {
                var scales  = [
                    {g:1,l:'L',n:8},
                    {g:1,l:'H',n:8},
                    {g:2,l:'L',n:8},
                    {g:2,l:'H',n:8},
                    {g:3,l:'L',n:8},
                    {g:3,l:'H',n:8},
                    {g:4,l:'L',n:8},
                    {g:4,l:'H',n:8},
                    {g:5,l:'L',n:8},
                    {g:5,l:'H',n:8},
                    {g:6,l:'L',n:6},
                    {g:6,l:'H',n:6},
                    {g:7,l:'L',n:6},
                    {g:7,l:'H',n:6},
                    {g:8,l:'L',n:6},
                    {g:8,l:'H',n:6},
                    {g:9,l:'L',n:6},
                    {g:9,l:'H',n:6},
                    {g:10,l:'L',n:6},
                    {g:10,l:'H',n:6},
                    {g:11,l:'L',n:6},
                    {g:11,l:'H',n:6},
                    {g:12,l:'L',n:6},
                    {g:12,l:'H',n:6},
                    {g:13,l:'L',n:6},
                    {g:13,l:'H',n:6},
                    {g:14,l:'L',n:6},
                    {g:14,l:'H',n:6},
                    {g:15,l:'L',n:6},
                    {g:15,l:'H',n:6},
                    {g:16,l:'L',n:6},
                    {g:16,l:'H',n:6},
                    {g:17,l:'L',n:5},
                    {g:17,l:'H',n:5},
                    {g:18,l:'L',n:5},
                    {g:18,l:'H',n:5},
                    {g:19,l:'L',n:5},
                    {g:19,l:'H',n:5},
                    {g:20,l:'L',n:5},
                    {g:20,l:'H',n:5},
                    {g:21,l:'L',n:4},
                    {g:21,l:'H',n:5},
                    {g:22,l:'L',n:4},
                    {g:22,l:'H',n:5},
                    {g:23,l:'L',n:4},
                    {g:23,l:'H',n:5},
                    {g:24,l:'L',n:4},
                    {g:24,l:'H',n:5},
                    {g:25,l:'L',n:4},
                    {g:25,l:'H',n:4}
                ];
    
                console.log(typeof scales);
                // var m = 1;
                scales.map(async (scale,i) => {
                   for(let j = 1; j <= scale.n; j++){   
                        // console.log(scale.n+' '+scale.l+' '+scale.g+' '+j+' '+(i+1));   
                         var data = {notch:j,level:scale.l,grade_num:scale.g,grade:(scale.g+scale.l),active:'1'};
                         //await dbx.query("insert into scale(id,grade,notch,grade_num,level,active) values("+m+",'"+(scale.g+scale.l)+"',"+j+","+scale.g+",'"+scale.l+"','1')");                           
                         await dbx.query("insert into scale set ?",data);                           
                        // console.log("ID: "+m+", GRADE: "+scale.g+scale.l+' Notch '+j);         
                        // m++;
                    }
                });       
                // Redirect to student page
                res.redirect('/hrm/dash?kk');                   
            }); 
    
    
             // Upload Excel -- BIODATA
             app.get('/fixcontact',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                           
                 exceltojson({
                     input: './public/contact.xls',
                     output: null, // since we don't need output.json
                     lowerCaseHeaders:true
                 },async(err,results) => {   
                    
                     var sum = 0; var newv = 0, oldv = 0;                
                     for(var i = 0; i < results.length; i++){                    
                            
                         console.log(results[i]);                      
                         if(results[i]['staffno'].trim() != ''){
                             let stno = parseInt(results[i]['staffno'].trim());
                             let st = await dbx.query("select * from staff where staff_no = "+stno);
    
                             //results[i]['mstatus'] = results[i]['mstatus'].trim() != '' ? results[i]['mstatus'].trim() : null;
                             //results[i]['religion'] = results[i]['religion'].trim() != '' ? results[i]['religion'].trim() : null;
                             //results[i]['nationality'] = results[i]['nationality'].trim() != '' ? results[i]['nationality'].trim() : null;
    
                             if(st.length > 0) { 
                                 if((st[0].ucc_mail == null || st[0].ucc_mail == '') && results[i]['email'] != ''){
                                    //UPDATES
                                    await dbx.query("update staff set ucc_mail = '"+results[i]['email']+"' where staff_no = "+st[0].staff_no);                           
                                    console.log(results[i]['email']);
                                 }
                                 
                                 if((st[0].phone == null || st[0].phone == '') && parseInt(results[i]['phone']) != 0){
                                    //UPDATES
                                    await dbx.query("update staff set phone = '"+results[i]['phone']+"' where staff_no = "+st[0].staff_no);                           
                                    console.log(parseInt(results[i]['phone']));
                                 }
                                 oldv++; 
                                 console.log(parseInt(results[i]['phone']));
                             
                             }else{ 
                                
                             }
                             sum++;
                         } 
                     }       
                               
                     // Redirect to student page
                     res.redirect('/hrm/dash');                   
                 });
            }); 
    
    
    
    
             // Upload Excel -- BIODATA
             app.get('/fixunitm',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                           
                 exceltojson({
                     input: './public/unitm.xls',
                     output: null, // since we don't need output.json
                     lowerCaseHeaders:true
                 },async(err,results) => {   
                    
                     var sum = 0; var newv = 0, oldv = 0;                
                     for(var i = 0; i < results.length; i++){                    
                            
                         console.log(results[i]);                      
                         if(results[i]['staffno'].trim() != ''){
                             let stno = parseInt(results[i]['staffno'].trim());
                             let st = await dbx.query("select s.*,p.id as pid from staff s left join promotion p on s.promo_id = p.id where s.staff_no = "+stno);
    
                             if(st.length > 0) { 
                                    // UNIT
                                    var unit;
                                    var jb = await dbx.query("select * from unit where long_name ='"+results[i]['unitname'].trim()+"'");
                                    if(jb.length == 0){
                                        let jx = await dbx.query("insert into unit(long_name) values('"+results[i]['unitname'].trim()+"')");
                                        unit = jx.insertId;
                                    }else{
                                        unit = jb[0].id;
                                    } 
                                    // Update Data
                                    await dbx.query("update promotion set unit_id = '"+unit+"' where id = "+st[0].pid);                           
                                    await dbx.query("update staff set unit_id = '"+unit+"' where id = "+st[0].id);                           
                                 
                             }else{ 
                                console.log("No Staff : "+stno);
                             }
                             sum++;
                         } 
                     }       
                               
                     // Redirect to student page
                     res.redirect('/hrm/dash');                   
                 });
            }); 
      
    
    
    
            
             // Upload Excel -- BIODATA
             app.get('/fixunit',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                           
                 exceltojson({
                     input: './public/unit.xls',
                     output: null, // since we don't need output.json
                     lowerCaseHeaders:true
                 },async(err,results) => {   
                    
                     var sum = 0; var newv = 0, oldv = 0;                
                     for(var i = 0; i < results.length; i++){    
                        console.log(results[i]);                           
                        // UNIT
                        var unit;
                        var jb = await dbx.query("select * from unit where long_name ='"+results[i]['unitname'].trim()+"'");
                        if(jb.length == 0){
                            let jx = await dbx.query("insert into unit(long_name) values('"+results[i]['unitname'].trim()+"')");
                            unit = jx.insertId;
                        }else{
                            unit = jb[0].id;
                        } 
                     }       
                               
                     // Redirect to student page
                     res.redirect('/hrm/dash');                   
                 });
            }); 
    
    
            /*  NEW FIXES -- 2019  */
             // Biodata 1
             app.get('/runbio',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                exceltojson({
                    input: './public/eBio.xls',
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => {   
                   
                    for(var i = 0; i < results.length; i++){                    
                        //console.log(results[i]);  
                        var staffno = results[i]['staffno'].trim();
                        var name = results[i]['name'].trim().split(',');
                        var lname = name[0].trim(),fname = name[1].trim().split(' ',2)[0];
                        var mname = name[1].trim().split(' ',4)[1] != undefined ? name[1].trim().split(' ',4)[1] : '';
                            mname += name[1].trim().split(' ',4)[2] != undefined ? ' '+name[1].trim().split(' ',4)[2] : '';
                            mname += name[1].trim().split(' ',4)[3] != undefined ? ' '+name[1].trim().split(' ',4)[3] : '';
                        var gender = results[i]['gender'].trim().toLowerCase() == 'female'? 'F':(results[i]['gender'].trim().toLowerCase() == 'male' ? 'M':null);
                        var date = moment(results[i]['appoint_date'].trim()).format('YYYY-MM-DD');    
                        var ssnit = results[i]['ssnit'].trim();    
                        var job = results[i]['jobtitle'].trim();    
                        console.log({lname, mname, fname, gender,date});
                        if(staffno != ''){
                            // Current Job designation
                            var job_id;
                            var jb = await dbx.query("select * from job where title ='"+job+"'");
                            if(jb.length == 0){
                                let jx = await dbx.query("insert into job(title) values('"+job+"')");
                                job_id = jx.insertId;
                            }else{
                                job_id = jb[0].id;
                            } 
    
                            var st = await dbx.query("select * from staff where staff_no = "+staffno);
                            // New Promotion and Appointment
                            var promdata = {job_id,staff_no:staffno};
                            var promo_id;
                            if(st.length > 0 && st[0].promo_id != null){
                                promo_id = st[0].promo_id;
                                let prom = await dbx.query("update promotion set ? where id = "+promo_id,promdata);   // Fix staff_no on promotion record                         
                            }else{
                                let prom = await dbx.query("insert into promotion set ?",promdata);   // Fix staff_no on promotion record                         
                                promo_id = prom.insertId;
                            }
                            
                            // Staff Bio
                            let stdata = {staff_no:staffno,fname,mname,lname,gender,first_appoint_date:date,ssnit,promo_id,staff_status:'PERMANENT'};
                            
                             if(st.length > 0){
                                 await dbx.query("update staff set ? where staff_no = "+staffno,stdata);
                             }else{
                                 await dbx.query("insert into staff set ?",stdata);
                             }
                        } 
                    }       
                    // Redirect to student page
                    res.redirect('/hrm/dash');  
                   //res.json(results);             
                });
           }); 
    
    
           // Relatives
           app.get('/runrel',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                exceltojson({
                    input: './public/eRelative.xls',
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => {   
               
                var staffno = null; 
                var mstatus = null;
                for(var i = 0; i < results.length; i++){                    
                    //console.log(results[i]);  
                    if(results[i]['staffno'].trim() != '' && results[i]['mstatus'].trim() != ''){
                       staffno = Number(results[i]['staffno'].trim());
                       mstatus = results[i]['mstatus'].trim();
                       // Run update for marital status 
                       let stdata = {mstatus : mstatus.toUpperCase()};
                       await dbx.query("update staff set ? where staff_no = "+staffno,stdata);
                    }
    
                    if(results[i]['relative'].trim() != '' && staffno != null){
                        var name = results[i]['relative'].trim().split(',');
                        var lname = name[0].trim(),fname = name[1].trim(), mname = '';
                        var gender = results[i]['gender'].trim() != '' ? results[i]['gender'].trim() : null;
                        var dob = results[i]['dob'].trim() != '' ? moment(results[i]['dob'].trim()).format('YYYY-MM-DD') : null;    
                        var relation = results[i]['relation'].trim() != '' ? results[i]['relation'].trim() : 'UNKNOWN';    
                        console.log({fname,mname,lname,dob,gender,relation,staffno});
                        var jb = await dbx.query("select * from staff_rel where date(dob) = date('"+dob+"') and gender = '"+gender+"' and fname = '"+fname+"' and lname = '"+lname+"'");
                        if(jb.length == 0){
                            let reldata = {fname,mname,lname,dob,gender,relation,staff_no:staffno};
                            let rl = await dbx.query("insert into staff_rel set ?",reldata);
                            //job_id = rl.insertId;
                        }
                    }
    
                }       
                // Redirect to student page
                res.redirect('/hrm/dash');  
               //res.json(results);             
              });
           }); 



           
    
             // RUN EXTRA -  11-JUN-2020
             app.get('/runextra',isAuthenticated,isAdmin,async(req, res) => {
                var exceltojson = xls; //.xls
                exceltojson({
                    input: './public/extra.xls',
                    output: null, // since we don't need output.json
                    lowerCaseHeaders:true
                },async(err,results) => {   
                   
                    for(var i = 0; i < results.length; i++){                    
                        console.log(results[i]);  
                        var staffno = parseInt(results[i]['staff_no']);
                        var fname = results[i]['fname'].trim();
                        var mname = results[i]['mname'].trim();
                        var lname = results[i]['lname'].trim();
                        var gender = results[i]['gender'].trim();
                        var ucc_mail = results[i]['ucc_mail'].trim();
                        var phone = results[i]['phone'].trim();
                        var password = results[i]['password'].trim();;    
                        var job = results[i]['jobtitle'].trim();
                        var unit = results[i]['unitname'].trim();    
                        console.log({lname, mname, fname, gender,phone,unit});
                        if(staffno != ''){
                            // Current Job designation
                            var job_id,unit_id;
                            var jb = await dbx.query("select * from job where title ='"+job+"'");
                            if(jb.length == 0){
                                job_id = 0;
                            }else{
                                job_id = jb[0].id;
                            } 
                            // Current Unit
                            var un = await dbx.query("select * from unit where long_name ='"+unit+"'");
                            if(un.length == 0){
                                unit_id = 0;
                            }else{
                                unit_id = un[0].id;
                            } 
    
                            var st = await dbx.query("select s.*,j.id as jid from staff s left join `user` j on j.staff_no = s.staff_no where s.staff_no = "+staffno);
                            // New Promotion and Appointment
                            var promdata = {job_id,unit_id,staff_no:staffno};
                            var promo_id;
                            if(st.length > 0 && st[0].promo_id != null){
                                promo_id = st[0].promo_id;
                                let prom = await dbx.query("update promotion set ? where id = "+promo_id,promdata);   // Fix staff_no on promotion record                         
                            }else{
                                let prom = await dbx.query("insert into promotion set ?",promdata);   // Fix staff_no on promotion record                         
                                promo_id = prom.insertId;
                            }
                            // Add User Role 
                            var roledata = {username:staffno,password,role:'03',roles:'03',staff_no:staffno};
                            if(st.length > 0 && st[0].jid != null){
                                await dbx.query("update `user` set ? where staff_no = "+staffno,roledata);
                            }else{
                                await dbx.query("insert into `user` set ?",roledata);
                            }

                            // Staff Bio
                            let stdata = {staff_no:staffno,fname,mname,lname,gender,promo_id,phone,ucc_mail,staff_status:'PERMANENT'};
                            if(st.length > 0){
                                 await dbx.query("update staff set ? where staff_no = "+staffno,stdata);
                            }else{
                                 await dbx.query("insert into staff set ?",stdata);
                            }
                        } 
                    }       
                    // Redirect to student page
                    res.redirect('/hrm/dash');  
                   //res.json(results);             
                });
           }); 
    
    
    
        } // END OF FIXES  -- LOCAL ENV
    
    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------
    
              // STAFF REPORTS
    
            /*  All Senior Members */
            app.get('/strep1', async(req,res) => {
                let sql = await dbx.query("select s.staff_no as 'STAFF NO',concat(s.fname,' ',ifnull('',s.mname),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',u.long_name as 'UNIT',j.title as 'DESIGNATION',s.phone as 'PHONE',s.ucc_mail as 'EMAIL',date_format(s.dob,'%d/%m/%Y') as 'DATE OF BIRTH',date_format(p.appoint_date,'%d/%m/%Y') as 'CURRENT APPOINTMENT' from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where p.staff_group = 'SM'");
                console.log(sql);
                res.xls('senior_members.xlsx',sql);
            });
    
             /*  All Senior Staff */
             app.get('/strep2', async(req,res) => {
                let sql = await dbx.query("select s.staff_no as 'STAFF NO',concat(s.fname,' ',ifnull('',s.mname),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',u.long_name as 'UNIT',j.title as 'DESIGNATION',s.phone as 'PHONE',s.ucc_mail as 'EMAIL',date_format(s.dob,'%d/%m/%Y') as 'DATE OF BIRTH',date_format(p.appoint_date,'%d/%m/%Y') as 'CURRENT APPOINTMENT' from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where p.staff_group = 'SS'");
                console.log(sql);
                res.xls('senior_staff.xlsx',sql);
            });
    
            /*  All Senior Staff */
            app.get('/strep3', async(req,res) => {
                let sql = await dbx.query("select s.staff_no as 'STAFF NO',concat(s.fname,' ',ifnull('',s.mname),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',u.long_name as 'UNIT',j.title as 'DESIGNATION',s.phone as 'PHONE',s.ucc_mail as 'EMAIL',date_format(s.dob,'%d/%m/%Y') as 'DATE OF BIRTH',date_format(p.appoint_date,'%d/%m/%Y') as 'CURRENT APPOINTMENT' from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id where p.staff_group = 'JS'");
                console.log(sql);
                res.xls('junior_staff.xlsx',sql);
            });
    
            /*  All Senior Staff */
            app.get('/strep4', async(req,res) => {
                let sql = await dbx.query("select s.staff_no as 'STAFF NO',concat(s.fname,' ',ifnull('',s.mname),' ',s.lname) as 'FULL NAME',s.gender as 'GENDER',u.long_name as 'UNIT',j.title as 'DESIGNATION',s.phone as 'PHONE',s.ucc_mail as 'EMAIL',date_format(s.dob,'%d/%m/%Y') as 'DATE OF BIRTH',date_format(p.appoint_date,'%d/%m/%Y') as 'CURRENT APPOINTMENT' from staff s left join promotion p on s.promo_id = p.id left join job j on j.id = p.job_id left join unit u on p.unit_id = u.id");
                console.log(sql);
                res.xls('all_staff.xlsx',sql);
            });
    

            // Fix Leave Ended - Resetter
            app.get('/resetleave', async(req,res) => {
                var hd = await dbx.query("select distinct s.staff_no,s.flag_leave,s.flag_leave_lock,l.status,s.id from staff s left join leave_dump l on l.staff_no = s.staff_no where s.staff_status IN ('TEMPORAL','PERMANENT') and (s.flag_leave is NULL or s.flag_leave = 1)");
                if(hd.length > 0){
                    for(var c of hd){
                        console.log(c.staff_no+' : flag status: '+c.flag_leave);
                        if(['CANCELLED','ENDED'].includes(c.status)){
                            // Reset Leave Flags in Staff tbl
                            var ins = await dbx.query("update staff set flag_leave = 0, flag_leave_lock = 0 where id = "+c.id);
                            console.log(ins);
                        }   
                    }
                } 
                // Redirect to student page
                res.redirect('/hrm/dash');  

            });
    
    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------
     
            // 404 - REDIRECTION
            app.all('*', function(req, res){
                res.redirect('/login');
            });
    
    
    
    
            return app;
    })();
