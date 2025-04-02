var socket = io();
var chatMessage = document.querySelector('#comment');
var chatPriv = document.querySelector('#priv');
var chatPhoto = document.querySelector('#photo');
var chatLogout = document.querySelector('.logout');
var chatActive = document.querySelector('.activechat');
var receiverStore = localStorage.getItem('receiver');
var receiver = document.querySelector('#receiver');
var sender = document.querySelector('#sender');
var chatdata = localStorage.getItem("chats");
var activeuser;
var userCount = 0;
 
socket.on('connect', function() {
        var chatForm = document.forms.chatForm;
        var interval,typing = false;
        if(chatForm) {
            /* Initialise Chat */
            chatMessage.focus();
            // Get Old Chats
            if(chatdata != undefined){
               getChats(chatdata);
            }


            // Send Chat Token - Server
            socket.emit('token',{
                username : sender.value,
                isadmin : parseInt(chatPriv.value) == 0 ? false : true,
                photo : (chatPhoto.value == '' || chatPhoto.value == null ? '/public/images/none2.png':chatPhoto.value)
            }); 

            // Submit 
            chatForm.addEventListener('submit', function(e){
                e.preventDefault();
                socket.emit('postMessage',{
                    message : chatMessage.value,
                    photo : chatPhoto.value,
                    receiver : receiver.value,
                    sender : sender.value,
                    time : getTime(new Date())
                });
                // Reload Chat - Fix
                //window.location.reload();
                // Reset Message Input
                chatMessage.value = '';
                chatMessage.focus();
            });

            // Send Typing Signal
            chatMessage.addEventListener('keypress', function(e){
               socket.emit('typing',{sender:sender.value,receiver:receiver.value});
            });

            // Receive Typing Signal
            socket.on('receiveTyping', function(data){
                  document.querySelector('.useronline').innerHTML = `<em><b>${data.sender} is typing ...</b></em>`;
            }); 

            // Logout
            chatLogout.addEventListener('click', function(e){
                e.preventDefault();
                var logout = confirm('Close Chat Session?');
                if(logout){
                    socket.emit('logout',{user:sender.value});
                }
            });

            // Send Message
            socket.on('updateMessage', function(data){
                showMessage(data);
            }); 
          
            // Disconnection Message
            socket.on('logout', function(data){
               localStorage.setItem("chats","");
               window.close();
            }); 

            // Online Users
            socket.on('onlines', function(data){
                console.log(data);
                showOnline(data);
            }); 

            socket.on('disconnect', function(){
                //window.location.reload()
            }); 

            // Set Admin or Receiver
            socket.on('setadmin', function(data){
                if(data != 'hr'){
                    document.querySelector('.message-previous').style.display = 'none';
                    document.querySelector('#receiver').value = receiverStore != undefined && receiverStore != '' ? receiverStore : data;
                    localStorage.setItem('receiver',data);
                    //alert("Admin : "+data);
                }else{
                    //alert("Offline Admin : "+data);
                    document.querySelector('.message-previous').style.display = 'block';
                }
            }); 
   /* */    

        } // chatForm
});// Socket


function showMessage(data) {
    // If No Admin Users Online or Chat Users Online
    /*if(userCount == 0){
        alert('\tNO DHR REPRESENTATIVES AVAILABLE AT THE MOMENT!\n\nPLEASE CHECK AGAIN BETWEEN THE HOURS OF \n\n\t\t7:30 AM - 4:30 PM');
        return false;
    }else */
    
    if(data.message == ''){ return false; }

    var chatDisplay = document.querySelector('.message');
    var newCover = document.createElement('div');
        newCover.className = `row message-body ${data.channel}`;
        //newCover.className = "row message-body";
        if(data.sender == sender.value){
            newCover.innerHTML  = '<div class="col-sm-12 message-main-sender"><div class="sender"><div class="message-text"><div class="avatar-icon pull-left" style="width:25px;height:29px;margin-right:5px;"><img src="'+data.photo+'" style="width:22px;height:29px"></div> '+data.message+'</div><em class="message-time pull-right">~ '+data.sender+'</em>&nbsp;&nbsp;<small style="margin-top:10px;color:brown"><sub>'+data.time+'</sub></small></div></div>';
        }else{
            newCover.innerHTML  = '<div class="col-sm-12 message-main-receiver"><div class="receiver"><div class="message-text"><div class="avatar-icon pull-left" style="width:25px;height:29px;margin-right:5px;"><img src="'+data.photo+'" style="width:22px;height:29px"></div> '+data.message+'</div><em class="message-time pull-right">~ '+data.sender+'</em>&nbsp;&nbsp;<small style="margin-top:10px;color:brown"><sub>'+data.time+'</sub></small></div></div>';
        }
        chatDisplay.append(newCover);
        // AutoScroll Page
        document.querySelector('.message').scrollBy(0,1000);
        
        // Play Chat Audible...
        //new Audio("/public/media/chat.mp3").play();
        //document.getElementById('audible').play();
       
        // Save Chat Locally
        var data = localStorage.getItem('chats') || '';
            data = chatDisplay.innerHTML;
            localStorage.setItem('chats',data);
        // Set Current Receiver
        receiver.value = localStorage.getItem('receiver');
           
}


