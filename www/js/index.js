/*$(document).ready(function() {
    //checkTimeTracker(); 
	$("a.process-report").on("click", function(event){
		  event.stopPropagation();
		  console.log( "I was clicked, but my parent will not be." );
		});
	
	var connCheck = setInterval(function() {
        checkConnection();
    }, 3000);
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
var appRequiresWiFi='This action requires internet.';
var serverBusyMsg='Server is busy, please try again later.';
var currDataHexcolor,currDataOname,currDataOrder;
var salse_orders_arr;
var globalLogTimeObj={};
var db;

var colorArray=[{"id":"1","HexColor":"FFD700"},{"id":"2","HexColor":"FFC0CB"},{"id":"3","HexColor":"FFA500"},{"id":"4","HexColor":"FFA07A"},
                {"id":"5","HexColor":"FF69B4"},{"id":"6","HexColor":"FF1493"},{"id":"7","HexColor":"FF0000"},
                {"id":"8","HexColor":"F08080"},{"id":"9","HexColor":"EE82EE"},{"id":"10","HexColor":"E9967A"},
                {"id":"11","HexColor":"DC143C"},{"id":"12","HexColor":"DAA520"},{"id":"13","HexColor":"DA70D6"},
                {"id":"14","HexColor":"D87093"},{"id":"15","HexColor":"D3D3D3"},{"id":"16","HexColor":"D2B48C"},
                {"id":"17","HexColor":"D2691E"},{"id":"18","HexColor":"CD5C5C"},{"id":"19","HexColor":"C71585"},
                {"id":"20","HexColor":"C0C0C0"},{"id":"21","HexColor":"BDB76B"},{"id":"22","HexColor":"BC8F8F"},
                {"id":"23","HexColor":"BA55D3"},{"id":"24","HexColor":"B8860B"},{"id":"25","HexColor":"B22222"},
                {"id":"26","HexColor":"B0C4DE"},{"id":"27","HexColor":"ADFF2F"},{"id":"28","HexColor":"ADD8E6"},
                {"id":"29","HexColor":"A9A9A9"},{"id":"30","HexColor":"A52A2A"},{"id":"31","HexColor":"A0522D"},
                {"id":"32","HexColor":"9ACD32"},{"id":"33","HexColor":"9932CC"},{"id":"34","HexColor":"98FB98"},
                {"id":"35","HexColor":"9400D3"},{"id":"36","HexColor":"90EE90"},{"id":"37","HexColor":"8FBC8F"},
                {"id":"38","HexColor":"8B008B"},{"id":"39","HexColor":"8B0000"},{"id":"40","HexColor":"8A2BE2"},
                {"id":"41","HexColor":"87CEEB"},{"id":"42","HexColor":"808000"},{"id":"43","HexColor":"800080"},
                {"id":"44","HexColor":"800000"},{"id":"45","HexColor":"7FFFD4"},{"id":"46","HexColor":"7CFC00"},
                {"id":"47","HexColor":"7B68EE"},{"id":"48","HexColor":"708090"},{"id":"49","HexColor":"6B8E23"},
                {"id":"50","HexColor":"6A5ACD"},{"id":"51","HexColor":"696969"},{"id":"52","HexColor":"66CDAA"},
                {"id":"53","HexColor":"6495ED"},{"id":"54","HexColor":"5F9EA0"},{"id":"55","HexColor":"556B2F"},
                {"id":"56","HexColor":"4B0082"},{"id":"57","HexColor":"48D1CC"},{"id":"58","HexColor":"483D8B"},
                {"id":"59","HexColor":"4169E1"},{"id":"60","HexColor":"40E0D0"},{"id":"61","HexColor":"3CB371"},
                {"id":"62","HexColor":"32CD32"},{"id":"63","HexColor":"2E8B57"},{"id":"64","HexColor":"228B22"},
                {"id":"65","HexColor":"20B2AA"},{"id":"66","HexColor":"1E90FF"},{"id":"67","HexColor":"191970"},
                {"id":"68","HexColor":"00FF7F"},{"id":"69","HexColor":"00FF00"},{"id":"70","HexColor":"00FA9A"},
                {"id":"71","HexColor":"00BFFF"},{"id":"72","HexColor":"008080"},{"id":"73","HexColor":"006400"},{"id":"74","HexColor":"0000CD"}
               ];

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
		
		//db = window.sqlitePlugin.openDatabase("Database", "1.0", "BPMETR", 200000);
		db = window.sqlitePlugin.openDatabase({name: "bpmetr.db", location: 2});
		db.transaction(initializeDB, errorCB, successCB);
        
        checkPreAuth();
		$("#loginForm").on("submit",handleLogin);
		
		//setInterval(checkConnectionForSync, 900000);
    },
	// Update DOM on a Received Event
    receivedEvent: function(id) {
		
    }
};

function checkConnectionForSync() {
	//alert('fdghdfgkjh');
	 var objConnection = navigator.network.connection;
	 var connectionInfo = getConnectionType(objConnection.type);
    if (connectionInfo.value >= 3) {
    	//alert('fdghdfgkjh');
    	//call sync here
    }
}

var successTimeTrackerIdArr=[];
function callSyncWithServer() {
	alert("callSyncWithServer..");
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};// Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	db.transaction
	  (
	       function (tx){
	    	   // soTimeId,date,time,crewSize,grnStaffTimeId,timecat,comment,localStatus
	            tx.executeSql('SELECT id,soTimeId,date,time,crewSize,grnStaffTimeId,timecat,comment,localStatus FROM TIMETRACKER',[],function(tx,results){
	                    var len = results.rows.length;
	                    alert(" TIMETRACKER table length...."+len);
	                    if(len>0){
	                        for (var i = 0; i < len; i++) {
	                            //alert(results.rows.item(i)['timeCats']);
	                        	if(results.rows.item(i)['localStatus']=='complete'){
	                        		alert("id"+results.rows.item(i)['id']);
	                        		var currid=results.rows.item(i)['id'];
	                        		var dataObj={};
	                        		dataObj.action='addLogTime';
	                        		dataObj.grn_user=grnUserObj;
	                        		dataObj.grn_staffTime_id= results.rows.item(i)['grnStaffTimeId'];
	                        		dataObj.grn_salesorderTime_id= results.rows.item(i)['soTimeId'];
	                        		dataObj.grn_timeCat= results.rows.item(i)['timecat'];
	                        		dataObj.date= results.rows.item(i)['date'];
	                        		var time=results.rows.item(i)['time'];
	                        		var timeArr=time.split(":");
	                        		dataObj.hours= timeArr[0];
	                        		dataObj.minutes= timeArr[1];
	                        		dataObj.crew_size= results.rows.item(i)['crewSize'];
	                        		dataObj.comments= results.rows.item(i)['comment'];
	                        		dataObj.lid= currid;
	                        		
	                        		var response = saveLogTime(dataObj);
	                        		if(response){
	                        			alert("saveLogTime response ----"+response);
	                        			//deleteTimeTrackerRow(currid);
	                        			//successTimeTrackerIdArr.push(currid);
	                        		}
	                        		else{
	                        			
	                        		}
	                        	}
	                        	alert(results.rows.item(i)['localStatus']+"---"+results.rows.item(i)['time']);
	                            $('#resultList').append('<li><a href="#">' + results.rows.item(i)['localStatus']+"--"+ results.rows.item(i)['time'] + '</a></li>');
	                        }
	                        $('#resultList').listview();
	                        //alert(" before successTimeTrackerIdArr.."+successTimeTrackerIdArr);
	                    }
	                }, errorCB
	            );
	       },errorCB,successCB
	   );
	
	/*jQuery.each(successTimeTrackerIdArr, function(index,value) {
		deleteTimeTrackerRow(value);
	});	*/
	//alert("after successTimeTrackerIdArr.."+successTimeTrackerIdArr);
	
	//window.localStorage["solocal"] = 0;
	//window.localStorage["tclocal"] = 0;
	window.localStorage["ttsync"] = 1;
}

