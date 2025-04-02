var express = require('express');
var app = express();
var dbx = require('../config/database');
var moment = require('moment-business-days');
var mailer = require('../routes/email');
var sms = require('../config/sms');
           

module.exports = (function() {
   'use strict';

   // if(process.env.appType == 'local'){

       /* DAILY CRONS */
       setInterval(async () => {
                    
         // LEAVE SCRIPTS | #1# Check for Completed Leave & Update
         var cp = await dbx.query("select l.id as lid,l.*,s.*,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name from leave_dump l left join staff s on l.staff_no = s.staff_no where l.status = 'GRANTED'");
         if(cp.length > 0){
            cp.map(async c => {
                    //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                    let days = moment(c.end_date,'YYYY-MM-DD').diff(moment(),'days');
                    var email = c.ucc_mail != null ? c.ucc_mail : 'hrms@ucc.edu.gh';
                    var phone = c.phone != null ? c.phone : '0277675089';
                    
                    if(days == 3){
                        // Notify Staff of Leave Completion
                        let data = {action : 'Leave Notice : '+c.staff_no,message : 'Leave application with ID: '+c.lid+' and STAT(D:'+c.approved_days+',E:'+c.entitlement+') is '+days+' day(s) from completion. ', staff_no : c.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                        await dbx.query("insert into notification set ?", data);
                        var msg = 'Your are reminded that your leave shall expire in three(3) days time. You shall report on '+c.resume_date+' and note that your resumption shall be verified! <br> Thank you very much.';
                        var msg_sms = `Please,${c.staff_no  } note that your leave shall expire in three(3) days time and you are expected to report on `+c.resume_date+'. Thank you very much.';
                        var name = c.name;
                        var title = 'LEAVE REMINDER - 3 DAYS TO COMPLETION';
                        //mailer(email,name,title,msg);
                        await sms(phone,msg_sms);

                    } else if(days <= 0){
                        // Update Status = ENDED
                        await dbx.query("update leave_dump set status = 'ENDED' where id = "+c.lid);
                        // Reset Leave Flags in Staff tbl
                        await dbx.query("update staff set flag_leave = 0, flag_leave_lock = 0 where staff_no = "+c.staff_no);
                        // Notify Staff of Leave Completion
                        let data = {action : 'Leave Completed by Staff : '+c.staff_no,message : 'Leave application with ID: '+c.lid+' and STAT(D:'+c.approved_days+',E:'+c.entitlement+') has been served. ', staff_no : c.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                        await dbx.query("insert into notification set ?",data);
                        // Mail Staff   
                        var msg = 'Your leave requested is exhausted. Please report to duty on '+c.resume_date+' and note that your resumption shall be verified! <br> Thank you very much.';
                        var msg_sms = 'Congrats! You have served your leave requested. Please report to duty on '+c.resume_date+' and regards !';
                        var name = c.name;
                        var title = 'LEAVE COMPLETION';
                        //mailer(email,name,title,msg);
                        await sms(phone,msg_sms);
                    }
            });
         }

         /*
         // LEAVE SCRIPTS | #2# Automatic HR-Head Approver
         var cp = await dbx.query("select l.id as lid,l.*,s.* from leave_dump l left join staff s on l.staff_no = s.staff_no where l.status = 'HR-PENDING'");
         if(cp.length > 0){
            cp.map(async c => {
                    //let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');moment(rows[0].reg_date).format('YYYY-MM-DD')
                    let days = moment().diff(moment(c.start_date,'YYYY-MM-DD'),'days');
                    var head = 15404 || req.session.user.staff_no; // Emmanuel Ampofo as HR_Head_Endorser 
                    if(days >= -1 ){
                        var id = c.lid;     
                        await dbx.query("update leave_dump set status = 'GRANTED',hr_date = NOW(),hr_endorse = "+head+" where id ="+id);
                        // Notification - Staff
                        let st = await dbx.query("select s.*,l.*,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name from leave_dump l left join staff s on l.staff_no = s.staff_no where l.id ="+id);
                        let data = {action : 'Leave Approval - DHR',message : 'Leave application with STAT( D:'+st[0].approved_days+',E:'+st[0].entitlement+' ) pending approval at DHR has been granted at '+st[0].hr_date, staff_no : st[0].staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                        await dbx.query("insert into notification set ?",data);
                        // Mail Staff   
                        var email = st[0].ucc_mail != null ? st[0].ucc_mail : 'hrms@ucc.edu.gh';
                        var msg = 'Your leave request has been approved and it starts exactly on '+st[0].start_date+'. The Leave statistics are ( Approved days :'+st[0].approved_days+', Entitlement :'+st[0].entitlement+' ). Please enjoy your leave! <br> Thank you very much.';
                        var name = st[0].name;
                        var title = 'LEAVE APPLICATION HAS BEEN GRANTED';
                        mailer(email,name,title,msg);
                    }
            });
         }
         */

      
   
           // LEAVE SCRIPTS | #3# UNIT HEAD APPROVALS ALERT
           var hd = await dbx.query("select l.id as lid,l.start_date,l.end_date,l.approved_days,l.entitlement,l.staff_no,l.status,x.phone as head_phone,x.ucc_mail as head_mail,x.staff_no as head_sno from leave_dump l left join staff s on l.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join unit u on p.unit_id = u.id left join staff x on u.unit_head = x.staff_no where l.status = 'HEAD-PENDING' and year(applied_date) = year(now())");
           if(hd.length > 0){
                var users = {};
                for(var c of hd){
                  let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');
                  if(days < 3){
                    users[c['head_sno']] = users[c['head_sno']] == null ? {} : users[c['head_sno']];
                    users[c['head_sno']]['count'] = users[c['head_sno']]['count'] != null ? (users[c['head_sno']]['count']+1) : 1;
                    users[c['head_sno']]['data'] = {'phone': c['head_phone'],'email': c['head_mail'],'staff_no': c['head_sno'], 'members': ( users[c['head_sno']]['data']['members'] != null ? users[c['head_sno']]['data']['members']+','+c?.lid : users[c['head_sno']]['data']['members']) };
                  }
                  if(days > 3){
                     /* Approve Leave as Head After 3-Days */
                    //  var id = c?.lid; 
                    //  var head = '11219';   
                    //  await dbx.query("update leave_dump set status = 'GRANTED',head_date = NOW(),head_endorse = "+head+" where id ="+id);
                    //  // Notification - Staff
                    //  let st = await dbx.query("select s.*,l.*,concat(s.fname,' ',ifnull(s.mname,''),' ',s.lname) as name from leave_dump l left join staff s on l.staff_no = s.staff_no where l.id ="+id);
                    //  let data = {action : 'Leave Approval - Head',message : 'Leave application with STAT( D:'+st[0].approved_days+',E:'+st[0].entitlement+' ) pending approval at Head was approved at '+st[0].head_date, staff_no : st[0].staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                    //  await dbx.query("insert into notification set ?",data);
                    //  // Mail Staff   
                    //  var email = st[0].ucc_mail != null ? st[0].ucc_mail : 'hrms@ucc.edu.gh';
                    //  var msg = 'Your leave request has been approved and it starts exactly on '+st[0].start_date+'. The Leave statistics are ( Approved days :'+st[0].approved_days+', Entitlement :'+st[0].entitlement+' ). Please enjoy your leave! <br> Thank you very much.';
                    //  var name = st[0].name;
                    //  var title = 'LEAVE APPLICATION HAS BEEN GRANTED';
                    //  //mailer(email,name,title,msg);

                  }
                }

                for(var u of Object.values(users)){
                  // Notify Staff of Leave Completion
                  if(u.count >= 1){
                    let data = {action : 'Leave Approval Notice : '+u.data.staff_no,message : 'Greetings, You have pending leave approvals in your dashboard, Please do well to respond to the leave request of the staff. ', staff_no : u.data.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                    await dbx.query("insert into notification set ?",data);
                    // mailer(u.data.email,u.data.staff_no,'Leave Approval Notice ','Greetings, You have '+u.count+' pending leave approvals in your staff portal dashboard, Please do well to respond to the leave request of the staff with https://staffportal.ucc.edu.gh.');
                    await sms(u.data.phone,'Greetings, Please do well to respond to the '+u.count+' pending leave request of assigned staff in your staff portal. Kindly respond in three(3) days or the auto-approve feature will be turned-on. Thank you!');
                  }
                }
           }



           // LEAVE SCRIPTS | #4# DHR HEAD APPROVALS ALERT
           var approvers = ['11219','15404'];
           var hd = await dbx.query("select l.id as lid,l.*,s.* from leave_dump l left join staff s on l.staff_no = s.staff_no where l.status = 'HR-PENDING' and year(applied_date) = year(now())");
           if(hd.length > 0){
                var count = 0;
                for(var c of hd){
                    let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');
                    if(days > 3){
                        count += 1;
                    }
                }
                if(count >= 1){
                    let data = {action : 'Leave Approval Notice : '+u.data.staff_no,message : 'Greetings, You have pending leave approvals in your dashboard, Please do well to respond to the leave request of the staff as mandated by DHR-UCC. ', staff_no : u.data.staff_no, datetime : new Date(),read_flag : '0',priority : '1'}
                    await dbx.query("insert into notification set ?",data);
                    for(var sno of approvers){
                       var ss = await dbx.query("select * from staff where staff_no = "+sno);
                       // mailer(ss[0].ucc_mail,ss[0].staff_no,'Leave Approval Notice ','Greetings, You have '+count+' pending leave approvals in your HRMS dashboard, Please do well to respond to the leave requests of the staff with https://hrms.ucc.edu.gh/login');
                       await sms(ss[0].phone,'Greetings, Please do well to respond to the '+count+' leave approval request in your HRMS dashboard at https://hrms.ucc.edu.gh/login. Thank you!');
                    }
                }
            }


            // LEAVE SCRIPTS | #5# AUTO LEAVE RESETTER
            var hd = await dbx.query("select s.staff_no,s.flag_leave,s.flag_leave_lock,l.status,s.id from staff s left join leave_dump l on l.staff_no = s.staff_no where s.staff_status IN ('TEMPORAL','PERMANENT')");
            if(hd.length > 0){
                for(var c of hd){
                    if(['CANCELLED','ENDED'].includes(c.status)){
                        // Reset Leave Flags in Staff tbl
                        var ins = await dbx.query("update staff set flag_leave = 0, flag_leave_lock = 0 where staff_no = "+c.id);
                        console.log(ins);
                    }   
                }
            } 


            // LEAVE SCRIPTS | #6# RETIRE LEAVE BALANCES FOR NEXT YEAR
            if(moment().isSame(`${new Date().getFullYear()}-12-31`, 'day') && (new Date().getFullYear() != '2020')){
                var hd = await dbx.query("select b.*,s.gender,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type from leave_balance b left join staff s on b.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_status IN ('TEMPORAL','PERMANENT') and b.active = '1'");
                    if(hd.length > 0){
                        for(var hx of hd){
                            if(hx.weight > 0){
                                var approved = await dbx.query("SELECT sum(approved_days) as ent FROM `leave_dump` where staff_no = "+hx.staff_no+" and type_id = 2 and status in ('GRANTED','ENDED') and year(applied_date) ='"+(new Date().getFullYear())+"'");  
                                var con_add = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '"+hx.staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+hx.staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                                var con_sub = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '"+hx.staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+hx.staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                                var weight;    
                                switch(hx.staff_group){
                                    case 'SS':
                                        var k = weight = await dbx.query("SELECT * FROM leave_weight where `group` = '"+hx.staff_group+"' and type_id = 2");  
                                        break;
        
                                    case 'JS':
                                        let check = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+hx.staff_group+"'  and type_id = 2 and find_in_set('"+hx.job_id+"',jobs) > 0");  
                                        if(check.length <= 0){ 
                                            weight = await dbx.query("select * from `leave_weight` where `group` = '"+hx.staff_group+"' and type_id = 2 and jobs IS NULL");
                                        }else{  
                                            weight = check;
                                        }   break;
        
                                    case 'SM':
                                        weight = (hx.staff_type == 'NON-ACADEMIC') ? await dbx.query("SELECT * FROM leave_weight where `group` = '"+hx.staff_group+"' and type_id = 2") : [{weight:null}];  
                                        break;
                                            
                                    default : 
                                        weight = [{weight:null}];
                                        break;
                                }
                                var sub = (con_sub.length > 0 ? con_sub[0].weight : 0), add = (con_add.length > 0 ? con_add[0].weight : 0);
                                var used = (approved.length > 0 ? approved[0].ent : 0), days = (weight[0].weight-sub+add-used);
                                
                                if(days <= 0){
                                    var dayx = hx.weight+days;
                                    if(dayx <= 0){
                                       await dbx.query("update leave_balance set weight = "+dayx+",active = '0', history = concat('S_"+days+",',history) where staff_no = "+hx.staff_no);
                                    }else{
                                       await dbx.query("update leave_balance set weight = "+dayx+", history = concat('S_"+days+",',history) where staff_no = "+hx.staff_no);
                                    }
                                }
                            }
                        }
                        
                    }
            }


            // NSS SCRIPTS | #7# - UPDATE COMPLETED NSS STAFF DATA TO INACTIVE
            var hd = await dbx.query("select * from hr.nss where active = '1'");
            if(hd.length > 0){
                for(var c of hd){
                    let days = moment().diff(moment(c.end_date,'YYYY-MM-DD'),'days');
                    if(days > 0){
                        // Reset Leave Flags in Staff tbl
                        var ins = await dbx.query("update hr.nss set active = '0' where nss_no = '"+c.id+"'");
                        console.log(ins);
                    }   
                }
            } 

            await sms('0206446438','Greetings, Please do well to respond!');
        



       }, 10000);
   // }
// 86400000

setInterval(async () => {
    /*
    if(moment().isSame(`${new Date().getFullYear()}-11-17`, 'day')){
        var hd = await dbx.query("select b.*,s.gender,s.staff_status,p.staff_group,p.job_id,p.unit_id,j.type as staff_type from leave_balance b left join staff s on b.staff_no = s.staff_no left join promotion p on p.id = s.promo_id left join job j on j.id = p.job_id where s.staff_status IN ('TEMPORAL','PERMANENT') and b.active = '1'");
            if(hd.length > 0){
                for(var hx of hd){
                    if(hx.weight > 0){
                        var approved = await dbx.query("SELECT sum(approved_days) as ent FROM `leave_dump` where staff_no = "+hx.staff_no+" and type_id = 2 and status in ('GRANTED','ENDED') and year(applied_date) ='"+(new Date().getFullYear())+"'");  
                        var con_add = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='ADD' and category = '"+hx.staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+hx.staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                        var con_sub = await dbx.query("SELECT sum(weight) as weight FROM `leave_constant` where type='SUB' and category = '"+hx.staff_group+"' and active = '1' and year = '"+new Date().getFullYear()+"' and (find_in_set('"+hx.staff_no+"',exclusion) <= 0 or exclusion IS NULL)");  
                        var weight;    
                        switch(hx.staff_group){
                            case 'SS':
                                    var k = weight = await dbx.query("SELECT * FROM leave_weight where `group` = '"+hx.staff_group+"' and type_id = 2");  
                                    break;

                            case 'JS':
                                    let check = await dbx.query("SELECT * from `leave_weight` WHERE `group` = '"+hx.staff_group+"'  and type_id = 2 and find_in_set('"+hx.job_id+"',jobs) > 0");  
                                    if(check.length <= 0){ 
                                        weight = await dbx.query("select * from `leave_weight` where `group` = '"+hx.staff_group+"' and type_id = 2 and jobs IS NULL");
                                    }else{  
                                        weight = check;
                                    }   break;

                            case 'SM':
                                    weight = (hx.staff_type == 'NON-ACADEMIC') ? await dbx.query("SELECT * FROM leave_weight where `group` = '"+hx.staff_group+"' and type_id = 2") : [{weight:null}];  
                                    break;
                                    
                            default : 
                                    weight = [{weight:null}];
                                    break;
                        }
                        var sub = (con_sub.length > 0 ? con_sub[0].weight : 0), add = (con_add.length > 0 ? con_add[0].weight : 0);
                        var used = (approved.length > 0 ? approved[0].ent : 0), days = (weight[0].weight-sub+add-used);
                        
                        if(days <= 0){
                            var dayx = hx.weight+days;
                            if(dayx <= 0){
                               var ins = await dbx.query("update leave_balance set weight = "+dayx+",active = '0', history = concat('S_"+days+",',history) where staff_no = "+hx.staff_no);
                            }else{
                               var ins = await dbx.query("update leave_balance set weight = "+dayx+", history = concat('S_"+days+",',history) where staff_no = "+hx.staff_no);
                            }
                            console.log(ins);
                        }
                    }
                }
                
            }
    }
    */
   console.log("Test crons")
},10000);
  
   

   return app;
})();