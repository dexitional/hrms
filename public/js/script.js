/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
  initialDate = new Date(),

  $document = $(document),
  $window = $(window),
  $html = $("html"),

  isDesktop = $html.hasClass("desktop"),
  isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch = "ontouchstart" in window,

  plugins = {
    pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
    bootstrapTooltip: $("[data-toggle='tooltip']"),
    bootstrapTabs: $(".tabs"),
    responsiveTabs: $(".responsive-tabs"),
    stepper: $("input[type='number']"),
    selectFilter: $("select"),
    radio: $("input[type='radio']"),
    checkbox: $("input[type='checkbox']")
  };

/**
 * Initialize All Scripts
 */
$document.ready(function () {
  var isNoviBuilder = window.xMode;

  /**
   * isScrolledIntoView
   * @description  check the element whas been scrolled into the view
   */
  function isScrolledIntoView(elem) {
    var $window = $(window);
    return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
  }

  

  /**
   * Radio
   * @description Add custom styling options for input[type="radio"]
   */
  if (plugins.radio.length) {
    var i;
    for (i = 0; i < plugins.radio.length; i++) {
      $(plugins.radio[i]).addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
    }
  }

  /**
   * Checkbox
   * @description Add custom styling options for input[type="checkbox"]
   */
  if (plugins.checkbox.length) {
    var i;
    for (i = 0; i < plugins.checkbox.length; i++) {
      $(plugins.checkbox[i]).addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
    }
  }


  /**
   * IE Polyfills
   * @description  Adds some loosing functionality to IE browsers
   */
  if (isIE) {
    if (isIE < 10) {
      $html.addClass("lt-ie-10");
    }

    if (isIE < 11) {
      if (plugins.pointerEvents) {
        $.getScript(plugins.pointerEvents)
          .done(function () {
            $html.addClass("ie-10");
            PointerEventsPolyfill.initialize({});
          });
      }
    }

    if (isIE === 11) {
      $("html").addClass("ie-11");
    }

    if (isIE === 12) {
      $("html").addClass("ie-edge");
    }
  }


  /**
   * Bootstrap tabs
   * @description Activate Bootstrap Tabs
   */
  if (plugins.bootstrapTabs.length) {
    var i;
    for (i = 0; i < plugins.bootstrapTabs.length; i++) {
      var bootstrapTab = $(plugins.bootstrapTabs[i]);

      bootstrapTab.on("click", "a", function (event) {
        event.preventDefault();
        $(this).tab('show');
      });
    }
  }

  /**
   * Bootstrap Tooltips
   * @description Activate Bootstrap Tooltips
   */
  if (plugins.bootstrapTooltip.length) {
    plugins.bootstrapTooltip.tooltip();
  }



  /**
   * Responsive Tabs
   * @description Enables Responsive Tabs plugin
   */
  if (plugins.responsiveTabs.length) {
    var i = 0;
    for (i = 0; i < plugins.responsiveTabs.length; i++) {
      var $this = $(plugins.responsiveTabs[i]);
      $this.easyResponsiveTabs({
        type: $this.attr("data-type"),
        tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
      });
    }
    if ($(".tabs-nav").length) {
      $('.resp-tabs-list').find("li").eq(parseInt(window.location.hash.split('#').pop())).trigger('click');
      window.location.hash = "";
      $('.tabs-nav a').click(function (e) {
        e.preventDefault();
        $('.resp-tabs-list').find("li").eq($(this).parent().index()).trigger('click');
      });
    }
  }


  /**
   * Stepper
   * @description Enables Stepper Plugin
   */
  if (plugins.stepper.length) {
    plugins.stepper.stepper({
      labels: {
        up: "",
        down: ""
      }
    });
  }

  /**
   * Select2
   * @description Enables select2 plugin
   */
  if (plugins.selectFilter.length) {
    var i;
    for (i = 0; i < plugins.selectFilter.length; i++) {
      var select = $(plugins.selectFilter[i]);

      select.select2({
        theme: "bootstrap"
      }).next().addClass(select.attr("class").match(/(input-sm)|(input-lg)|($)/i).toString().replace(new RegExp(",", 'g'), " "));
    }
  }

  
  /**
   * UI To Top
   * @description Enables ToTop Button
   */
  if (isDesktop) {
    $().UItoTop({
      easingType: 'easeOutQuart',
      containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
    });
  }




// #############################################################################################


  // Google Authentication for UCC Staff Mail
    
      /* Google Login */
     $('.glogin').click(function(){
          var url;
          var openwindow;
          $.get("/hrm/slogin",function(res){             
              url = res;              
              openwindow = window.open(url,"Please Sign in with Google","width=400,height=400");      
              window.onmessage = function(e){
                   openwindow.close();
                   var edata = e.data;
                   var idx = edata.lastIndexOf("code=");
                   var code = edata.substring(idx+5).replace("#","");
                   // Show Loader and Hide Logo
                     $('.mloader').show();
                     $('.mlogo').hide();
                   // Redirect to token Authentication
                      window.location = "/hrm/stoken?code="+code;
              }
          })
     });


     // Login Error Message  
      window.setTimeout(function(){         
        $(".alert").slideDown('fast');
        if($('.alert').hasClass('alert-danger')){
            $('.alert').slideUp('fast');
        }         
      },5000)
    

    

    // Default
    $('.mlogin').hide();
    $('.mloader').hide();

    /* Show Login Box */
    $('.plogin').click(function(){
          // show login box
          $('.mlogin').slideDown('slow');
          // Hide Other content
          $('.alogin').hide();
          $(this).hide();
          $('.glogin').hide();
    });

    /* Back to Login */
    $('.lback').click(function(){
          // hide login box
          $('.mlogin').hide();
         // Show Other content
          $('.alogin').fadeIn();
          $('.plogin').show();
          $('.glogin').show();

   });



     /* DATATABLE SCRIPTS @@ KOBBY */
     
      $('#dynamic,#dynamic2,.dynamic').DataTable({
            dom: 'Bfrtip',
            responsive: true,
            buttons: [
                'copy','excel', 'print'
            ]      
      });



     // ACTIVE STAFF    
      $('.server').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "staff_no"},	
              {"data": "name"},
              {"data": "gender"},	
              {"data": "phone"},	
              {"data": "job_title"},
              {"data": "long_name"},
              {"data": "ucc_mail"},                  
              {"data": "action"}
          ],               
          "ajax": {
              url: '/hrm/staff/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });


      // INACTIVE STAFF    
      $('.inserver').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "staff_no"},	
              {"data": "name"},
              {"data": "gender"},	
              {"data": "phone"},	
              {"data": "job_title"},
              {"data": "long_name"},
              {"data": "staff_status"},   
              {"data": "exit_remark"},                  
              {"data": "action"}
          ],               
          "ajax": {
              url: '/hrm/staff/inactive/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });

       // CONTRACT STAFF    
       $('.conserver').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "appt_no"},	
              {"data": "name"},
              {"data": "gender"},	
              {"data": "phone"},	
              {"data": "job_title"},
              {"data": "long_name"},
              {"data": "email"}, 
              {"data": "sso_mail"},                  
              {"data": "action"}
          ],               
          "ajax": {
              url: '/hrm/parttimers/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });


      // DATES OF BIRTH
      $('.dob').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "staff_no"},	 
              {"data": "photo"},
              {"data": "name"},	
              {"data": "status"},
              {"data": "age"},
              {"data": "ssnitdob"},
              {"data": "dob"},
              {"data": "action"}
          ],               
          "ajax": {
              url: '/hrm/dobs/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });



      
       // CONFIRMATIONS - CURRENT
       $('.confirm_tbl').DataTable({ 
          dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel', 'print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "staff_no"},	
                {"data": "owner"},
                {"data": "jobtitle"},
                {"data": "appoint_date"},	
                {"data": "probation"},	
                {"data": "staff_group"},	
                {"data": "status"},
            ],               
            "ajax": {
                url: '/hrm/confirm/gson',	
                dataType: "JSON",
                type: 'POST'	
            }     
        });




      
       // POSTRETIRE - CURRENT
       $('.postretire_tbl').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "staff_no"},	
              {"data": "owner"},
              {"data": "start_post"},
              {"data": "served"},	
              {"data": "jobtitle"},	
              {"data": "status"},	
            
          ],               
          "ajax": {
              url: '/hrm/postretire/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });



         
      // RENEWAL - CURRENT
      $('.renewal_tbl').DataTable({ 
            dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel', 'print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "staff_no"},	
                {"data": "owner"},
                {"data": "start_date"},
                {"data": "renewal_period"},	
                {"data": "jobtitle"},	
                {"data": "status"},	
                
            ],               
            "ajax": {
                url: '/hrm/renewal/gson',	
                dataType: "JSON",
                type: 'POST'	
            }     
        });

    

      // APPOINTMENT - ALL
       $('.appoint_cur').DataTable({ 
        dom: 'Bfrtip',
              responsive: true,
              buttons: [
                  'copy','excel', 'print'
              ],            
          "serverSide": true,    
          "columns": [
              {"data": "appoint_date"},	
              {"data": "staff_no"},
              {"data": "owner"},	
              {"data": "jobtitle"},	
              {"data": "unitname"},
              {"data": "staff_group"},
              {"data": "probation"},
              {"data": "hr_approved"},
              {"data": "status"}
          ],               
          "ajax": {
              url: '/hrm/appointss/gson',	
              dataType: "JSON",
              type: 'POST'	
          }     
      });


       // APPOINTMENT & PROMOTIONS
       $('.appoint').DataTable({ 
          dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel','print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "staff_no"},
                {"data": "owner"},	
                {"data": "appoint_date"},	
                {"data": "confirm_date"},	
                {"data": "jobtitle"},	
                {"data": "grade"},
                {"data": "status"}
            ],               
            "ajax": {
                url: '/hrm/appoint/gson',	
                dataType: "JSON",
                type: 'POST'	
            }     
        });



        // LOGS - ALL
        $('.cur_log').DataTable({ 
          dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel', 'print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "staff_no"},	
                {"data": "action"},
                {"data": "datetime"},	
                {"data": "ipaddress"},	
                {"data": "status"}
            ],               
            "ajax": {
                url: '/hrm/logs/gson',	
                dataType: "JSON",
                type: 'POST'	
            }     
        });



        // JOBS - ALL
        $('.jobserver').DataTable({ 
          dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel', 'print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "id"},	
                {"data": "title"},
                {"data": "type"},	
                {"data": "rank_years"},	
                {"data": "nostaff"},
                {"data": "action"}
            ],               
            "ajax": {
                url: '/hrm/jobs/gson',	
                dataType: "JSON",
                type: 'POST'
            }     
        });



          // LEAVE DUMP - ALL
          $('.leavedserver').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "title"},	
                  {"data": "stats"},
                  {"data": "period"},	
                  {"data": "resume"},
                  {"data": "action"}
              ],               
              "ajax": {
                  url: '/hrm/leavedump/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });

          // LEAVE HR-PENDING 
          $('.leavehrpend').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "title"},	
                  {"data": "stats"},
                  {"data": "period"},	
                  {"data": "resume"},
                  {"data": "action"}
              ],               
              "ajax": {
                  url: '/hrm/leavehrpend/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });


           // LEAVE HEAD-PENDING 
           $('.leaveheadpend').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "title"},	
                  {"data": "stats"},
                  {"data": "period"},	
                  {"data": "resume"},
                  {"data": "action"}
              ],               
              "ajax": {
                  url: '/hrm/leaveheadpend/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });


           // TRANSFERS  - LIST
           $('.transferlist').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "transdate"},	
                  {"data": "fromunit"},
                  {"data": "tounit"},	
                  {"data": "jobtitle"},
                  {"data": "action"}
              ],               
              "ajax": {
                  url: '/hrm/transfer/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });


            // TRANSFERS  - REQUESTS
            $('.transfereq').DataTable({ 
                dom: 'Bfrtip',
                      responsive: true,
                      buttons: [
                          'copy','excel', 'print'
                      ],            
                  "serverSide": true,    
                  "columns": [
                      {"data": "staff_no"},	
                      {"data": "name"},
                      {"data": "reason"},	
                      {"data": "profile"},	
                      {"data": "tounit"},	
                      {"data": "status"},
                      {"data": "action"}
                  ],               
                  "ajax": {
                      url: '/hrm/transfer/request/gson',	
                      dataType: "JSON",
                      type: 'POST'
                  }     
              });


          // TRANSFERS  - LIST
          $('.userheads').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "role"},	
                  {"data": "mobile"},
                  {"data": "action"},	
                 
              ],               
              "ajax": {
                  url: '/hrm/users/heads/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });


          // HR REPORTS --  EXCEL/PDF CHOOSER 
          $(document).on('click','#excel',function(){
                $('#output').val('excel');
          });
          $(document).on('click','#pdf',function(){
            $('#output').val('pdf');
          });
         


           // POSITIONS  - LIST
           $('.position_current').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "start_date"},	
                  {"data": "end_date"},
                  {"data": "unit"},	
                  {"data": "post"},	
                  {"data": "status"}	
              ],  

              "ajax": {
                  url: '/hrm/position/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });


          // POSITIONS HISTORY  - LIST
          $('.position_history').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "staff_no"},	
                  {"data": "name"},
                  {"data": "start_date"},	
                  {"data": "end_date"},
                  {"data": "unit"},	
                  {"data": "post"},	
                  {"data": "status"}	
              ],  

              "ajax": {
                  url: '/hrm/position/inactive/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
          });



          /* NSS PERSONNEL */

           // ACTIVE NSS  - LIST
           $('.nss_active').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "nss_no"},	
                  {"data": "name"},
                  {"data": "gender"},	
                  {"data": "phone"},
                  {"data": "email"},	
                  {"data": "unit"},	
                  {"data": "inyear"},	
                  {"data": "outyear"},	
                  {"data": "status"}	
              ],  

              "ajax": {
                  url: '/hrm/nss/active/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
           });



           // INACTIVE NSS  - LIST
           $('.nss_inactive').DataTable({ 
            dom: 'Bfrtip',
                  responsive: true,
                  buttons: [
                      'copy','excel', 'print'
                  ],            
              "serverSide": true,    
              "columns": [
                  {"data": "nss_no"},	
                  {"data": "name"},
                  {"data": "gender"},	
                  {"data": "phone"},
                  {"data": "email"},	
                  {"data": "unit"},	
                  {"data": "inyear"},	
                  {"data": "outyear"},	
                  {"data": "status"}	
              ],  

              "ajax": {
                  url: '/hrm/nss/active/gson',	
                  dataType: "JSON",
                  type: 'POST'
              }     
           });



           // DISCIPLINARY  - LIST
           $('.discipline').DataTable({ 
                dom: 'Bfrtip',
                    responsive: true,
                    buttons: [
                        'copy','excel', 'print'
                    ],            
                "serverSide": true,    
                "columns": [
                    {"data": "staff_no"},	
                    {"data": "name"},
                    {"data": "unitname"},	
                    {"data": "jobtitle"},
                    {"data": "action_type"},	
                    {"data": "issue_date"},	
                    {"data": "reason"},	
                    {"data": "status"},	
                ],  

                "ajax": {
                    url: '/hrm/discipline/gson',	
                    dataType: "JSON",
                    type: 'POST'
                }     
           });



            // PAPERS  - LIST
            $('.paper').DataTable({ 
                dom: 'Bfrtip',
                    responsive: true,
                    buttons: [
                        'copy','excel', 'print'
                    ],            
                "serverSide": true,    
                "columns": [
                    {"data": "title"},	
                    {"data": "staff_no"},
                    {"data": "type"},	
                    {"data": "valid"},
                    {"data": "used"},	
                    {"data": "link"},	
                    {"data": "status"},	
                ],  
                "ajax": {
                    url: '/hrm/paper/gson',	
                    dataType: "JSON",
                    type: 'POST'
                }     
           });



            // PROMOTION REQUEST  - LIST
            $('.promoreq_current').DataTable({ 
                dom: 'Bfrtip',
                    responsive: true,
                    buttons: [
                        'copy','excel', 'print'
                    ],            
                "serverSide": true,    
                "columns": [
                    {"data": "staff_no"},	
                    {"data": "owner"},
                    {"data": "jobtitle"},	
                    {"data": "unitname"},
                    {"data": "status"},	
                    {"data": "date"},	
                    {"data": "action"},	
                ],  
                "ajax": {
                    url: '/hrm/promoreq/current/gson',	
                    dataType: "JSON",
                    type: 'POST'
                }     
           });



           // CIRCULARS  
           $('.circulars').DataTable({ 
            dom: 'Bfrtip',
                responsive: true,
                buttons: [
                    'copy','excel', 'print'
                ],            
            "serverSide": true,    
            "columns": [
                {"data": "date"},	
                {"data": "subject"},
                {"data": "message"},	
                {"data": "sms_note"},
                {"data": "target"},	
                {"data": "action"},	
            ],  
            "ajax": {
                url: '/hrm/circular/gson',	
                dataType: "JSON",
                type: 'POST'
            }     
       });




});