//Query the success callback
function successSyncCall(tx,results) {
	var len = results.rows.length;
	alert("successSyncCall: " + len + " rows found.");
	for (var i=0; i<len; i++){
		//alert("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
		//console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data);
		alert(results.rows.item(i)['time']+"--"+results.rows.item(i)['localStatus']);
		$('#resultList').append('<li><a href="#">' + results.rows.item(i)['localStatus'] + '--' +results.rows.item(i)['time']+'</a></li>');
	}
	 $('#resultList').listview();
	// this will be true since it was a select statement and so rowsAffected was 0
	if (!results.rowsAffected) {
		alert('No rows affected!');
		return false;
	}
	console.log("Last inserted row ID = " + results.insertId);
}

function callSaveLogTime(obj){
	
	var connectionType=checkConnection();
	//var connectionType="WiFi connection";//For Testing
	
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var dataObj={};
		dataObj.action='addLogTime';
		dataObj.grn_user=grnUserObj;
		
		var $addUpdateLogTimeForm = $('form#addLogTimeForm');
		
		dataObj.grn_staffTime_id= '';
		dataObj.grn_salesorderTime_id= $addUpdateLogTimeForm.find('#soTimeId').val();
		dataObj.grn_timeCat= $addUpdateLogTimeForm.find('#timeCat option:selected').val();
		dataObj.date= $addUpdateLogTimeForm.find('#logDate').val();
		var time=$addUpdateLogTimeForm.find('#logTime').val();
		var timeArr=time.split(":");
		dataObj.hours= timeArr[0];
		dataObj.minutes= timeArr[1];
		dataObj.crew_size= $addUpdateLogTimeForm.find('#crewSize').val();
		dataObj.comments= $addUpdateLogTimeForm.find('#logComment').val();
		
		var result=saveLogTime(dataObj,updateQuery);
		if(result=="serverSave"){
			//resetTracker();
			return true;
		}else{
			return false;
		}	
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function updateTrackerVariable(){
	window.localStorage["trackerValueSave"] = 1;
}

function saveLogTime(dataObj){
	//showModal();
	alert("saveLogTime called");
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	//var connectionType=checkConnection();
	var connectionType="WiFi connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		alert("data saved sync failssss");
	   return false;
	}
	else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
		$.ajax({
			type : 'POST',
		   url:appUrl,
		   data:dataObj,
		   success:function(data){
		   		var responseJson = $.parseJSON(data);
		   		console.log(responseJson);
		   		if(responseJson.status=='success') {
		   			
		   			alert(JSON.stringify(dataObj));
		   			alert("data saved sync..."+dataObj["lid"]+"---"+dataObj.lid+"...");
		   			
		   			deleteTimeTrackerRow(1);
		   			
		   			return true;
		   		}
		   		else if(responseJson.status=='fail') {
		   			alert("data saved sync failssss");
		   			return false;
		   		}
			},
			error:function(data,t,f){
				hideModal();
				return false;
				console.log(data+' '+t+' '+f);
				navigator.notification.alert(appRequiresWiFi, function() {});
			}
		});
	}
}


