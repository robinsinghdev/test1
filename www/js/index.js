/*$(document).ready(function() {
    //checkTimeTracker(); 
	$("a.process-report").on("click", function(event){
		  event.stopPropagation();
		  console.log( "I was clicked, but my parent will not be." );
		});
});*/

$( document ).on( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
	 $.support.cors = true;
     $.mobile.allowCrossDomainPages = true;
     
     jQuery.mobile.phonegapNavigationEnabled = true;
     jQuery.mobile.defaultDialogTransition = "pop";
     jQuery.mobile.defaultPageTransition = "none";
      
     jQuery.mobile.loader.prototype.options.text = "loading";
     jQuery.mobile.loader.prototype.options.textVisible = true;
     jQuery.mobile.loader.prototype.options.theme = "a";
     
});

var appUrl='https://dev.bpmetrics.com/grn/m_app/';
var appRequiresWiFi='This app requires an active WiFi connection.';
var serverBusyMsg='Server is busy, please try again later.';
var currDataHexcolor,currDataOname,currDataOrder;
var globalLogTimeObj={};
var db;
var app = {
    SOME_CONSTANTS : false,  // some constant

    // Application Constructor
    initialize: function() {
        console.log("console log init");
        this.bindEvents();
        this.initFastClick();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    initFastClick : function() {
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    },
    // Phonegap is now ready...
    onDeviceReady: function() {
        console.log("device ready, start making you custom calls!");
        document.addEventListener("backbutton", onBackKeyDown, false);
        // Start adding your code here....
		//app.receivedEvent('deviceready');
		/*
		var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
		db.transaction(initializeDB, errorCB, successCB);
		*/
        
        checkPreAuth();
		$("#loginForm").on("submit",handleLogin);
		db = window.openDatabase("Database", "1.0", "BP_MET", 2000000);		
		openDatabase();
    },
	// Update DOM on a Received Event
    receivedEvent: function(id) {
		
    }
};

function onBackKeyDown() {
	if($.mobile.activePage.is('#login-page')){
        showExitDialog();
    }
	else if($.mobile.activePage.is('#home-page')){
        /* 
        Event preventDefault/stopPropagation not required as adding backbutton
         listener itself override the default behaviour. Refer below PhoneGap link.
       */
       //e.preventDefault();
       //navigator.app.exitApp();
       showExitDialog();
   }
	else if($.mobile.activePage.is('#view-all-sales-order')){
       $.mobile.changePage('#home-page','slide');
   }
	else{
		window.history.back();
   }
}

function showExitDialog() {
    navigator.notification.confirm(
            ("Do you want to Exit?"), // message
            alertexit, // callback
            'BP METRICS', // title
            'YES,NO' // buttonName
    );
}

//Call exit function
function alertexit(button){
    if(button=="1" || button==1){
        //device.exitApp();
        navigator.app.exitApp();
    }
}

function doLogout() {
	showLogoutDialog();
}

function showLogoutDialog() {
    navigator.notification.confirm(
            ("Are you sure to Logout?"), // message
            alertlogout, // callback
            'BP METRICS', // title
            'YES,NO' // buttonName
    );
}

//Call logout function
function alertlogout(button){
    if(button=="1" || button==1){
    	logout();
    }
}

function checkConnection() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
    return states[networkState];
}

/*
function init() {
	document.addEventListener("deviceready", deviceReady, true);
	delete init;
}
*/
    
function checkPreAuth() {
	var form = $("#loginForm");
	if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined && window.localStorage.getItem("user_logged_in")==1) {
		$("#username", form).val(window.localStorage["username"]);
		$("#password", form).val(window.localStorage["password"]);
		handleLogin();
	}
}

function logout() {
	window.localStorage["password"] = '';
	window.localStorage["user_logged_in"] = 0;
	
	window.localStorage["grnUser"] = '';
	window.localStorage["ID"] = '';
	window.localStorage["grn_companies_id"] = '';
	window.localStorage["nickname"] = '';
	window.localStorage["grn_roles_id"] = '';
	window.localStorage["permissions"] = '';
	
	window.localStorage["email"] = '';
	window.localStorage["lastActive"] = '';
	
	var form = $("#loginForm");
	$("#username", form).val(window.localStorage["username"]);
	$.mobile.changePage('#login-page','slide');
}

function handleLogin() {
	//checkConnection();
	console.log('handle login called');
	var form = $("#loginForm");
	//disable the button so we can't resubmit while we wait
	$("#submitButton",form).attr("disabled","disabled");
	var u = $("#username", form).val();
	var p = $("#password", form).val();
	u='support@dynaread.com';
	p='marbleF16XS';
	
	if(u != '' && p!= '') {
		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'userLogin',email:u,password:p,check:'1'},
			   success:function(data,t,f){
				var responseJson=jQuery.parseJSON(data);
				if(responseJson.status == "success" ){
					//$.mobile.changePage('#home-page','slide');					
					$.mobile.changePage('#home-page',{ transition: "slideup"});
					
					var grnUser=responseJson.grn_user;
					window.localStorage["username"] = u;
					window.localStorage["password"] = p;
					window.localStorage["user_logged_in"] = 1;
					window.localStorage["grnUser"] = JSON.stringify(grnUser);
					window.localStorage["ID"] = grnUser["ID"];
					window.localStorage["grn_companies_id"] = grnUser["grn_companies_id"];
					window.localStorage["full_name"] = grnUser["full_name"];
					window.localStorage["nickname"] = grnUser["nickname"];
					window.localStorage["grn_roles_id"] = grnUser["grn_roles_id"];
					window.localStorage["permissions"] = grnUser["permissions"];
					window.localStorage["email"] = grnUser["email"];
					window.localStorage["lastActive"] = grnUser["lastActive"];
				}else{
					window.localStorage["password"] = '';
					window.localStorage["user_logged_in"] = 0;
					
					window.localStorage["grnUser"] = '';
					window.localStorage["ID"] = '';
					window.localStorage["grn_companies_id"] = '';
					window.localStorage["nickname"] = '';
					window.localStorage["grn_roles_id"] = '';
					window.localStorage["permissions"] = '';
					
					window.localStorage["email"] = '';
					window.localStorage["lastActive"] = '';
					
					var form = $("#loginForm");
					$("#username", form).val(window.localStorage["username"]);
					$.mobile.changePage('#login-page','slide');
					
					navigator.notification.alert("Invalid Credentials, please try again", function() {});
				}
				hideModal();
				$('#userFullName').html(window.localStorage.getItem("full_name"));
			   },
			   error:function(data,t,f){
				   hideModal();
				   navigator.notification.alert(appRequiresWiFi, function() {});
				 var responseJson = $.parseJSON(data);
				 alert(w+' '+t+' '+f);
				 //console.log(data+' '+t+' '+f);
				 if(responseJson.status==404){
					 navigator.notification.alert(appRequiresWiFi, function() {});
				 }
			   }
			});
		}
		else{
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		$("#submitButton").removeAttr("disabled");
	}
	else{
		navigator.notification.alert("You must enter a username and password", function() {});
		$("#submitButton").removeAttr("disabled");
	}
	return false;
}

