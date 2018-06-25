

module.exports = (app,conn,init) => {

    /* Settings and Configurations */
    app.get('/api/config',(req,res) => {       
        conn((err,db) => {
                // Run Queries with Connection 'db'
                db.query("select * from settings", (err,rows)=>{
                    if(err) throw err;
                    if(rows <= 0){
                        res.json({
                            success : false, 
                            message: "No result found!"                           
                        });
                    }else{
                        res.json({
                            success : true,
                            data : rows
                        });
                    }                   
                    db.release();                    
                    // Dont use connection here has been released to pool.
                });
        });                
    });

    /* Dashboard Routings */

    //## USER LOGIN WITH FB-ID
    app.get('/api/login/:id',(req,res) => {
        var id = req.params.id;
        conn((err,db) => {
                // Run Queries with Connection 'db'
                db.query("select * from user where facebook_id = "+id, (err,rows)=>{
                    if(err) throw err;
                    if(rows <= 0){
                        res.json({
                            success : false, 
                            message: "No user found!"                           
                        });
                    }else{
                        res.json({
                            success : true,
                            data : rows
                        });
                    }                   
                    db.release();                    
                    // Dont use connection here has been released to pool.
                });
        });                
    });

    
    //## CREATE NEW USER
    app.post('/api/createuser',(req,res) => {
            var body = req.body;
            //res.json(body);

            conn((err,db) => {               
                     // Run Queries with Connection 'db'                     
                     db.query("insert into user set ?", req.body, (err,result)=>{
                        if(err) console.error(err);
                        if(result.insertId <= 0 || result.insertId !== null){
                            db.query("select * from user where id = "+result.insertId, (err,rows)=> {
                                if(err) throw err;                               
                                res.json({
                                    success : true,
                                    data : rows
                                });        
                            });                  
                        }
                        db.release();                    
                        // Dont use connection here has been released to pool.
                    });                   
            });          
    });




    //## USER CONFIG FILE
    app.get('/api/userconfig/:id',(req,res) => {
        var id = req.params.id;
        conn((err,db) => {
                // Run Queries with Connection 'db'
                db.query("select * from config where user = "+id, (err,rows)=>{
                    if(err) throw err;
                    if(rows <= 0){
                        res.json({
                            success : false, 
                            message: "No Config record found for user!"                           
                        });
                    }else{
                        res.json({
                            success : true,
                            data : rows
                        });
                    }                   
                    db.release();                    
                   // Dont use connection here has been released to pool.
                });
        });                
    });


   

    //## FETCH MATCH TO PAY
    app.get('/api/fetchpay/:id',(req,res) => {
        var id = req.params.id;
        conn((err,db) => {
                // Fetch Records of Payments to be made
                db.query("select s.*,r.*,p.* from pledge p inner join roi on p.id = r.matched_pledge inner join user s on s.facebook_id = r.receiver where p.paid = 0 and r.paid = 0 and p.donor = "+id, (err,rows)=>{
                    if(err) throw err;
                    if(rows <= 0){
                        res.json({
                            success : false, 
                            message: "No payments to make!"                           
                        });
                    }else{
                        res.json({
                            success : true,
                            data : rows
                        });
                    }                   
                    db.release();                    
                   // Dont use connection here has been released to pool.
                });
        });                
    });


    //## REMATCH TO RECEIVER
    app.get('/api/rematchrec/:id/:pledge_id',(req,res) => {
        var id = req.params.id; var id = req.params.pledge_id;
        conn((err,db) => {
            
                //# Check IF Receiver has delayed and Charge  
                db.query("select r.*,s.* from roi r left join user s on s.facebook_id = r.receiver where r.matched_pledge = "+pledge_id, (err,rows)=>{
                    if(err) throw err;
                    if(rows > 0){                          
                        var hours =  Math.abs(new Date() - new Date(rows[0].date)) / 36e5;                        
                        if(hours <= 3){
                            // If within 3hrs  -- disable account of Receiver 
                                
                        }else{
                           // If Exceeds 3hrs -- Disable Account of Receiver
                             db.query("update user set active = '0' where facebook_id = "+rows[0].receiver,(err,rows)=>{
                                 if(err) console.error(err);
                             });
                           // Charge Coins on Receiver's Account
                             var coins = init.coins(db,rows[0].receiver,'CR',100);

                           // Log Charges in Report Table
                              init.reports(db,rows[0].receiver,"CL",coins);

                        }
                    }               
                    
                });              
                                    

                // Un-match Donor with culprit Receiver

                // Run Matching System excluding Receiver

             
        });                
    });



    app.get('/api/',(req,res) => {
        res.send(init.match());
    });



}