function getConnectionType(type) {
    var connTypes = {};
    connTypes[Connection.NONE] = {
        message: 'No network connection',
        value: 0
    };
    connTypes[Connection.UNKNOWN] = {
        message: 'Unknown connection',
        value: 1
    };
    connTypes[Connection.ETHERNET] = {
        message: 'Ethernet connection',
        value: 2
    };
    connTypes[Connection.CELL_2G] = {
        message: 'Cell 2G connection',
        value: 3
    };
    connTypes[Connection.CELL_3G] = {
        message: 'Cell 3G connection',
        value: 4
    };
    connTypes[Connection.CELL_4G] = {
        message: 'Cell 4G connection',
        value: 5
    };
    connTypes[Connection.WIFI] = {
        message: 'WiFi connection',
        value: 6
    };
    return connTypes[type];
}

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
	var connectionType=checkConnection();
	//var connectionType="Unknown connection";//For Testing
	
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		navigator.notification.alert("Logout requires active internet connection.", function() {});
	}
	else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
		showLogoutDialog();
	}
	
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
	window.localStorage["datasync"] = 0;
	window.localStorage["solocal"] = 0;
	window.localStorage["tclocal"] = 0;
	window.localStorage["ttsync"] = 0;
	
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
			
			if(window.localStorage["user_logged_in"] ==1) {
				$.mobile.changePage('#home-page',{ transition: "slideup"});
			}
			else{
				navigator.notification.alert(appRequiresWiFi, function() {});
			}	
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
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
					
					window.localStorage["trackerValueSave"]=0;
					window.localStorage["solocal"] = 0;
					window.localStorage["tclocal"] = 0;
					window.localStorage["ttsync"] = 0;
				}else{
					window.localStorage["password"] = '';
					window.localStorage["user_logged_in"] = 0;
					window.localStorage["trackerValueSave"]=0;
					
					window.localStorage["grnUser"] = '';
					window.localStorage["ID"] = '';
					window.localStorage["grn_companies_id"] = '';
					window.localStorage["nickname"] = '';
					window.localStorage["grn_roles_id"] = '';
					window.localStorage["permissions"] = '';
					
					window.localStorage["email"] = '';
					
					window.localStorage["trackerValueSave"]=0;
					window.localStorage["solocal"] = 0;
					window.localStorage["tclocal"] = 0;
					window.localStorage["ttsync"] = 0;
					
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
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};// Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
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
					   		var randomNumber=getRandomColor();
					   		var randomColorCode=colorArray[randomNumber-1]["HexColor"];
					   		$sp_details_div.find('#chooseColorForSalesOrder').val(randomColorCode);
					   		$sp_details_div.find('#colorForSO').css('background','#'+randomColorCode);
					   		
					   		
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
	
	getTimeTrackerList();
}