function getSOBySONumber(){
	//var grnUserObj=window.localStorage.getItem("grnUser");
	
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};// Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData)
	
	if(grnUserObj != '') {
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			var sp_salesOrderNumber=$('#sp_salesOrderNumber').val();
			showModal();
			if(typeof sp_salesOrderNumber === "undefined" || sp_salesOrderNumber==""){
				navigator.notification.alert("Please input Sales Order Number.", function() {});
			}
			else{
				$.ajax({
					type : 'POST',
				   url:appUrl,
				   data:{action:'checkSOonSP',grn_user:grnUserObj,sp_salesorderNumber :sp_salesOrderNumber},
				   success:function(data){
				   		hideModal();
				   		var responseJson = $.parseJSON(data);
				   		//{"status":"success","soInfo":{"SO#":"192","Job":"Cheryl & Marvin Fisher"}}
				   		var $sp_details_div=$('#sp_details_div');
				   		if(responseJson.status=="success"){
				   			var soInfo=responseJson.soInfo;
					   		$sp_details_div.find('#sp_jobName').val(soInfo["Job"]);
					   		$sp_details_div.find('#chooseColorForSalesOrder').val(getRandomColor());
					   		$sp_details_div.show();
					   		
					   		$('a#tryAgainBtn').removeClass('display-none');
					   		$('a#addNewSalesOrderBtn').removeClass('display-none');
					   		$('a#getSOBySONumberBtn').addClass('display-none');
					   		$('a#showOrderBtn').parent().hide();
					   		$(".sales-order-msg").html('');
				   		}
				   		else if(responseJson.status=="exist"){
				   			$sp_details_div.hide();
				   			$(".sales-order-msg").html("Sales order already exist.");
				   			$('a#showOrderBtn').parent().show();
				   		} 
				   		else if(responseJson.status=="fail"){
				   			$sp_details_div.hide();
				   			$(".sales-order-msg").html(responseJson.msg);
				   		} 
					},
					error:function(data,t,f){
						hideModal();
						navigator.notification.alert(appRequiresWiFi, function() {});
					}
				});
			}	
			hideModal();
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function tryAgainSOBySONumber(){
	var $sp_details_div=$('#sp_details_div');
	$sp_details_div.hide();
	$('#sp_salesOrderNumber').val('');
	$sp_details_div.find('#sp_jobName').val('');
	$sp_details_div.find('#chooseColorForSalesOrder').val('');
	
	$sp_details_div.hide();
	$('a#tryAgainBtn').addClass('display-none');
	$('a#addNewSalesOrderBtn').addClass('display-none');
	$('a#showOrderBtn').parent().hide();
	$('a#getSOBySONumberBtn').removeClass('display-none');
	$(".sales-order-msg").html('');
}

function getRandomColor(){
	var minimumColor=1;
	var maximumColor=74;
	var randomColor = Math.floor(Math.random() * (maximumColor - minimumColor + 1)) + minimumColor;
	return randomColor;
}

function createNewSO(){
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};// Testing data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData)
	
	if(grnUserObj != '') {
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			var spJobName=$('#sp_jobName').val();
			var spSalesorderNumber=$('#sp_salesOrderNumber').val();
			var grn_colors_id=$('#chooseColorForSalesOrder').val(); 
			showModal();
			var grn_colors_id=getRandomColor();
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'addSaleOrderTime',grn_user:grnUserObj,grn_colors_id :grn_colors_id,sp_jobName:spJobName,sp_salesorderNumber:spSalesorderNumber},
			   success:function(data){
			   		hideModal();
			   		var responseJson = $.parseJSON(data);
			   		tryAgainSOBySONumber();
			   		$(".sales-order-msg").html(responseJson.msg);
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert(appRequiresWiFi, function() {});
				}
			});
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