jQuery(function(){

      
      // ON-LOAD  -- Check default leave type
     
      if($('#type').length){
            var type = $('#type').val(); 
            if(type == 1 || type == 2 || type == 6){
                // CASUAL, ANNUAL, SPECIAL
                $('.group2').css("display","none");
                $('.group1').css("display","block");
                $('.group2n').prop("disabled",true);
                $('.group1n').removeProp("disabled");
              
            }else if(type == 3){
              // MATERNITY
                $('.group1').css("display","none");
                $('.group2').css("display","block");
                $('.group1n').prop("disabled",true);
                $('.group2n').removeProp("disabled");
                              
            }else if(type == 4 || type == 5 || type == 7 || type == 8){
              // SICK, EXAMS, STUDY, ABSENCE
                $('.group1').css("display","none");
                $('.group2').css("display","block");
                $('.group1n').prop("disabled",true);
                $('.group2n').removeProp("disabled");
            }else{
                $('.group1').css("display","none");
                $('.group2').css("display","none");
            }   
      }




     // RELIEVER CHECK -- FORM
     $('#relieved_by').live('blur',function(){
          var relieve = $(this).val();
          if(relieve != ''){    
            if(parseInt(relieve) != 0){                       
                $.ajax({
                    url :'/hrm/canrelieve/'+relieve,
                    dataType: "JSON",
                    type: 'GET',                      
                    success : function(msg){  
                        if(!msg.canrelieve){
                            alert("STAFF : "+relieve+" ALREADY ON LEAVE OR OCCUPIED!");
                            $('#relieved_by').val('');
                        }
                    }
                }); 
            } 
          }else{
              alert('PLEASE ENTER STAFF FOR RELIEF!'); 
              $('#relieved_by').focus();
          }
     });




    // RENEWAL FORM - PROMOTION DATA POPULATION -- LIMIT
    $('#renewal_staff_no').on('blur',function(){
        var staff_no = $(this).val();
        if(staff_no != ''){ 
            $.ajax({
                url :'/hrm/renewalpromo/'+staff_no,
                dataType: "JSON",
                type: 'GET',                      
                success : function(msg){
                    if(msg.success){  
                         var output = msg.data.map((row,i) => {
                             return `<option value="${row.id}">${row.staff_group} - RECORD #${i+1}</option>`;
                         }); $('#renewal_promo_id').append(output.join());
                    }
                }
            });  
        }
   });


    // ENTITLEMENT -- LIMIT
    $('#approved_days').on('blur',function(){
         var due = $('#entitlement').val();
         var amount = $('#approved_days').val();
         if(Number(amount) > Number(due)){
            alert("LEAVE ENTITLEMENT EXCEEDED!");
            $('#approved_days').val(0);
         }    
    });



     // ENTITLEMENT -- LIMIT
     $('#save').on('click',function(){
            var sno = $('#staff_no').val();
            var amount = $('#approved_days').val();
            var startd = $('#start_date').val();
            var enote = $('#emergency_note').val();
            var ephone = $('#emergency_contact').val();
            var relieve = $('#relieved_by').val();
            if(sno == ''){
              alert("STAFF NUMBER FIELD EMPTY!");
              $('#staff_no').focus();
              return false;
            }else if(amount == ''){
              alert("LEAVE AMOUNT FIELD EMPTY!");
              $('#approved_days').focus();
              return false;
            }else if(startd == ''){
              alert("EXPECTED START DATE FIELD EMPTY!");
              $('#start_date').focus();
              return false;
            }else if(enote == ''){
              alert("EMERGENCY DETAILS & ADDRESS FIELD EMPTY!");
              $('#emergency_note').focus();
              return false;
            }else if(ephone == ''){
              alert("EMERGENCY CONTACT FIELD EMPTY!");
              $('#emergency_contact').focus();
              return false;
            }else if(relieve == ''){
              alert("RELIEVED BY FIELD EMPTY!");
              $('#relieved_by').focus();
              return false;
            }    
            
            var c = confirm('Submit Leave Application?');
            if(!c){
               return false;
            }
           
     });

      // LEAVE TYPE -- ONCHANGE
      $('#staff_no').on('change',function(){
         var type = $('#type').val();
         var staff_no = $('#staff_no').val();
         if(type != '' && staff_no != ''){  
              $.ajax({
                    url :'/hrm/getleave/'+staff_no+'/'+type,
                    dataType: "JSON",
                    type: 'GET',                      
                    success : function(msg){ 
                          $('.entitlement').val(msg.Due);
                          $('#staff_group').val(msg.staff.staff_group);
                          if(msg.canapply){  // STAFF IS ALREADY ON-LEAVE OR SERVING LEAVE - RELIEF DUITIES

                                if(msg.staff == null){
                                    alert("Staff NO : "+staff_no+" IS NON-EXISTENT!");
                                    $('.save').attr("disabled","disabled");

                                }else if(msg.staff != null && (type == 3 && msg.staff.gender == 'M')){
                                    alert("SORRY, CATEGORY APPLIES TO FEMALES ONLY!");
                                    $('.save').attr("disabled","disabled");
                                
                                }else{
                                    $('.save').removeAttr("disabled");
                                    if(msg.Due == 0){
                                      alert("STAFF NO : "+staff_no+" NOT QUALIFIED!");
                                      $('.save').attr("disabled","disabled");
                                    }else if(type == 3){
                                      $('.approved_days').val(msg.Due);
                                    }else{
                                      $('.approved_days').val('');
                                      $('.approved_days').focus();
                                    }
                                }

                          }else{
                            alert('PLEASE YOU ARE NOT ALLOWED TO APPLY FOR ANOTHER LEAVE WHILES SERVING A LEAVE !\n\nOR\n\nNOT ALLOWED TO GO ON-LEAVE WHILES STANDING IN FOR A STAFF ON LEAVE!\n\nOR\n\nYOUR ANNUAL LEAVE MAY HAVE BEEN DEFERRED FOR THE YEAR!');
                            $('.entitlement').val('');
                            $('.approved_days').val('');
                            $('.save').attr("disabled","disabled");
                          }
                    }
              });  
          }else if(type == ''){
             $('#type').focus();
          }   

      });

     // LEAVE TYPE -- ONCHANGE
     $('#type').on('change',function(){
            var type = $(this).val(); 
            $('#staff_no').val('');
            $('.entitlement').val('');
            $('.approved_days').val('');
            if(type == 1 || type == 2 || type == 6){
                // CASUAL, ANNUAL, SPECIAL
                $('.group2').css("display","none");
                $('.group1').css("display","block");
                $('.group2n').prop("disabled",true);
                $('.group1n').removeProp("disabled");
              
            }else if(type == 3){
                // MATERNITY
                $('.group1').css("display","none");
                $('.group2').css("display","block");
                $('.group1n').prop("disabled",true);
                $('.group2n').removeProp("disabled");
                alert("Maternity Leave has 3 Months (90 Days) entitlement and should be accompanied by a certificate duly signed by a Medical Doctor!");
                                
            }else if(type == 4 || type == 5 || type == 7 || type == 8){
                // SICK, EXAMS, STUDY, ABSENCE
                $('.group1').css("display","none");
                $('.group2').css("display","block");
                $('.group1n').prop("disabled","disabled");
                $('.group2n').removeProp("disabled");
                alert("LEAVE SHOULD BE ACCOMPANIED BY A SIGNED CERTIFICATE OR PROOF OF CLAIM!");
            }else{
                $('.group1').css("display","none");
                $('.group2').css("display","none");
            }      
   
     });


     // ## UNIT REGISTRATION FORM
     $('#utype').on('change',function(){
           
            var type = $(this).val(); 
            if(type == 'NON-ACADEMIC'){
              // NON-ACADEMIC FIELDS
                $('.ac').css("display","none");
                $('#college_id').attr("disabled","disabled");
                $('#faculty_id').attr("disabled","disabled");
                $('#dept_id').attr("disabled","disabled");
                
            }else{
                // ACADEMIC FIELDS
                $('.ac').css("display","block");
                $('#college_id').removeAttr("disabled");
                $('#faculty_id').removeAttr("disabled");
                $('#dept_id').removeAttr("disabled");
            }    
     });


      // LEAVE WEIGHT/ENTITLEMENT ADD
      var type_id =  $('#type_id');
      var group = $('#group');
      if(type_id.val() == '2' && group.val() == 'JS'){ 
          $('.jobs-cover').show();
          $('.jobs').removeAttr('disabled');
          $('.jobs').show();
      }else{
          $('.jobs-cover').hide();
          $('.jobs').attr('disabled','disabled');
          $('.jobs').hide();
      }

 
      // LEAVE WEIGHT FORM
      $('#group,#type_id').on('change',function(){
          var type_id =  $('#type_id');
          var group = $(this);
          if(group != undefined && type_id != undefined){
              if(type_id.val() == '2' && group.val() == 'JS'){ 
                  $('.jobs-cover').show();
                  $('.jobs').removeProp('disabled');
                  $('.jobs').show();
              }else{
                  $('.jobs-cover').hide();
                  $('.jobs').prop('disabled','disabled');
                  $('.jobs').hide();
              }
          }
      });


      // CHANGE VEHICLE  OWNER  .chngowner
      $('.chngowner').on('click',function(){
             var oldstaff = prompt('Please Enter Staff Number of Previous Owner!');
             if(oldstaff != undefined && oldstaff.length != 0){
                var newstaff = prompt('Please Enter Staff Number of New Owner!');
                if(newstaff != undefined && newstaff.length != 0){
                    window.location.href = '/hrm/vehicle/changeowner/'+oldstaff+'?new='+newstaff;
                    alert('Owner Changed!');
                }               
             }
             return false;
      });


      // PHOTO MODULE - GET STAFF PHOTO
      $('#getphoto').on('click',function(){
          var stno = prompt("Enter Staff Number ...!");
          if(stno != undefined){
            $.ajax({
                url : '/hrm/staff/getdata/'+stno,
                type : 'GET',
                dataType : 'JSON',
                success : function(msg){
                    var ss = `if(!confirm('Please take snapshot of student!')){return false;}else{ window.open('/hrm/staff/cam/${msg.staff_no}','Photo Album','height=350,width=350'); }`;
                    var up = `<form style="display:inline;margin:0" data-form="${msg.staff_no}" action="/hrm/staff/camsave?id=${msg.staff_no}" method="post" enctype="multipart/form-data" id="photoform"><input type="file"  name="photo" id="photo" style="display:none;" onchange="form.submit();"/><input type="hidden" name="id" value="${msg.staff_no}"/></form>`;
                    $('#st_no').html(msg.fname != null ? msg.staff_no : '');
                    $('#st_name').html(msg.fname != null ? msg.fname+' '+msg.mname+' '+msg.lname : '');
                    $('#st_photo').attr('src',(msg.photo != null ? msg.photo : '/public/images/none.png'));
                    $('#st_photo').css('width',(msg.photo != null ? '280px' : '280px'));
                    $('#st_remphoto').attr('href','/hrm/staff/rempic/'+(msg.photo != null ? msg.staff_no :''));
                    $('#st_tkshot').attr('onclick',ss);
                    $('#st_uploadpic').after(up);
                    
                }
            });
          }
            
      });



       // PROMOTION REQUEST FORM -- ONCHANGE #STAFF
       $('#staff_no_promoreq').on('blur',function(){
            var staff_no = $('#staff_no_promoreq').val();
            if(staff_no != ''){  
                $.ajax({
                    url :'/hrm/paper/gson/'+staff_no,
                    dataType: "JSON",
                    type: 'GET',                      
                    success : function(msg){                           
                      if(msg.success){  
                         var output = ` <div class="cell-sm-12"><h6 style="color:brown;">LIST OF PAPERS FOR STAFF : ${staff_no}</h6></div><hr>`;
                         msg.data.forEach((d,i) => {
                            output += `
                            <div class="cell-sm-12" style="border:thin solid darkred;<%- (i+1) != msg.data.length ? 'border-bottom:none;':''%>">
                                <div class="form-group">
                                <label class="form-label" for="papers">${d.title}</label>
                                <input class="pull-left" style="width:50px;height:40px;padding:0;" id="papers" name="papers" value="${d.id}" type="checkbox"/>
                                </div>
                            </div>
                         `
                         })
                         $('#promoreq_cover').html(output);
                      }
                    }
                });  
            }   
       });
      

      // APPOINTMENT,PROMOTION,UPGRADE - getStaff
      $('.get_staff').on('blur',function(){
            var staff_no = $('.get_staff').val();
            if(staff_no != ''){  
                $.ajax({
                    url :'/hrm/getstaff/'+staff_no,
                    dataType: "JSON",
                    type: 'GET',                      
                    success : function(data){                           
                var output = `
                NAME: ${data.row.name}
                DESIGNATION: ${data.row.jobtitle}
                UNIT: ${data.row.unitname}
                STAFF NO: ${data.row.staff_no}
                STAFF GROUP: ${data.row.staff_group}`;
                alert(output);
                    }
                })
            }  
      })





   
});  



    