function getRandomColor(){
	var minimumColor=1;
	var maximumColor=74;
	var randomColor = Math.floor(Math.random() * (maximumColor - minimumColor + 1)) + minimumColor;
	return (randomColor-1);
}

function createNewSO(){
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};// Testing data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData)
	
	if(grnUserObj != '') {
		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
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
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			if(window.localStorage["tclocal"] == 1){
				getSalesOrders();
			}
			else if(window.localStorage["tclocal"] == 0){
				navigator.notification.alert(appRequiresWiFi, function() {});
			}
			
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			showModal();
			
			if(window.localStorage["tclocal"] == 1){
				getSalesOrders();
		   		hideModal();
			}
			else if(window.localStorage["tclocal"] == 0){
				$.ajax({
					type : 'POST',
				   url:appUrl,
				   data:{action:'getCompanyAvailableCategories',grn_user:grnUserObj},
				   success:function(data){
				   		var responseJson = $.parseJSON(data);
				   		time_cats_arr=responseJson.time_cats;
				   		getSalesOrders();
				   		
				   		//db.transaction(insertTimeCategory, errorCB, successCB);// Insert Time Category
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
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}


function getTotalTimeForCategory(){
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'getTotalTime',grn_user:grnUserObj,grn_salesorderTime_id:"1",grn_timeCat:"prod_materials"},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		console.log(responseJson);
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

function getAllColorsForSO(){
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			$.ajax({
				type : 'POST',
			   url:appUrl,
			   data:{action:'getColors'},
			   success:function(data){
			   		var responseJson = $.parseJSON(data);
			   		console.log(responseJson);
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

	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			if(window.localStorage["solocal"] == 1){
				$.mobile.changePage('#view-all-sales-order','slide');
			}
			else if(window.localStorage["solocal"] == 0){
				navigator.notification.alert(appRequiresWiFi, function() {});
			}
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			showModal();
			
			if(window.localStorage["solocal"] == 1){
				//getSalesOrders();
				$.mobile.changePage('#view-all-sales-order','slide');
			}
			else if(window.localStorage["solocal"] == 0){
			
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
				   		
				   		salse_orders_arr=responseJson.sales_orders;
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
				   		
				   		window.localStorage["solocal"] = 1;
				   		//db.transaction(insertSalesOrder, errorCB, successCB);// Insert Time Category
				   		//getSalesOrderList();
				   		$.mobile.changePage('#view-all-sales-order','slide');
					},
					error:function(data,t,f){
						hideModal();
						navigator.notification.alert(appRequiresWiFi, function() {});	
					}
				});
			
			}
		}
		
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
	navigator.notification.alert("For now default Role = Production.", function() {});
}

function getLogTimeListOfOrder(data){
	showModal();
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
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
			$('#logTimeHistoryDiv').html('');
			
			var logTimeDiv ='<div id="logTimeDiv" class="log-time-entry-div logTimeDiv1 text-align-center">'+
									'<div class="process-name">'+appRequiresWiFi+'.</div>'+
							'</div>';
			$('#logTimeHistoryDiv').append(logTimeDiv);
			
			hideModal();
	   		$.mobile.changePage('#view-log-time-history','slide');
	   		
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			
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
	
	var connectionType=checkConnection();
	//var connectionType="WiFi connection";//For Testing
	
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
		
		var currtimetrackerid = window.localStorage.getItem("trackerkey");
		var updateQuery="UPDATE TIMETRACKER SET soTimeId='"+dataObj.grn_salesorderTime_id+"' ,date='"+dataObj.date+"' ,time='"+time+"' ,crewSize='"+dataObj.crew_size+"' ,grnStaffTimeId='"+dataObj.grn_staffTime_id+"' ,timecat='"+dataObj.grn_timeCat+"' ,comment='"+dataObj.comments+"' ,localStatus='complete' WHERE id=' "+currtimetrackerid+" '";
		alert("updateQuery.."+updateQuery);
		var result=addUpadteLogTime(dataObj,updateQuery);
		if(result=="appSave" || connectionType=="No network connection"){
			resetTracker();
		}else{
			
		}	
	}
	else{
		logout();
		navigator.notification.alert("Please login again.", function() {});
	}
}

function addUpadteLogTime(dataObj,updateQuery){
	//showModal();
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	var connectionType=checkConnection();
	//var connectionType="WiFi connection";//For Testing
	
	//if(connectionType=="Unknown connection" || connectionType=="No network connection"){
		
	    var currtimetrackerid = window.localStorage.getItem("trackerkey");
	    if(currtimetrackerid!=''){
	    	var timeTracked=$('#logging_time').text();
	    	db.transaction(function(tx) {
	    		tx.executeSql(updateQuery);
	    	});
	    	
	    	//window.localStorage.removeItem("trackerkey");
	    	window.localStorage["trackerkey"] = '';
	    	$.mobile.changePage('#view-all-sales-order','slide');
	    	navigator.notification.alert("Time Tracker Data Saved in App", function() {});
	    	return "appSave";
	    }else{
	    	navigator.notification.alert("No proper data", function() {});
	    	return "false";
	    }
	//}
}

/*
function addUpadteLogTime(dataObj){
	showModal();
	
	//var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	var connectionType=checkConnection();
	//var connectionType="WiFi connection";//For Testing
	
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
*/
function closeSalesOrder(dataObj){
	showModal();
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"}; // Testing Data
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"permissions":"7"};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		var salesorderId='#'+$(dataObj).data('order');
		salesorderId=salesorderId.replace("#","");
		var salesId=$(dataObj).data('id');
		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
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
		
		var connectionType=checkConnection();
		//var connectionType="WiFi connection";//For Testing
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert(appRequiresWiFi, function() {});
		}
		else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
			
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
		var timeArr = timeDuration.split(':'); // split it at the colons
		var currentLoggedMinutes;
		//var currentLoggedMinutes = (+timeArr[0]) * 60 + (+timeArr[1]);
		
		if(timeArr.length==2){
			currentLoggedMinutes = (+timeArr[0]);
		}
		else if(timeArr.length==3){
			currentLoggedMinutes = (+timeArr[0]) * 60 + (+timeArr[1]); 
		}
		alert(timeDuration+"....timeDuration.."+"timeArr.length--"+timeArr.length+"currentLoggedMinutes..."+currentLoggedMinutes);
		
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
		var timeArr = timeDuration.split(':'); // split it at the colons
		
		var currentLoggedMinutes;
		//var currentLoggedMinutes = (+timeArr[0]) * 60 + (+timeArr[1]);
		
		if(timeArr.length==2){
			currentLoggedMinutes = (+timeArr[0]);
		}
		else if(timeArr.length==3){
			currentLoggedMinutes = (+timeArr[0]) * 60 + (+timeArr[1]); 
		}
		alert(timeDuration+"....timeDuration.."+"timeArr.length--"+timeArr.length+"currentLoggedMinutes..."+currentLoggedMinutes);
		
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
        
        var currtimetrackerid; 
    	db.transaction(function(tx) {
    		//	tx.executeSql('CREATE TABLE IF NOT EXISTS TIMETRACKER (id integer primary key autoincrement,soTimeId integer,date text,time text,crewSize integer,grnStaffTimeId integer,timecat text,comment text )');
    		//soTimeId integer,date text,time text,crewSize integer,grnStaffTimeId integer,timecat text,comment text
    		tx.executeSql('INSERT INTO TIMETRACKER(soTimeId,date,time,crewSize,grnStaffTimeId,timecat,comment,localStatus) VALUES (?,?,?,?,?,?,?,?)'
    				,[0,getTodayDate().toString(),"0 sec",0,0,"prod_","comments test","start"]
    			,function(tx, results){
    					//alert('Returned ID: ' + results.insertId);
    					currTimeTrackerId=results.insertId;
    					window.localStorage["trackerkey"] = currTimeTrackerId;
    			 }
    		);
    	});
}