var time_cats_arr;
function getCategoriesForTimeTracking(){
	
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'getCompanyAvailableCategories',grn_user:grnUserObj},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		time_cats_arr=responseJson.time_cats;
			   		db.transaction(insertTimeCategory, errorDB, successDB);// Insert Time Category
			   		getSalesOrders();
			   		hideModal();
			   		
			   		//db.transaction(queryDataBase, errorDB, successDB);// Query Time Category
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert(appRequiresWiFi, function() {});
				}
			});
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function getSalesOrders(){

	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'getSalesOrders',grn_user:grnUserObj},
			   success:function(data){
			   		
			   		var responseJson = $.parseJSON(data);
			   		$('#salesOrderMainDiv').html('');
			   		
			   		var tbodyObj='<tbody>';
			   		jQuery.each(time_cats_arr, function(index,value) {
			        	var jsonObj=value;
			        	var id=jsonObj["id"];
			        	var timeCats=jsonObj["timeCats"];
			        	var title=jsonObj["title"];
			        	var grn_roles_id=jsonObj["grn_roles_id"];
			        	var revision=jsonObj["revision"];
			        	var status=jsonObj["status"];
			        	
			        	tbodyObj+='<tr>'+
					                 '<td class="order-p-icon">'+
					                     '<span class="process-icon cm-10">'+
					                         '<img class="icon-img" src="img/'+timeCats+'.png" id="timer_img_spOrderIdReplace_'+timeCats+'" data-order="spOrderIdReplace" data-timecat="'+timeCats+'" data-action="clock" onclick="logTimer(this);return false;">'+
					                     '</span>'+
					                 '</td>'+
					                 '<td>'+
					                     '<span id="orderId_spOrderIdReplace" class="timer">--:-- hrs</span>'+
					                 '</td>'+
					                 '<td class="order-t-icon">'+
					                     '<a class="timer timer-icon clock" id="timer_spOrderIdReplace_'+timeCats+'" data-icon="flat-time" data-order="spOrderIdReplace" data-timecat="'+timeCats+'" data-action="clock" onclick="logTimer(this);return false;">'+
										 '</a>'+
					                 '</td>'+
					             '</tr>';
			   		});
			   		tbodyObj+='</tbody>';
			   		
			   		var salse_orders_arr=responseJson.sales_orders;
			   		jQuery.each(salse_orders_arr, function(index,value) {
			        	var jsonObj=value;
			        	var id=jsonObj["id"];
			        	var grn_companies_id=jsonObj["grn_companies_id"];
			        	var sp_manager=jsonObj["sp_manager"];
			        	var sp_salesorderNumber=jsonObj["sp_salesorderNumber"];
			        	var sp_jobName=jsonObj["sp_jobName"];
			        	var grn_colors_id=jsonObj["grn_colors_id"];
			        	//var time_running_status=jsonObj["time_running_status"];
			        	//var grn_status_id=jsonObj["grn_status_id"];
			        	var HexColor=jsonObj["HexColor"];
			        	//var tbodyObjCurr = tbodyObj.replace("spOrderIdReplace", id);
			        	var tbodyObjCurr = tbodyObj.replace(/spOrderIdReplace/g,id);
			        	
			        	var divObj='<div id="sales-table-div_'+id+'" class="sales-table-div">'+
				                		'<table id="sp_order_'+id+'"  class="order-box ui-table" style="border: 1px solid #EEE8E8;" data-role="table" data-mode="" class="ui-responsive table-stroke sales-table">'+
									     '<thead onclick="showHideTable(this);">'+
									         '<tr>'+
									             '<th class="sp-order " colspan="3" id="sp_order_name_'+id+'">'+
									             		
									             	'<div id="so_details_box" class="so-details-box" style="border-color: #'+HexColor+';">'+
								                    	'<div class="so-color-box" style="background-color: #'+HexColor+';">'+
								                    		'<span style="">&nbsp;</span>'+
								                        '</div>'+
								                        '<div class="so-name-box" >'+
								                        	'<span class="" id="so_name">'+sp_jobName+' #'+sp_salesorderNumber+'</span>'+
								                        	'<a href="#" onclick="getLogTimeListOfOrder(this); return false;" class="process-report pull-right" data-order="'
								                        		+id+'" data-oname="'+sp_jobName+' #'+sp_salesorderNumber+'" data-hexcolor="#'+HexColor+'" >Report'+
											                 '</a>'+
								                        '</div>'+
								                    '</div>'+	
									             '</th>'+
									         '</tr>'+
									     '</thead>'+
									     tbodyObjCurr+
									     '</tbody>'+
									     '<tfoot>'+
									         '<tr>'+
									             '<td colspan="3" class="td-danger">'+
									             	'<a href="#" class="order-close" data-order="'+sp_salesorderNumber+'" data-id="'+id+'" onclick="closeSalesOrder(this)"><span>CLOSE</span></a>'+
									             '</td>'+ 
									         '</tr>'+
									     '</tfoot>'+
									 '</table>'+
								 '</div>';
			        	
			        	$('#salesOrderMainDiv').append(divObj);
			   		});
			   		hideAllTablesData();
			   		hideModal();
			   		if(salse_orders_arr.length <= 0){
			   			navigator.notification.alert("No sales order to show or try again after sometime.", function() {});	
			   		}
				},
				error:function(data,t,f){
					hideModal();
					navigator.notification.alert(appRequiresWiFi, function() {});	
				}
			});
		}
		$.mobile.changePage('#view-all-sales-order','slide');
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function showModal(){
  $('body').append("<div class='ui-loader-background'> </div>");
  $.mobile.loading( "show" );
}

function hideModal(){
	 $(".ui-loader-background").remove();
	 $.mobile.loading( "hide" );
}

function showHideTable(thiss){
	var currTableObj = $(thiss).parent();
	currTableObj.find('tbody').toggle();
	currTableObj.find('tfoot').toggle();
}

function  hideAllTablesData(){
	//var allTableObj = $('.sales-table');
	 $('table').find('tbody').hide();
	 $('table').find('tfoot').hide();
}

function changeLoginRole(roleId){
	navigator.notification.alert("For now default role is 7.", function() {});
}