function showOnline(data) {
    var chatDisplay = document.querySelector('.inner');
        //chatDisplay.innerHTML = '';
    var newCover = document.createElement('div');
        newCover.className = "row sideBar";
    var content = "";
    var userCount = 0;
    //data.forEach(function(setx){
    // If admin - list all client users except admins
    const admin = data.find((item) => item.username == '15666');
    //var admin = data[sender.value].user != undefined && data[sender.value].isadmin ? data[sender.value].user : null;
    
        var x = 0,user;
        for(var setx in data){
          
                // If First User
                /*
                if(x == 0){
                    user = (receiverStore != undefined && receiverStore != '') ? receiverStore : data[setx].user;
                    receiver.value = user;
                    document.querySelector('.userphoto').setAttribute('src','/public/images/hrms.png');
                    document.querySelector('.usertitle').innerHTML =  user;
                    document.querySelector('.useronline').innerHTML = "Online - <em><b>Active chat</b></em>";
                }
               */ 
                /*var cont = `<div class="row sideBar-body s${data[setx].user} ${((receiverStore != undefined && receiverStore != '') && receiverStore == data[setx].user) ? 'active' : ''}" title="${data[setx].user}" onclick="activeChat('${data[setx].photo}','${data[setx].user}','${data[setx].channel}')">
                                    <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                        <div class="avatar-icon" style="width:39px;height:49px">
                                             <img src="${data[setx].photo}" style="width:39px;height:49px">
                                        </div>
                                    </div>
                                    <div class="col-sm-9 col-xs-9 sideBar-main">
                                        <div class="row">
                                            <div class="col-sm-8 col-xs-8 sideBar-name">
                                                <span class="name-meta">${data[setx].user}</span>
                                            </div>
                                            <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                                                <span class="time-meta pull-right"><span class=" text-bold text-success">online</span></span>
                                            </div>
                                        </div>
                                    </div>
                            </div> `;*/
                var cont = `<div class="row sideBar-body s${data[setx]} ${((receiverStore != undefined && receiverStore != '') && receiverStore == data[setx]) ? 'active' : ''}" title="${data[setx]}" onclick="activeChat('/public/staffpic/${data[setx]}.jpg','${data[setx]}','${admin}_${data[setx]}')">
                            <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                <div class="avatar-icon" style="width:39px;height:49px">
                                     <img src="/public/staffpic/${data[setx]}.jpg" style="width:39px;height:49px">
                                </div>
                            </div>
                            <div class="col-sm-9 col-xs-9 sideBar-main">
                                <div class="row">
                                    <div class="col-sm-8 col-xs-8 sideBar-name">
                                        <span class="name-meta">${data[setx]}</span>
                                    </div>
                                    <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                                        <span class="time-meta pull-right"><span class=" text-bold text-success">online</span></span>
                                    </div>
                                </div>
                            </div>
                    </div> `;
                content += cont;
                x++;
                userCount++;
            
        }
   

    var nohradmin =    `<div class="row sideBar-body">
                            <div class="col-sm-3 col-xs-3 sideBar-avatar">
                                <div class="avatar-icon" style="width:39px;height:49px">
                                <img src="/public/images/hrms.png" style="width:39px;height:49px">
                                </div>
                            </div>
                            <div class="col-sm-9 col-xs-9 sideBar-main">
                                <div class="row">
                                    <div class="col-sm-8 col-xs-8 sideBar-name">
                                        <span class="name-meta">HR Representative</span>
                                    </div>
                                    <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                                        <span class="time-meta pull-right"><span class=" text-bold text-danger">offline</span></span>
                                    </div>
                                </div>
                            </div>
                        </div> `;

    content != "" ? content : nohradmin;
    newCover.innerHTML = content;
    chatDisplay.append(newCover);
    if(receiverStore != undefined && receiverStore != ''){
        document.querySelector('.s'+receiverStore).className = "row sideBar-body s"+receiverStore+" active";
    }else{
        document.querySelector('.s'+data[0]).className = "row sideBar-body ok s"+data[0]+" active";
    }
}