function pauseTimer() {
	var timeTracked=$('#logging_time').text();
	$('#logging_time').timer('pause');
    //take current time
	
	$('#timer_' + order + '_' + timecat).removeClass('play').addClass('pause').attr('data-action', 'resume');
	$('#timer_img_' + order + '_' + timecat).removeClass('play').addClass('pause').attr('data-action', 'resume');
    
    $('#logging_pause').hide();
    $('#logging_play').show().attr('data-action', 'resume');;
    
    //var timeTracked=$('#logging_time').text();
    var currtimetrackerid = window.localStorage.getItem("trackerkey");
	db.transaction(function(tx) {
		//alert(currtimetrackerid+"----"+timeTracked);
		tx.executeSql("UPDATE TIMETRACKER SET time='" + timeTracked + "',localStatus='pause'  WHERE id=' "+currtimetrackerid+" '");
	});
	//window.localStorage["trackerkey"] = '';
	//window.localStorage.removeItem("trackerkey");
	
	/*var connectionType=checkConnection();
	//var connectionType="Unknown connection";//For Testing
	if(connectionType=="Unknown connection" || connectionType=="No network connection"){
	}
	else if(connectionType=="WiFi connection" || connectionType=="Cell 4G connection" || connectionType=="Cell 3G connection" || connectionType=="Cell 2G connection"){
	}*/
	
}