function getLogTimeListOfOrder(data){
	showModal();
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		var $thisData=$(data);
		currDataHexcolor=$thisData.attr("data-hexcolor");
		currDataOname=$thisData.attr("data-oname");
		currDataOrder=$thisData.attr("data-order");
		
   		var $so_name_box = $('#viewLogTimeHistoryContent').find('.so-details-box');
   		$so_name_box.css('border-color',currDataHexcolor);
   		$so_name_box.find('.so-color-box').css('background-color',currDataHexcolor);
   		$so_name_box.find(".so-name-box").html(currDataOname);
   		
		var oid=$thisData.attr("data-order");
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'getLogTimeListOfOrder',grn_user:grnUserObj,orderId:oid},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		var records_arr=responseJson.records;
			   		
			   		$('#logTimeHistoryDiv').html('');
			   		
			   		if(records_arr==null || records_arr.length==0) {
			   			var logTimeDiv ='<div id="logTimeDiv" class="log-time-entry-div logTimeDiv1 text-align-center">'+
												'<div class="process-name">This order has no previous logged time history.</div>'+
										'</div>';
			   			$('#logTimeHistoryDiv').append(logTimeDiv);
			   		}
			   		else{
				   		jQuery.each(records_arr, function(index,value) {
				   			var id =value.id;
				   			var grn_users_id=value.grn_users_id;
				   			var grn_salesorderTime_id=value.grn_salesorderTime_id;
				   			var date =value.date;
				   			var decimalTime=value.time;
				   			var timer_flag =value.timer_flag;
				   			var crew_size =value.crew_size;
				   			var grn_timeCat =value.grn_timeCat;
				   			var commentsData =value.comments;				   			
				   			var title =value.title;
				   			var grn_timeCat_img = grn_timeCat;
				   			var grn_timeCat_trimmed=value.grn_timeCat;
				   			grn_timeCat_trimmed=grn_timeCat_trimmed.replace("_revision", "");
				   			
				   			var timeInHours=convertDecimalTimeToHours(decimalTime);
				   			var totalCrewTimeData = calcTotalCrewTimeBackend(crew_size,timeInHours);
				   			
				   			grn_timeCat_img=grn_timeCat_img.replace("_revision", "");
				   			var revisionSpan;
				   			if (grn_timeCat.toLowerCase().indexOf("revision") >= 0){
				   				revisionSpan='<span style="vertical-align: top;" class="text-pink">Revision Work</span>';
				   			}else{
				   				revisionSpan='<span style="vertical-align: top;" class="text-purple">Work</span>';
				   			}
				   			var comments="";	
				   			if(commentsData==""){
				   				comments="No Comments Yet.";
				   			}
				   			
					   		var logTimeDiv ='<div id="logTimeDiv" class="log-time-entry-div logTimeDiv1">'+
										   		'<div class="date-time-details">Date:<span class="">'+date+'</span>'+
												'<span class="pull-right">'+totalCrewTimeData+' hrs</span>'+
											'</div>'+
											'<div class="process-details">'+
												'<div class="ui-grid-a my-breakpoint">'+
												  '<div class="ui-block-a">'+
														'<div class="process-img">'+
															'<img src="img/'+grn_timeCat_img+'.png">'+            				 
														'</div>'+
														'<div class="process-name">'+title+'</div>'+
												  '</div>'+
												  '<div class="ui-block-b text-align-right">'+
														'<span class="link-custom-spam">'+
															'<a onclick="editLogTime(this);" href="#" data-sotimeid="'+grn_salesorderTime_id+'" data-comment="'+commentsData+'"  '+
															' data-id="'+id+'" data-date="'+date+'" data-time="'+timeInHours+'" data-crewSize="'+crew_size+'"  data-category="'+grn_timeCat_trimmed+'" >Edit</a>'+
														'</span>'+	
												  '</div>'+
												'</div>'+
												'<div class="more-process-details-main ">'+
													'<div class="text-align-right">'+
														'<a onclick="moreProcessDetails(this);" href="#" class="link">Show Details</a>'+
													'</div>'+
													'<div class="more-process-details moreDetailsDiv12" style="display: none;">'+
														'<p class="process-comment">Revision: '+revisionSpan+'</p>'+
														'<p class="process-comment">Comment: <span>'+comments+'</span></p>'+
													'</div>'+
												'</div>'+    
											'</div>'+
										'</div>';
					   		$('#logTimeHistoryDiv').append(logTimeDiv);
				   		});
				   		
			   		}
			   		hideModal();
			   		$.mobile.changePage('#view-log-time-history','slide');
				},
				error:function(data,t,f){
					hideModal();
					navigator.notification.alert(appRequiresWiFi, function() {});
				}
			});
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function addLogTime(){
	var $so_name_box = $('#addLogTimeContent').find('.so-details-box');
	$so_name_box.css('border-color',currDataHexcolor);
	$so_name_box.find('.so-color-box').css('background-color',currDataHexcolor);
	$so_name_box.find(".so-name-box").html(currDataOname);
	
	var $addUpdateLogTimeForm = $('form#addLogTimeForm');
	
	$addUpdateLogTimeForm.find('#staffTimeId').val('');
	$addUpdateLogTimeForm.find('#soTimeId').val(currDataOrder);
	
	$addUpdateLogTimeForm.find('#logTimeSubmitBtn').attr('data-flag','add');
	$addUpdateLogTimeForm.find('#logTimeRevisionSubmitBtn').attr('data-flag','add');
	
	$.mobile.changePage('#add-log-time','slide');
}

function editLogTime(dataObj){
	var $so_name_box = $('#addLogTimeContent').find('.so-details-box');
	$so_name_box.css('border-color',currDataHexcolor);
	$so_name_box.find('.so-color-box').css('background-color',currDataHexcolor);
	$so_name_box.find(".so-name-box").html(currDataOname);
	
	var $dataObj=$(dataObj);
	var id=$dataObj.data('id');
	var soTimeId=$dataObj.data('sotimeid');
	var date=$dataObj.data('date');
	var time=$dataObj.data('time');
	var crewSize=$dataObj.data('crewsize');
	var category=$dataObj.data('category'); //'prod_materials';
	var comment=$dataObj.data('comment');
	
	var $addUpdateLogTimeForm = $('form#addLogTimeForm');
	$addUpdateLogTimeForm.find('#logTimeSubmitBtn').attr('data-flag','update'); 
	$addUpdateLogTimeForm.find('#logTimeRevisionSubmitBtn').attr('data-flag','update');
	
	$addUpdateLogTimeForm.find('#staffTimeId').val(id);
	$addUpdateLogTimeForm.find('#soTimeId').val(soTimeId);
	
	$addUpdateLogTimeForm.find('#logDate').val(date);
	$addUpdateLogTimeForm.find('#logTime').val(time);
	$addUpdateLogTimeForm.find('#totalCrewTime').html('');
	$addUpdateLogTimeForm.find('#logComment').val(comment);
	refreshSelect($addUpdateLogTimeForm.find('#timeCat'),category);
	refreshSelect($addUpdateLogTimeForm.find('#crewSize'),crewSize);
	calcTotalCrewTime(crewSize,time);
	
	$.mobile.changePage('#add-log-time','slide');
}

function refreshSelect(ele,currentValue){
	// Grabbing a select field
	var el = $(ele);
	// Select the relevant option, de-select any others
	el.val(currentValue).attr('selected', true).siblings('option').removeAttr('selected');
	// Initialize the selectmenu
	el.selectmenu();
	// jQM refresh
	el.selectmenu("refresh", true);
}

function callAddUpadteLogTime(obj){
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var dataObj={};
		dataObj.action='addLogTime';
		dataObj.grn_user=grnUserObj;
		
		var $addUpdateLogTimeForm = $('form#addLogTimeForm');
		
		if($(obj).attr('data-flag')=='add'){
			dataObj.grn_staffTime_id= '';
		}else if($(obj).attr('data-flag')=='update'){
			dataObj.grn_staffTime_id= $addUpdateLogTimeForm.find('#staffTimeId').val();
		}
		dataObj.grn_salesorderTime_id= $addUpdateLogTimeForm.find('#soTimeId').val();
		dataObj.grn_timeCat= $addUpdateLogTimeForm.find('#timeCat option:selected').val();
		dataObj.date= $addUpdateLogTimeForm.find('#logDate').val();
		var time=$addUpdateLogTimeForm.find('#logTime').val();
		var timeArr=time.split(":");
		dataObj.hours= timeArr[0];
		dataObj.minutes= timeArr[1];
		dataObj.crew_size= $addUpdateLogTimeForm.find('#crewSize').val();
		dataObj.comments= $addUpdateLogTimeForm.find('#logComment').val();
	
		addUpadteLogTime(dataObj);
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function addUpadteLogTime(dataObj){
	showModal();
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	//var connectionType=checkConnection();
	var connectionType="WiFi connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		navigator.notification.alert(appRequiresWiFi, function() {});
	}
	else if(connectionType=="WiFi connection"){
		
		$.ajax({
			type : 'POST',
		   url:appUrl,
		   data:dataObj,
		   success:function(data){
		   		var responseJson = $.parseJSON(data);
		   		console.log(responseJson);
		   		if(responseJson.status=='success') {
		   			$.mobile.changePage('#view-all-sales-order','slide');
		   			navigator.notification.alert(responseJson.msg, function() {});
		   		}
		   		else if(responseJson.status=='fail') {
		   			navigator.notification.alert(serverBusyMsg, function() {});
		   		}
		   		hideModal();
			},
			error:function(data,t,f){
				hideModal();
				console.log(data+' '+t+' '+f);
				navigator.notification.alert(appRequiresWiFi, function() {});
			}
		});
	}
}