function Chats (data){
    if(data.message == '') return false;
    var chatDisplay = document.querySelector('.message');
    var innerCover = document.createElement('div');
    var innerData = "";
    data.forEach(function(val){
        var newCover = document.createElement('div');
        newCover.className = `row message-body ${val.channel}`;
        //newCover.className = "row message-body";
        if(val.username == sender.value){
            newCover.innerHTML  = '<div class="col-sm-12 message-main-sender"><div class="sender"><div class="message-text"><div class="avatar-icon pull-left" style="width:25px;height:29px;margin-right:5px;"><img src="'+val.photo+'" style="width:22px;height:29px"></div> '+val.sender+'</div><em class="message-time pull-right">~ '+val.sender+'</em></div></div>';
        }else{
            newCover.innerHTML  = '<div class="col-sm-12 message-main-receiver"><div class="receiver"><div class="message-text"><div class="avatar-icon pull-left" style="width:25px;height:29px;margin-right:5px;"><img src="'+val.photo+'" style="width:22px;height:29px"></div> '+val.sender+'</div><em class="message-time pull-right">~ '+val.sender+'</em></div></div>';
        }
        innerData += newCover;
    });
        innerCover.innerHTML = innerData;
        chatDisplay.append(innerCover);
        // AutoScroll Page
        document.querySelector('.message').scrollBy(0,1000);
        
}


function getChats (data){
    if(data == '' || data == null) return false;
    var chatDisplay = document.querySelector('.message');
    chatDisplay.innerHTML = data;
    // AutoScroll Page
    document.querySelector('.message').scrollBy(0,1000);
}


function activeChat(pic,nom,tunnel){
    var photo = document.querySelector('.userphoto');
    var name = document.querySelector('.usertitle');
    var status = document.querySelector('.useronline');
    $('.message-body').hide();
    // Set PhotoOka
       photo.setAttribute('src',pic);
    // Set Title
       name.innerHTML = nom;
    // Set Receiver ID
       localStorage.setItem('receiver',nom); 
       receiver.value = nom; 
    // Set Status
       status.innerHTML = "Online - <em><b>Active chat</b></em>";
    // Set Active Class
       $('.sideBar-body').removeClass('active');
       $('.s'+nom).addClass('active');
    // Set Active Channel
       localStorage.setItem('channel',tunnel);
       activeuser = {pic,nom,tunnel};
    // Hide all messages outside Active Chat!
       $('.'+nom+'_'+sender.value).show();
       $('.'+sender.value+'_'+nom).show(); 
    // Show Conversation Board
       $(".side").addClass('hidden-xs').removeClass('visible-xs');
       $(".conversation").addClass('visible-xs').removeClass('hidden-xs');
   // Reload All Script
      //window.location.reload();
     
       
}

function getTime(date){
    return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
}

function stopTyping(isTyping){
    if(!isTyping){
       
    }
}

// Search Users
function searchOnline(){
    // Declare variables
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('searchText');
        filter = input.value.toUpperCase();
        ul = document.getElementsByClassName("sideBar")[0];
        li = ul.getElementsByClassName('sideBar-body')[0];

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
               a = li[i].getElementsByClassName("name-meta")[0];
               txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
               li[i].style.display = "";
            } else {
               li[i].style.display = "none";
            }
        }
}

// ENTER KEY to SEND MESSAGE
document.onkeydown = function(e){
    if(e.keyCode == '13'){
        e.preventDefault();
        document.querySelector('#send').click();
    }
}