function resumeTimer() {
	
	$('#logging_time').timer('remove');
	var currtimetrackerid = window.localStorage.getItem("trackerkey");
	var seconds=0;
	var tempData;
	var time='00:00 min' ; //='01:01 min' ;
	db.transaction
	  (
	       function (tx){
	            tx.executeSql
	            (
	                'SELECT time FROM TIMETRACKER WHERE id=?',[currtimetrackerid],function(tx,results){
	                    var len = results.rows.length;
	                    if(len>0){
	                        alert(results.rows.item(0)['time']);
	                    	time=results.rows.item(0)['time'];
	                    	
	                    	time=getCorrectTimeForTimerData(time);
	                    	var timeArr = time.split(':'); // split it at the colons
	                    	if(timeArr.length==2){
	                    		seconds = (+timeArr[0]) * 60  + (+timeArr[1]); 
	                    	}
	                    	else if(timeArr.length==3){
	                    		seconds = (+timeArr[0]) * 60 * 60 + (+timeArr[1]) * 60  + (+timeArr[2]); ; 
	                    	}
	                    	alert(time+"....time"+"timeArr.length--"+timeArr.length+"seconds..."+seconds);
	                    	
	                        $('#logging_time').timer({
	                            seconds: seconds
	                        });
	                        // $('[id="a"]');
	                        $('#timer_' + order + '_' + timecat).removeClass('pause').addClass('play').attr('data-action', 'logpauseOption');
	                        $('#timer_img_' + order + '_' + timecat).removeClass('pause').addClass('play').attr('data-action', 'logpauseOption');
	                        
	                        $('#logging_pause').show();
	                        $('#logging_play').hide();
	                    	
	                    }
	                }, errorCB
	            );
	       },errorCB,successCB
	   );
    
}

function logtimeTimer() {
    //$('#logtime_popup #so_process_name').html(timecat + '&nbsp;&nbsp;<img src="img/' + timecat + '.png" width="25px" />');
   
    var order_name = $('#sp_order_name_' + order).text();
    var currDataHexcolorVal = $('#sp_order_name_' + order).find('.so-color-box').css('background-color');
    
	var $so_name_box = $('#addLogTimeContent').find('.so-details-box');
	$so_name_box.css('border-color',currDataHexcolorVal);
	$so_name_box.find('.so-color-box').css('background-color',currDataHexcolorVal);
	$so_name_box.find(".so-name-box").html(order_name);
	
	var id="";
	//$('#is_revision').attr('data-timecat', timecat);
	var soTimeId=order;// done
	var date=date;// done
	var time = $('#logging_time').text()// done
	//// calll
	time=getCorrectTimeForTimerData(time);
	alert(time+"....time");
	
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
	
	//alert(window.localStorage.getItem("trackerValueSave"));
	$.mobile.changePage('#add-log-time','slide');	
}

function getCorrectTimeForTimerData(time) {
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
	return time;
}


function deleteTimer() {
	var currtimetrackerid = window.localStorage.getItem("trackerkey");
	//alert("currtimetrackerid..."+currtimetrackerid);
	db.transaction(function(tx) {
		//alert(currtimetrackerid+"----"+timeTracked);
		tx.executeSql("DELETE FROM TIMETRACKER WHERE id=' "+currtimetrackerid+" '");
	});
	//window.localStorage.removeItem("trackerkey");
	window.localStorage["trackerkey"] = '';
	resetTracker();
}

function resetTracker() {
    $('#logging_time').timer('remove');
    $('#logging_time').html('00:00');
    $('#timer_' + order + '_' + timecat).removeClass('pause').removeClass('play').addClass('clock').attr('data-action', 'clock');
    $('#timer_img_' + order + '_' + timecat).removeClass('pause').removeClass('play').attr('data-action', 'clock');
    
    $('#running_tracker').hide();
    $('#logging_pause').hide();
    $('#logging_play').show();
    
    TimerFlag = 0;
    order = 0;
    timecat = 0;
    timerId = 0;
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

/* ************* Database Code Starts   -------------------------  */

// Open Database
function openDatabase() {
   db.transaction(initializeDB, errorCB, successCB);
}

//Close Database
function closeDatabase() {
}

//Populate the database 
function initializeDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS SALESORDER (id integer primary key autoincrement,pid integer,grn_companies_id integer,sp_manager text,sp_salesorderNumber integer,sp_jobName text,grn_colors_id integer,HexColor text )');
	
	tx.executeSql('CREATE TABLE IF NOT EXISTS TIMECATEGORY (id integer primary key autoincrement,pid integer,timeCats text,title text,spjobname text,grnrolesid integer,revision integer,status integer)');
	
	tx.executeSql('CREATE TABLE IF NOT EXISTS TIMETRACKER (id integer primary key autoincrement,soTimeId integer,date text,time text,crewSize integer,grnStaffTimeId integer,timecat text,comment text,localStatus text  )');
}