function closeSalesOrder(dataObj){
	showModal();
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var salesorderId='#'+$(dataObj).data('order');
		salesorderId=salesorderId.replace("#","");
		var salesId=$(dataObj).data('id');
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{
					action:'closeSalseOrder',
					grn_user:grnUserObj ,
					salesorder:salesorderId ,
				},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		if(responseJson.status=='success') {
			   			$('#salesOrderMainDiv').find('#sales-table-div_'+salesId).remove();
			   			navigator.notification.alert(responseJson.msg, function() {});
			   		}
			   		else if(responseJson.status=='fail') {
			   			navigator.notification.alert(serverBusyMsg, function() {});
			   		}
			   		hideModal();
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert(appRequiresWiFi, function() {});
				}
			});
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function showOrderSOBySONumber(){
	showModal();
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		
		//var salesorderId=$(dataObj).data('order');
		//console.log("salesorderId...."+salesorderId);
		var salesorderId=$('#sp_salesOrderNumber').val();
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection"){
			
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{
					action:'showSalseOrder',
					grn_user:grnUserObj ,
					salesorder:salesorderId ,
				},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		if(responseJson.status=='success') {
			   			getCategoriesForTimeTracking();
			   		}
			   		else if(responseJson.status=='fail') {
			   			$(".sales-order-msg").html(responseJson.msg);
			   			//navigator.notification.alert(serverBusyMsg, function() {});
			   		}
			   		hideModal();
			   		//$.mobile.changePage('#view-log-time-history','slide');
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert(appRequiresWiFi, function() {});
				}
			});
		}
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}


function moreProcessDetails(currObj){
	var $parentDiv = $(currObj).parents(".more-process-details-main");
	var $moreProcessDetails = $parentDiv.find('.more-process-details');
	
	if($moreProcessDetails.is(':visible')){
		$(currObj).text('Show Details');
		$moreProcessDetails.hide();
	}else{
        $(currObj).text('Hide Details');
        $moreProcessDetails.show();
	}
}

function convertDecimalTimeToHours(decimalTimeVal) {
	var decimalTime=""+decimalTimeVal+"";
	var splitDecimalTime=decimalTime.split(".");
	var hours=splitDecimalTime[0];
	var minutes=(decimalTime % 1).toFixed(4);
	minutes=minutes*60;
	if(minutes<1){
		minutesString="00";
	} 
	else if(minutes>= 1 && minutes<10){
		minutesString="0"+Math.round(minutes);;
	}else if(minutes>= 10 ){
		minutesString=Math.round(minutes);
	}
	var convertedHours=hours+":"+minutesString;
	return convertedHours;
}

function changeTimeCatImage(obj){
	var imgName=$(obj).find(":selected").val();
	$('#changeTimeCatImageId').attr('src','img/'+imgName+'.png');
}

function getDataForTotalTimeCalc(){
	var $addLogTimeForm=$('form#addLogTimeForm');
	var crewSize = $addLogTimeForm.find("#crewSize option:selected").val();
	var timeDuration=$addLogTimeForm.find('#logTime').val();
	calcTotalCrewTime(crewSize,timeDuration);
}

function  calcTotalCrewTime(crewSize,timeDuration){
	if(timeDuration !=''){
		//var currentLoggedTime = timeDuration; //'00:14';   // your input string
		var tempSplitVar = timeDuration.split(':'); // split it at the colons
		var currentLoggedMinutes = (+tempSplitVar[0]) * 60 + (+tempSplitVar[1]);
		currentLoggedMinutes=currentLoggedMinutes*crewSize;
		var currentLoggedHours;
		//Convert minutes to hh:mm format
		var hours = Math.floor( currentLoggedMinutes / 60);          
	    var minutes = currentLoggedMinutes % 60;
	    if(minutes < 10){
	    	minutes="0"+minutes;
	    }
	    var totalCrewTime=hours+":"+minutes;
		$('#totalCrewTime').html(totalCrewTime);
	}
	else{
		console.log('Empty');
	}
}

function  calcTotalCrewTimeBackend(crewSize,timeDuration){
	if(timeDuration !=''){
		//var currentLoggedTime = timeDuration; //'00:14';   // your input string
		var tempSplitVar = timeDuration.split(':'); // split it at the colons
		var currentLoggedMinutes = (+tempSplitVar[0]) * 60 + (+tempSplitVar[1]);
		currentLoggedMinutes=currentLoggedMinutes*crewSize;
		var currentLoggedHours;
		//Convert minutes to hh:mm format
		var hours = Math.floor( currentLoggedMinutes / 60);          
	    var minutes = currentLoggedMinutes % 60;
	    if(minutes < 10){
	    	minutes="0"+minutes;
	    }
	    var totalCrewTime=hours+":"+minutes;
		return totalCrewTime;
	}
	else{
		console.log('Empty');
	}
}

/* ----------------  Time Tracker Code Starts -------------------------  */

var TimerFlag = 0;
var order = 0;
var timecat = 0;
var timerId = 0;
var date = 0000-00-00;
baseGrnUrl="";

function logTimer(obj) {
	var action=$(obj).attr('data-action');
	//console.log("action..."+action+">>>"+$(obj).attr('data-action'));
    if (!timerId) {
        if (action == 'clock') {
            order = $(obj).attr('data-order');
            timecat = $(obj).attr('data-timeCat');
            startTimer();
        }
    }
	else {
        if (action === 'pause') {
            pauseTimer();
        }else if (action === 'resume') {
            resumeTimer();
        }else if (action === 'logtime') {
            logtimeTimer();
        }else if (action === 'delete') {
            showDeleteTrackerDialog();
        }else  if (action === 'logpauseOption') {
            logpauseOption();
        }else  if (action === 'clock') {
        	saveRunningTimer();
        }
    }
}

