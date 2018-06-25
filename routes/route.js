// File Upload
var multer = require('multer');
var path = require('path');

var docStore = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/upload/doc');
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

var doc = multer({ storage: docStore }).fields([
    { name: 'birth_cert', maxCount: 1},
    { name: 'cv_cert', maxCount: 1},
    { name: 'ma_cert', maxCount: 1 },
    { name: 'medic_cert', maxCount: 1 },
    { name: 'appoint_cert', maxCount: 1 }
]);

var cert = multer({ storage: certStore}).single('cert');

var relative = multer({ storage: relateStore}).fields([
    { name: 'photo', maxCount: 1},
    { name: 'birth', maxCount: 1}    
]);

//////////////////////////////////////////////////////////////////////////


module.exports = (app,conn,init,dbx) => {

        app.get('/',(req,res) => {         
                res.redirect('/login');                  
        });


        // Login Page
        app.get('/login',(req,res) => {       
            res.render('login');
        });


        // Fetch Login Details
        app.post('/login', async(req,res) => { 
            
            console.log(req.session);
            if (!req.body.username || !req.body.password) {
                //res.render('login', { message: "Please enter both Username and Password" });
                res.send("Please enter both Username and Password");
            }else{
                let data = [req.body.username, req.body.password];
                try{
                    let rows = await dbx.query("select u.*,s.* from user u left join staff s on u.staff_no = s.staff_no where u.username = ? and u.password = ?",data);
                    req.session.user = rows[0];
                    res.redirect('/hrm/dash');

                } catch(e){
                    res.render('login', { message: "Invalid credentials!" }); console.log("Invalid credentials!");
                }                             
            } 
        });


        app.get('/hrm/dash',(req, res) => {
            res.render('index_hr', {
                view: 'dash',
                title: 'HR DASHBOARD ',
                user: req.session.user
            });
        });


        app.get('/hrm/appoint', (req, res) => {
            // res.send("Welcome Back!");
            res.render('index_hr', {
                view: 'appoint',
                title: 'APPOINTMENT MODULE',
                user: req.session.user
            });
        });

    


        // Logout User
        app.get('/logout',(req,res) => { 
            req.session.destroy();      
            res.render('login');
        });


    /* HR MODULE ROUTING */

            // HR Dashboard
        /* 
            app.get('/hrm/:view/',(req,res) => {      
                // res.send("Welcome Back!");
                res.render('index_hr',{
                    view:req.params.view                
                });
            });
        */

      
        // HRM Page
        app.get('/hrm', (req, res) => {
            res.redirect('/hrm/staff');
        });


        // Staff Module
        app.get('/hrm/staff', async(req,res) => {                
               let rows = await dbx.query("select DATE_FORMAT(s.dob,'%Y-%m-%d') as dobx,s.*,u.*,sc.*,b.title as job_title,sr.title as scale from staff s left join job b on s.job_id = b.id  left join unit u on u.id = s.unit_id left join scale_notch sc on sc.id = s.scale_id left join scale_range sr on sc.range_id = sr.id");                  
                res.render('index_hr',{
                    view:'staff',
                    title:'STAFF MODULE',
                    data: rows,
                    user: req.session.user
                });                  
        });


        // Staff Appointment Letter
        app.get('/hrm/staff/appoint/:id', async(req,res) => {                
        let rows = await dbx.query("select * from promo where category = 'APPOINTMENT' and id = "+req.params.id);                  
        let pa = rows[0].path.toString().split('\\').join('/'); 
        res.redirect("/viewer/#"+pa);                          
        });


        // Post Staff Biodata
        app.post('/hrm/poststaff',doc,async(req,res)=>{       
                         
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

                   if (req.files.appoint_cert != null) { 
                        console.log(req.files.appoint_cert);
                        await dbx.query("update doc set `default` = null where category = 'APPOINT' and staff_no = "+req.body.staff_no);
                        let data = { title: 'APPOINTMENT LETTER OF STAFF : ' + req.body.staff_no, staff_no: req.body.staff_no, category: 'APPOINTMENT', date: new Date(), path: '\\' + req.files.appoint_cert[0].path, active: '1', default:'1' };
                        let promo = await dbx.query("insert into promo set ?", data);
                        req.session.appoint_id = promo != null ? promo.insertId : 0;
                        req.session.save();
                       
                    }                       
               }
              
                let bio = {
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
                    phone: req.body.phone,
                    email: req.body.email,
                    address: req.body.address,
                    mstatus: req.body.mstatus,
                    staff_no: req.body.staff_no,        
                    ssnit: req.body.ssnit,
                    ucc_mail: req.body.ucc_mail,
                    unit_id: req.body.unit_id,
                    scale_id: req.body.scale_id,
                    job_id: req.body.job_id,
                    staff_group: req.body.staff_group,
                    appoint_id: (req.session.appoint_id != null ? req.session.appoint_id : req.body.appoint_id)
                }
                  
                  // Reset appoint_id to null
                    req.session.appoint_id = null;
                    req.session.save();                    
                console.log(req.body);
                 // Save Data 
                  if(req.body.id == 0){
                      await dbx.query("insert into staff set ?", bio);
                      res.redirect('/hrm/staff'); 
                  }else{                      
                      await dbx.query("update staff set ? where id ="+req.body.id,bio);
                      res.redirect('/hrm/staff'); 
                  }         
                  
        });


        // Add New Staff Biodata
        app.get('/hrm/addstaff',async(req,res) => {           
            // Generate Staff Number
            let lst = await dbx.query("select * from staff order by id desc");
            let new_staff_no = lst[0]['staff_no'] + 1;            
            let group = req.query.gp || 'JS';
            console.log(req.query);
            // Initialize Form
            let rows = await dbx.query("select sc.*,sr.* from scale_notch sc left join scale_range sr on sc.range_id = sr.id where sc.active = '1'; select * from job where active = '1'; select * from unit where active = '1'");
            res.render('index_hr',{
                view:"addstaff",
                title: "ADD NEW STAFF | "+(group == 'SM'? ' SENIOR MEMBER ' : (group == 'SS' ? ' SENIOR STAFF ':' JUNIOR STAFF ')),
                data: { bio: { id: 0, staff_no: new_staff_no,staff_group: group}, doc: [{ id: 0 }], scales: rows[0], jobs: rows[1], units: rows[2], appoints: null},
                user: req.session.user               
            });
               
        });


         // Edit Staff Biodata
        app.get('/hrm/editstaff/:staff',async(req,res) => {                 
            let id = req.params.staff;
            let rows = await dbx.query("select *,DATE_FORMAT(dob,'%Y-%m-%d') as dobx from staff where staff_no = " + id + "; select * from doc where staff_no =" + id + "; select sc.*,sr.* from scale_notch sc left join scale_range sr on sc.range_id = sr.id where sc.active = '1'; select * from job where active = '1'; select * from unit where active = '1'; select * from promo where active = '1' and category = 'APPOINTMENT' and staff_no = "+id);
            res.render('index_hr', {
                view: 'addstaff',
                title: 'EDIT STAFF  >  '+(rows[0][0].fname +' '+rows[0][0].mname+' '+rows[0][0].lname).toUpperCase(),
                data: { bio: rows[0][0], doc: rows[1], scales: rows[2], jobs : rows[3], units: rows[4],appoints : rows[5]},
                user: req.session.user
            });                    
        });

        // Delete Staff Biodata
        app.get('/hrm/delstaff/:id', async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from staff where id = "+id);
            res.redirect('/hrm/staff');              
        });        


         // Add New Staff Family
        app.get('/hrm/addfamily/:staff',async(req,res) => { 
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
       app.get('/hrm/editfamily/:id',async(req,res) => { 
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
        app.get('/hrm/delfamily/:id/:staff',async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from staff_rel where id = "+id);
            res.redirect('/hrm/staff/page/'+req.params.staff);              
        });   

        // Post Staff Biodata
        app.post('/hrm/postfamily',relative,async(req,res)=>{       
                         
            if(req.files != null){                
                if (req.files.photo != null){
                    req.body.photo = '\\' + req.files.photo[0].path;                    
                }
                if (req.files.birth != null) {
                    req.body.path = '\\' + req.files.birth[0].path;  
                }                                 
            }         
           
            if(req.body.relation == 'SPOUSE' && req.body.id <= 0){
                // INSERT SPOUSE
                let code = req.body.staff_no+'A';
                let exist = await dbx.query("select * from staff_rel where code = '"+code+"'");
                if(exist.length == 0){
                    req.body.code = code;
                    await dbx.query("insert into staff_rel set ?", req.body);
                }

            }else if(req.body.relation == 'CHILD' && req.body.id <= 0){
                // INSERT CHILD
                let child = await dbx.query("select * from staff_rel where relation = 'CHILD'");
                let codes = ['B','C','D','E','F','G','H','I','J','J','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                let code = req.body.staff_no+(codes[child.length]);
                let exist = await dbx.query("select * from staff_rel where code = '"+code+"'");
                if(exist.length == 0){
                    req.body.code = code;
                    await dbx.query("insert into staff_rel set ?", req.body);
                }

            }else if((req.body.relation == 'PARENT' || req.body.relation == 'KIN') && req.body.id <= 0){
                // INSERT PARENT               
                   await dbx.query("insert into staff_rel set ?", req.body);                

            }else{
                // UDATE ANY RELATIVE
                   await dbx.query("update staff_rel set ? where id ="+req.body.id,req.body);
            }
            res.redirect('/hrm/staff/page/'+req.body.staff_no);                
     });


       // Add Bank Account
       app.get('/hrm/addbank/:staff',async(req,res) => {            
        // res.send("Welcome Back!");
           res.render('index_hr',{
               view:"addbank",
               title: "ADD BANK ACCOUNT",
               user: req.session.user,
               row : {id:0,staff_no:staff,staff_group: group}               
           });    
        });


            // Edit Bank Account
        app.get('/hrm/editbank/:id',async(req,res) => { 
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
        app.get('/hrm/delbank/:id/:staff',async(req, res) => {
            let id = req.params.id;
            await dbx.query("delete from bank where id = "+id);
            res.redirect('/hrm/staff/page/'+req.params.staff);              
        });  
        
        
         // Post Bank Account
         app.post('/hrm/postbank',async(req,res)=>{           
            if(req.body.id <= 0){  
                req.body.date_added = new Date();                        
                await dbx.query("insert into bank set ?", req.body);  
            }else{               
                await dbx.query("update bank set ? where id ="+req.body.id,req.body);
            }
            res.redirect('/hrm/staff/page/'+req.body.staff_no);                                
         });


         // Set Default Bank Account
         app.get('/hrm/setbank/:id/:staff',async(req,res)=>{                                    
            await dbx.query("update bank set active = '0' where staff_no = "+req.params.staff);  
            await dbx.query("update bank set active = '1' where id = "+req.params.id);  
            await dbx.query("update staff set bank_id = "+req.params.id+" where staff_no = "+req.params.staff);             
            res.redirect('/hrm/staff/page/'+req.params.staff);                                
         });



        

       // Add Academic Certificate
       app.get('/hrm/addcert/:staff',async(req,res) => { 
           let staff = req.params.staff;
           // res.send("Welcome Back!");
            res.render('index_hr',{
                view:"addcert",
                title: "ADD ACADEMIC CERTIFICATE",
                user: req.session.user,
                row: {id:0,staff_no: staff}              
            });
        });


            // Edit Academic Certificate
        app.get('/hrm/editcert/:id',async(req,res) => { 
                let id = req.params.id;
                let rows = await dbx.query("select *,DATE_FORMAT(start_date,'%Y-%m-%d') as sdate, DATE_FORMAT(end_date,'%Y-%m-%d') as edate, DATE_FORMAT(grad_date,'%Y-%m-%d') as gdate from certificate where id = "+id);
            // res.send("Welcome Back!");
                res.render('index_hr',{
                    view:"addcert",
                    title: "EDIT ACADEMIC CERTIFICATE",
                    user: req.session.user,
                    row: rows[0]               
                });
        });


         // Post Academic Certificate
         app.post('/hrm/postcert',cert,async(req,res)=>{       
                         
                      
            if (req.file != null){
                req.body.path = '\\' + req.file.path; 
                console.log(req.files);                   
            }                                                        
                 
            if(req.body.id <= 0){                            
                   await dbx.query("insert into certificate set ?", req.body);                

            }else{                
                   await dbx.query("update certificate set ? where id ="+req.body.id,req.body);
            }
            console.log(req.body); 
            res.redirect('/hrm/staff/page/'+req.body.staff_no);                
        });




        // View Staff File
        app.get('/hrm/staff/view/:staff',async(req,res) => {            
            let staff = req.params.staff; 
            let bio = await dbx.query("select s.*,DATE_FORMAT(dob,'%d/%m/%Y') as dobx,b.*,p.path as appoint,sc.notch,sr.title,j.title as jobtitle from staff s left join bank b on b.id = s.bank_id left join scale_notch sc on sc.id = s.scale_id left join scale_range sr on sc.range_id = sr.id left join promo p on s.appoint_id = p.id left join job j on s.job_id = j.id where s.staff_no = "+staff);
            let rel = await dbx.query("select *,DATE_FORMAT(dob,'%d/%m/%Y') as dobx from staff_rel where staff_no = "+staff);
            let cert = await dbx.query("select * from certificate where staff_no = "+staff);
            let doc = await dbx.query("select * from doc where `default` = 1 and staff_no = "+staff);
           
                      
            res.render('partials/hr_staffview',{
                view:'staffview',
                title:'STAFF FILE',
                data: {bio:bio[0],rel,cert,doc},
                user: req.session.user
            });           
        });
  


        // View Staff Page
        app.get('/hrm/staff/page/:staff',async(req,res) => { 
            let id = req.params.staff;                           
            let rows = await dbx.query("select * from bank where staff_no ="+id+";select * from staff_rel where staff_no=" + id + "; select * from certificate where staff_no ="+id+"; select *,DATE_FORMAT(dob,'%Y-%m-%d') as dobx from staff where staff_no = "+id);
            res.render('index_hr', {
                view: 'staffpage',
                title: 'STAFF PAGE  >  ' + (rows[3][0].fname + ' ' + rows[3][0].mname + ' ' + rows[3][0].lname).toUpperCase(),
                data: { rel: rows[1], bank: rows[0], cert: rows[2] ,bio: rows[3][0]},
                user: req.session.user
            });
           
        });

       
        app.get('/hrm/vletter/:id',(req,res) => {              
           /* 
            conn((err,db) => {
                // Run Queries with Connection 'db'
               db.query("select l.id as lid,s.*,d.*,u.*,sc.*,l.*,b.title as job_title,sc.title as scale from staff_bio s left join staff_data d on s.staff_no = d.staff_no left join jobs b on d.job_id = b.id left join letters l on l.id = d.letter_id left join unit u on u.id = s.unit_id left join scale sc on sc.id = s.scale_id",(err,rows) => {                     
                    res.render('index_hr',{
                        view:'staff',
                        title:'STAFF MODULE',
                        data : rows
                    });                    
                    db.release();                    
                    // Dont use connection here has been released to pool.
                });           
            });
            */
             res.render('letters/vappoint',{
                 user: req.session.user
             });
        });






  
  /* STAFF MODULE ROUTING */

        // Staff Dashboard
        app.get('/staff',(req,res) => {          
            res.render('staff', {
                user: req.session.user
            });
        });

      
       


}