//Transaction success callback
function successCB() {
	alert('db transcation success');
}

//Transaction error callback
function errorCB(err) {
	alert("Error processing SQL: "+err.code);
	//console.log("Error processing SQL: "+err.code);
}

function deleteTimeTrackerRow(id){
	db.transaction(function(tx) {
		alert("deleteTimeTrackerRow..."+id);
		var deleteTTQuery="DELETE FROM TIMETRACKER WHERE id=' "+id+" '";
		tx.executeSql(deleteTTQuery, successDB, errorCB);
		//ctx.executeSql('DELETE FROM TIMETRACKER WHERE id =?', [ currid ],errorCB);
	});
	
	
	/*db.transaction(function deleteRow(tx) {
		  tx.executeSql('DELETE FROM TIMETRACKER WHERE id = ' + id, [], successDB, errorCB);
	}, errorCB);
	
	db.transaction
	  (
	       function (tx){
	            tx.executeSql
	            (
	                'DELETE FROM TIMETRACKER WHERE id=?',[id], errorCB
	            );
	       },errorCB,successCB
	   );*/
}

function insertTimeCategory(tx) {
	var timeCategoryCreateSql ='CREATE TABLE IF NOT EXISTS TIMECATEGORY (id integer primary key autoincrement,pid integer,timeCats text,title text,spjobname text,grnrolesid integer,revision integer,status integer )';
	
	tx.executeSql(timeCategoryCreateSql,[], function (tx, results) {
       
   	     jQuery.each(time_cats_arr, function(index,value) {
   	    	var jsonObj=value;
   	    	var id=jsonObj["id"];
   	    	var timeCats=jsonObj["timeCats"];
   	    	var title=jsonObj["title"];
   	    	var spJobName=jsonObj["sp_jobName"];
   	    	var grnRolesId=jsonObj["grn_roles_id"];
   	    	var revision=jsonObj["revision"];
   	    	var status=jsonObj["status"];
   	    	
   	    	tx.executeSql('INSERT INTO TIMECATEGORY(pid, timeCats, title, spjobname, grnrolesid, revision, status) VALUES (?,?,?,?,?,?,?)',
   	    			[id,timeCats,title,spJobName,grnRolesId,revision,status], function(tx, res) {
	   	         //alert("insertId: " + res.insertId + " -- res.rowsAffected 1"+res.rowsAffected);
  	    	});
   		});
   	  window.localStorage["tclocal"]=1;
   	  alert("timeCategoryCreateSql");
    });
}

function insertSalesOrder(tx) {
	var insertSalesOrderSql = 'CREATE TABLE IF NOT EXISTS SALESORDER (id integer primary key autoincrement,pid integer,grn_companies_id integer,sp_manager text,sp_salesorderNumber integer,sp_jobName text,grn_colors_id integer,HexColor text )';
		
	tx.executeSql(insertSalesOrderSql,[], function (tx, results) {
       
   		jQuery.each(salse_orders_arr, function(index,value) {
        	var jsonObj=value;
        	var id=parseInt(jsonObj["id"]);
        	var grn_companies_id=parseInt( jsonObj["grn_companies_id"]);
        	var sp_manager=jsonObj["sp_manager"];
        	var sp_salesorderNumber= parseInt( jsonObj["sp_salesorderNumber"] );
        	var sp_jobName=jsonObj["sp_jobName"];
        	var grn_colors_id=parseInt( jsonObj["grn_colors_id"] );
        	//var time_running_status=jsonObj["time_running_status"];
        	//var grn_status_id=jsonObj["grn_status_id"];
        	var HexColor=jsonObj["HexColor"];
        	//var tbodyObjCurr = tbodyObj.replace("spOrderIdReplace", id);
        	var tbodyObjCurr = tbodyObj.replace(/spOrderIdReplace/g,id);
   	    	
   	    	tx.executeSql('INSERT INTO SALESORDER(pid,grn_companies_id,sp_manager,sp_salesorderNumber,sp_jobName,grn_colors_id,HexColor) VALUES (?,?,?,?,?,?,?)',
   	    			[id,grn_companies_id,sp_manager,sp_salesorderNumber,sp_jobName,grn_colors_id,HexColor], function(tx, res) {
	   	         	//alert("insertId: " + res.insertId + " -- res.rowsAffected 1"+res.rowsAffected);
  	    	});
   		});
   		//alert("insertSalesOrderSql");
   		window.localStorage["solocal"] = 1;
    });
}