function startTimer() {
	//var connectionType=checkConnection();
	var connectionType="Unknown connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
        TimerFlag = 1;
        $('#logging_time').timer('remove');
        $('#logging_time').timer();
        $('#running_tracker').show();
       
        var curr_sp_order_name=$('#sp_order_name_' + order).text();
        curr_sp_order_name=curr_sp_order_name.replace("Report","");
        $('#logging_detail').html(curr_sp_order_name);
        $('#logging_order_color_code').attr('style', $('#sp_order_name_' + order).find(".so-color-box").attr('style'));
        
        $('#timer_' + order + '_' + timecat).removeClass('clock').addClass('play').attr('data-action', 'logpauseOption');
        $('#timer_img_' + order + '_' + timecat).addClass('play').attr('data-action', 'logpauseOption');
        
        $('#logging_proc_icon').html('<img src="' + 'img/' + timecat + '.png" width="25px" />');
        
        //timerId = data.timerId;
        //date = data.date;
        timerId=2;
        $('#logging_play').hide();
        $('#logging_pause').show();
    }
	else if(connectionType=="WiFi connection"){
		 $.ajax({
		        type: "POST",
		        url: baseGrnUrl + "timetracker/ajax.php",
		        data: "order_id=" + order + "&timecat=" + timecat + "&timerFlag=" + TimerFlag + "&action=startTimer",
		        dataType: "json",
		        success: function(data) {
		            if (data.status == 'success') {
		                TimerFlag = 1;
		                $('#logging_time').timer('remove');
		                $('#logging_time').timer();
		                $('#running_tracker').show();
		               
		                var curr_sp_order_name=$('#sp_order_name_' + order).text();
		                curr_sp_order_name=curr_sp_order_name.replace("Report","");
		                $('#logging_detail').html(curr_sp_order_name);
		                $('#logging_order_color_code').attr('style', $('#sp_order_name_' + order).find(".so-color-box").attr('style'));
		                $('#timer_' + order + '_' + timecat).removeClass('clock').addClass('play').attr('data-action', 'logpauseOption');
		                $('#timer_img_' + order + '_' + timecat).addClass('play').attr('data-action', 'logpauseOption');
		                $('#logging_proc_icon').html('<img src="' + 'img/' + timecat + '.png" width="25px" />');
		                
		                //timerId = data.timerId;
		                //date = data.date;
		                $('#logging_play').hide();
		                $('#logging_pause').show();
		            }
		            if (data.action == 'fail') {
		                $('#msg.msg').html(data.msg);
		            }
		            //hideNotification('#msg.msg');
		        }
		 });
	}
	
}

function pauseTimer() {
    console.log('Order: ' + order + ' TimeCat: ' + timecat + ' TimerId: ' + timerId);
    
    //var connectionType=checkConnection();
	var connectionType="Unknown connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		$('#logging_time').timer('pause');
        //take current time
		
		$('#timer_' + order + '_' + timecat).removeClass('play').addClass('pause').attr('data-action', 'resume');
		$('#timer_img_' + order + '_' + timecat).removeClass('play').addClass('pause').attr('data-action', 'resume');
        
        $('#logging_pause').hide();
        $('#logging_play').show();//.attr('data-action', 'resume');;
	}
	else if(connectionType=="WiFi connection"){
		$.ajax({
	        type: "POST",
	        url: baseGrnUrl + "timetracker/ajax.php",
	        data: "timerId=" + timerId + "&action=pauseTimer",
	        dataType: "json",
	        success: function(data) {
	            if (data.status == 'success') {
	                $('#logging_time').timer('pause');
	                $('#logging_pause').hide();
	                $('#logging_play').show();
	                $('#timer_' + order + '_' + timecat).removeClass('play').addClass('pause');
	                $('#timer_img_' + order + '_' + timecat).removeClass('play').addClass('pause');
	                $('#timer_' + order + '_' + timecat).attr('data-action', 'resume');
	                $('#timer_img_' + order + '_' + timecat).attr('data-action', 'resume');
	            }
	            if (data.action == 'fail') {
	                $('#msg.msg').html(data.msg);
	            }
	            hideNotification('#msg.msg');
	        }
	    });
	}
}

function resumeTimer() {
	//var connectionType=checkConnection();
	var connectionType="Unknown connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		$('#logging_time').timer('remove');
        $('#logging_time').timer({
            seconds: 200
        });
        // $('[id="a"]');
        $('#timer_' + order + '_' + timecat).removeClass('pause').addClass('play').attr('data-action', 'logpauseOption');
        $('#timer_img_' + order + '_' + timecat).removeClass('pause').addClass('play').attr('data-action', 'logpauseOption');
        
        $('#logging_pause').show();
        $('#logging_play').hide();
	}
	else if(connectionType=="WiFi connection"){
		 $.ajax({
		        type: "POST",
		        url: baseGrnUrl + "timetracker/ajax.php",
		        data: "timerId=" + timerId + "&action=resumeTimer",
		        dataType: "json",
		        success: function(data) {
		            if (data.status == 'success') {
		                $('#logging_time').timer('remove');
		                $('#logging_time').timer({
		                    seconds: data.time
		                });
		                $('#logging_pause').show();
		                $('#logging_play').hide();
		                $('#timer_' + order + '_' + timecat).removeClass('pause').addClass('play');
		                $('#timer_img_' + order + '_' + timecat).removeClass('pause').addClass('play');
		                $('#timer_' + order + '_' + timecat).attr('data-action', 'logpauseOption');
		                $('#timer_img_' + order + '_' + timecat).attr('data-action', 'logpauseOption');
		            }
		            if (data.action == 'fail') {
		                $('#msg.msg').html(data.msg);
		            }
		            hideNotification('#msg.msg');
		        }
		    });
	}
}

function logtimeTimer() {
    //$('#logtime_popup #so_process_name').html(timecat + '&nbsp;&nbsp;<img src="img/' + timecat + '.png" width="25px" />');
   
    var order_name = $('#sp_order_name_' + order).text();
    var currDataHexcolorVal = $('#sp_order_name_' + order).find('.so-color-box').css('background-color')
    
	var $so_name_box = $('#addLogTimeContent').find('.so-details-box');
	$so_name_box.css('border-color',currDataHexcolorVal);
	$so_name_box.find('.so-color-box').css('background-color',currDataHexcolorVal);
	$so_name_box.find(".so-name-box").html(order_name);
	
	var id="";
	//$('#is_revision').attr('data-timecat', timecat);
	var soTimeId=order;// done
	var date=date;// done
	var time = $('#logging_time').text()// done
	
	if (time.indexOf("sec") >= 0){
		var timeTemp=time.split(" ");
		time=timeTemp[0];
		if(time<10){
			time="00:0"+time;
		}else{
			time="00:"+time;
		}
	}else if (time.indexOf("min") >= 0){
		var timeTemp=time.split(" ");
		time=timeTemp[0];
	}
	
	var crewSize=1;// done
	// $('#grn_staffTime_id').val(timerId);
	var grnStaffTimeId=timerId;
	
	var category=timecat;
	var comment="";// done
	
	var $addUpdateLogTimeForm = $('form#addLogTimeForm');
	$addUpdateLogTimeForm.find('#logTimeSubmitBtn').attr('data-flag','add'); 
	$addUpdateLogTimeForm.find('#logTimeRevisionSubmitBtn').attr('data-flag','add');
	
	$addUpdateLogTimeForm.find('#staffTimeId').val('');
	$addUpdateLogTimeForm.find('#soTimeId').val(soTimeId);
	
	$addUpdateLogTimeForm.find('#logDate').val(date);
	$addUpdateLogTimeForm.find('#logTime').val(time);
	$addUpdateLogTimeForm.find('#totalCrewTime').html('');
	$addUpdateLogTimeForm.find('#logComment').val(comment);
	refreshSelect($addUpdateLogTimeForm.find('#timeCat'),category);
	refreshSelect($addUpdateLogTimeForm.find('#crewSize'),crewSize);
	calcTotalCrewTime(crewSize,time);
	
	$.mobile.changePage('#add-log-time','slide');
	resetTracker();
}


function deleteTimer() {
	console.log('Order: ' + order + ' TimeCat: ' + timecat + ' TimerId: ' + timerId);
	
	//var connectionType=checkConnection();
	var connectionType="Unknown connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		resetTracker();
	}
	else if(connectionType=="Unknown connection"){
		type = '<i class="fa fa-exclamation-triangle fa-5x text-danger"></i><br><br>';
	    bootbox.confirm({
	        size: 'small', closeButton: false,
	        message: type + "Confirm delete?",
	        buttons: {
	            'cancel': {label: 'Cancel', className: 'btn-default pull-left'},
	            'confirm': {label: 'Delete', className: 'btn-warning pull-right'}
	        },
	        callback: function(result) {
	            if (result) {
	                $.ajax({
	                    type: "POST",
	                    url: baseGrnUrl + "timetracker/ajax.php",
	                    data: "timerId=" + timerId + "&action=deleteLogTime",
	                    dataType: "json",
	                    success: function(data) {
	                        if (data.status == 'success') {
	                            $('#msg.msg').html('<div class="alert alert-success span6"><button data-dismiss="alert" class="close" type="button">×</button>' + data.msg + '</div>');
	                            resetTracker();
	                        }
	                        if (data.action == 'already') {
	                            $('#msg.msg').html(data.msg);
	                        }
	                        hideNotification('#msg.msg');
	                    }
	                });

	            }
	        }
	    });
	}
}

function resetTracker() {
	TimerFlag = 0;
    order = 0;
    timecat = 0;
    timerId = 0;
    
    $('#logging_time').timer('remove');
    $('#logging_time').html('00:00');
    $('#timer_' + order + '_' + timecat).removeClass('pause').removeClass('play').addClass('clock').attr('data-action', 'clock');
    $('#timer_img_' + order + '_' + timecat).removeClass('pause').removeClass('play').attr('data-action', 'clock');
    
    $('#running_tracker').hide();
    $('#logging_pause').hide();
    $('#logging_play').show();
}

function showDeleteTrackerDialog() {
    navigator.notification.confirm(
            ("Are you sure to delete this time ?"), // message
            deleteTrackerAction, // callback
            'Time Tracker ', // title
            'Cancel,Delete' // buttonName
    );
}

//Call exit function
function deleteTrackerAction(button){
	if(button=="2" || button==2){
    	deleteTimer();
	}
}


function logpauseOption() {
	showLogPauseOptionsDialog();
}

function showLogPauseOptionsDialog() {
    navigator.notification.confirm(
            ("What to do with the running timer ?"), // message
            logPauseAction, // callback
            'Time Tracker ', // title
            'Cancel,Log Time,Pause' // buttonName
    );
}

function logPauseAction(button){
    if(button=="2" || button==2){
    	logtimeTimer();
    }
    else if(button=="3" || button==3){
    	pauseTimer();
    }
}

function saveRunningTimer() {
	showSaveRunningTimerDialog();
}

function showSaveRunningTimerDialog() {
    navigator.notification.confirm(
            ("What to do with the running timer ?"), // message
            saveRunningTimerAction, // callback
            'Time Tracker ', // title
            'Cancel,Edit/Log Time' // buttonName
    );
}

function saveRunningTimerAction(button){
    if(button=="2" || button==2){
    	logtimeTimer();
    }
}


/* ----------------  Time Tracker Code Ends   -------------------------  */

/* ************* Database Code Ends   -------------------------  */

// Open Database
function openDatabase() {
   //db = window.openDatabase("Database", "1.0", "BP_MET", 2000000);
   db.transaction(initializeDB, errorDB, successDB);
   alert(JSON.stringify(db));
}

//Populate the database 
function initializeDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS SALES_ORDER ('+
			'id integer primary key autoincrement,'+
			'grn_companies_id integer,'+
			'sp_manager text,'+
			'sp_salesorderNumber integer,'+
			'sp_jobName text,'+
			'grn_colors_id integer,'+
			'HexColor text )');
	
	tx.executeSql('CREATE TABLE IF NOT EXISTS TIME_CATEGORY ('+
			'id integer primary key autoincrement,'+
			'pid integer,'+
			'timeCats text,'+
			'title text,'+
			'sp_jobName text,'+
			'grn_roles_id integer,'+
			'revision integer,'+
			'status integer )');
	
	tx.executeSql('CREATE TABLE IF NOT EXISTS TIME_TRACKER ('+
			'id integer primary key autoincrement,'+
			'soTimeId integer,'+
			'date text,'+
			'time text,'+
			'crewSize integer,'+
			'grnStaffTimeId integer,'+
			'timecat text,'+
			'comment text )');
	
}

//Transaction success callback
function successDB() {
	db.transaction(queryDataBase, errorCB);
}