//Single row
function getSingleRow(id){
  db.transaction
  (
       function (tx){
            tx.executeSql
            (
                'SELECT timeCats FROM TIMECATEGORY WHERE id=?',[id],function(tx,results){
                    var len = results.rows.length;
                    if(len>0){
                        //alert(results.rows.item(0)['timeCats']);
                    }
                }, errorCB
            );
       },errorCB,successCB
   );
}

//Multiple records
function getTimeCategoryList(){
  db.transaction
  (
       function (tx){
            tx.executeSql('SELECT timeCats,pid FROM TIMECATEGORY',[],function(tx,results){
                    var len = results.rows.length;
                    if(len>0){
                        for (var i = 0; i < len; i++) {
                            //alert(results.rows.item(i)['timeCats']);
                            //$('#resultList').append('<li><a href="#">' + results.rows.item(i)['timeCats']+ results.rows.item(i)['pid'] + '</a></li>');
                        }
                        //$('#resultList').listview();
                    }
                }, errorCB
            );
       },errorCB,successCB
   );
}
       
 //Multiple Sales Order
   function getSalesOrderList(){
     db.transaction
     (
          function (tx){
               tx.executeSql('SELECT pid,grn_companies_id,sp_manager,sp_salesorderNumber,sp_jobName,grn_colors_id,HexColor FROM SALESORDER',[],function(tx,results){
                       var len = results.rows.length;
                       salse_orders_arr=[];
                       if(len>0){
                    	   
                           for (var i = 0; i < len; i++) {
                               //alert(results.rows.item(i)['pid']);
	                           	var jsonObj={};
	                           	jsonObj["id"]=results.rows.item(i)["pid"];
	                           	jsonObj["grn_companies_id"]=results.rows.item(i)["grn_companies_id"];
	                           	jsonObj["sp_manager"]=results.rows.item(i)["sp_manager"];
	                           	jsonObj["sp_salesorderNumber"]=results.rows.item(i)["sp_salesorderNumber"];
	                           	jsonObj["sp_jobName"]=results.rows.item(i)["sp_jobName"];
	                           	jsonObj["grn_colors_id"]=results.rows.item(i)["grn_colors_id"];
	                           	jsonObj["HexColor"]=results.rows.item(i)["HexColor"];
	                           	salse_orders_arr.push(jsonObj);
                           }
                           //alert("sales order tabel list count "+len+"---"+salse_orders_arr.length);
                       }
                   }, errorCB
               );
          },errorCB,successCB
      );
   }

function getTimeTrackerList(){
  db.transaction
  (
       function (tx){
            tx.executeSql('SELECT localStatus,time FROM TIMETRACKER',[],function(tx,results){
                    var len = results.rows.length;
                    if(len>0){
                        for (var i = 0; i < len; i++) {
                            //alert(results.rows.item(i)['timeCats']);
                            $('#resultList').append('<li><a href="#">' + results.rows.item(i)['localStatus']+"--"+ results.rows.item(i)['time'] + '</a></li>');
                        }
                        $('#resultList').listview();
                    }
                }, errorCB
            );
       },errorCB,successCB
   );
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

function insertTrackerValue() {
	
	var currtimetrackerid; 
	db.transaction(function(tx) {
		//	tx.executeSql('CREATE TABLE IF NOT EXISTS TIMETRACKER (id integer primary key autoincrement,soTimeId integer,date text,time text,crewSize integer,grnStaffTimeId integer,timecat text,comment text )');
		//soTimeId integer,date text,time text,crewSize integer,grnStaffTimeId integer,timecat text,comment text
		tx.executeSql('INSERT INTO TIMETRACKER(soTimeId,date,time,crewSize,grnStaffTimeId,timecat,comment,localStatus) VALUES (?,?)'
				,[1,getTodayDate().toString(),"01:06",5,,"prod_","comments test"]
			,function(tx, results){
					//alert('Returned ID: ' + results.insertId);
					currTimeTrackerId=results.insertId;
					window.localStorage.setItem("trackerkey", ""+currTimeTrackerId+"");
			 }
		);
	});
} 

function stopTracker() {
	var timeTracked=$('#timeTrackerDiv').data('seconds');
	
	var currtimetrackerid = window.localStorage.getItem("trackerkey");
	db.transaction(function(tx) {
		tx.executeSql("UPDATE TIMETRACKER SET time='" + timeTracked + "' WHERE id=' "+currtimetrackerid+" '");
	});
	//window.localStorage.removeItem("trackerkey");
	window.localStorage["trackerkey"] = '';
}