//Transaction error callback
function errorDB(err) {
	console.log("Error processing SQL: "+err.code);
}

//db.transaction(insertTimeCategory, errorCB, successCB);
function insertTimeCategory(tx) {
	//tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id integer primary key autoincrement, data text,tracker_date text)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS TIME_CATEGORY ('+
			'id integer primary key autoincrement,'+
			'timeCats text,'+
			'title text,'+
			'sp_jobName text,'+
			'grn_roles_id integer,'+
			'revision integer,'+
			'status integer )');
	
	jQuery.each(time_cats_arr, function(index,value) {
    	var jsonObj=value;
    	var id=jsonObj["id"];
    	var timeCats=jsonObj["timeCats"];
    	var title=jsonObj["title"];
    	var sp_jobName=jsonObj["sp_jobName"];
    	var grn_roles_id=jsonObj["grn_roles_id"];
    	var revision=jsonObj["revision"];
    	var status=jsonObj["status"];
    	
    	tx.executeSql('INSERT INTO TIME_CATEGORY(pid, timeCats, title, sp_jobName, grn_roles_id, revision, status) VALUES (?,?,?,?,?,?,?)',
    			[id,timeCats,title,sp_jobName,grn_roles_id,revision,status]);
    	
	});
}


//Query the database
function queryDataBase(tx) {
	tx.executeSql('SELECT * FROM TIME_CATEGORY', [], querySuccess, errorDB);
}

// Query the success callback
function querySuccess(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	
	var len = results.rows.length;
	console.log("DEMO table: " + len + " rows found.");
	//$("#resultList > li").remove();
	for (var i=0; i<len; i++){
		//alert("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
		//console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
		$('#resultList').append('<li><a href="#">' + results.rows.item(i).id + '--' +results.rows.item(i).sp_jobName+'</a></li>').listview('refresh');
	}

	//alert("Returned rows = " + results.rows.length);
	// this will be true since it was a select statement and so rowsAffected was 0
	if (!results.rowsAffected) {
		console.log('No rows affected!');
		return false;
	}
	// for an insert statement, this property will return the ID of the last inserted row
	console.log("Last inserted row ID = " + results.insertId);
}



/* ************* Database Code Ends   -------------------------  */


/* ===============  Code Reusable ========================  */

function getTodayDate(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;//January is 0, so always add + 1

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd}
	if(mm<10){mm='0'+mm}
	today = dd+'/'+mm+'/'+yyyy;
	return today;
}

function startTracker() {
	
	var currtimetrackerid; 
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO DEMO(data, tracker_date) VALUES (?,?)',["0",getTodayDate().toString()]
			,function(tx, results){
					//alert('Returned ID: ' + results.insertId);
					currTimeTrackerId=results.insertId;
					window.localStorage.setItem("trackerkey", ""+currTimeTrackerId+"");
			 }
		);
	});
} 

function stopTracker() {
	//var trackerkey=window.localStorage.getItem("trackerkey");
	var timeTracked=$('#timeTrackerDiv').data('seconds'); 
	var currtimetrackerid = window.localStorage.getItem("trackerkey");
	
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
	db.transaction(function(tx) {
		//tx.executeSql('INSERT INTO DEMO(data, tracker_date) VALUES (?,?)',[timeTracked.toString(),getTodayDate().toString()]);
		tx.executeSql("UPDATE DEMO SET data='" + timeTracked + "' WHERE id=' "+currtimetrackerid+" '");
		
		/*
		var executeQuery = "UPDATE " +"DEMO " +"SET data = ?  WHERE  id =?"; 
		transaction.executeSql(executeQuery, [timeTracked, currtimetrackerid]
			,
			function(tx, result) {   // On success
				 alert('updated successfully.');
			}
		);
		*/
	});
	window.localStorage.removeItem("trackerkey");
	$('#timeTrackerDiv').timer('remove');
}
			
function AddValueToDB() {
   //alert('Databases are nowwww supported in this browser.');
   var db = window.openDatabase("Database", "1.0", "BP_MET", 2000000);
   db.transaction(initializeDB, errorCB, successCB);
} 

function GetValueToDB() {
   //alert('Databases are nowwww supported in this browser.');
   var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
   db.transaction(successCBData, errorCB);
} 

// Populate the database 
function initializeDB123(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS DEMO');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id integer primary key autoincrement, data text,tracker_date text)');
	//tx.executeSql('INSERT INTO DEMO (id, data, tracker_date) VALUES (1, "15Sep2015 row", "15Sep2015")');
	tx.executeSql('INSERT INTO DEMO(data, tracker_date) VALUES (?,?)',["15Sep2015 row","15/09/2015"]);
	tx.executeSql('INSERT INTO DEMO(data, tracker_date) VALUES (?,?)',["16Sep2015","16/09/2015"]);
}

// Insert Values in the database 
function insertValueInDB(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS DEMO');
	//tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id integer primary key unique, data text,tracker_date text)');
	//tx.executeSql('INSERT INTO DEMO (id, data, tracker_date) VALUES (1, "15Sep2015 row", "15Sep2015")');
}

// Query the database
/*function queryDB(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function queryDBData(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccessData, errorCB);
}*/

// Query the success callback
/*function querySuccess(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	alert("Returned rows = " + results.rows.length);
	// this will be true since it was a select statement and so rowsAffected was 0
	if (!results.rowsAffected) {
		console.log('No rows affected!');
		return false;
	}
	// for an insert statement, this property will return the ID of the last inserted row
	console.log("Last inserted row ID = " + results.insertId);
}*/

function querySuccessData(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	
		var len = results.rows.length;
		console.log("DEMO table: " + len + " rows found.");
		$("#trackerList > li").remove();
		for (var i=0; i<len; i++){
			//alert("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
			//console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
			$('#trackerList').append('<li><a href="#">' + results.rows.item(i).data + '--' +results.rows.item(i).tracker_date+'</a></li>').listview('refresh');
		}
	
	//alert("Returned rows = " + results.rows.length);
	// this will be true since it was a select statement and so rowsAffected was 0
	if (!results.rowsAffected) {
		console.log('No rows affected!');
		return false;
	}
	// for an insert statement, this property will return the ID of the last inserted row
	console.log("Last inserted row ID = " + results.insertId);
}

// Transaction error callback
function errorCB(err) {
	console.log("Error processing SQL: "+err.code);
}

// Transaction success callback
function successCB() {
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
	db.transaction(queryDB, errorCB);
}

function successCBData() {
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
	db.transaction(queryDBData, errorCB);
}

