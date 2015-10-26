/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
	//alert('handle login called');
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
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:'https://dev.bpmetrics.com/grn/m_app/',
			   //cache : false,
			   //async: false,
			   data:{action:'userLogin',email:u,password:p,check:'1'},
			   //dataType: 'json',
			   //contentType: "application/json; charset=utf-8",		   
			   success:function(data,t,f){
				//alert(data+' '+t+' '+f);
				console.log("Logging In...");
				var responseJson=jQuery.parseJSON(data);
				//var jsonString = JSON.stringify(data);
				//alert(jsonString);
				if(responseJson.status == "success" ){
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
					
					//alert(window.localStorage.getItem("username")+"---------"+window.localStorage.getItem("full_name"));
					//$.mobile.changePage("../account/home-page.html", { transition: "slide" });
					$.mobile.changePage('#home-page','slide');
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
					hideModal();
					navigator.notification.alert("Invalid Credentials, please try again", function() {});
				}
				
				$('#userFullName').html(window.localStorage.getItem("full_name"));
			   },
			   error:function(data,t,f){
				   hideModal();
				   navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
				 var responseJson = $.parseJSON(data);
				 alert(w+' '+t+' '+f);
				 console.log(data+' '+t+' '+f);
				 alert(JSON.stringify(data));
				 alert(responseJson.status);
				 if(responseJson.status==404){
					 navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
				 }
			   }
			});
		}
		else{
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
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
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"full_name":window.localStorage.getItem("full_name"),"nickname":window.localStorage.getItem("nickname"),"grn_roles_id":window.localStorage.getItem("grn_roles_id"),"permissions":"7","email":window.localStorage.getItem("email"),"lastActive":window.localStorage.getItem("lastActive")};
	var grnUserObj=JSON.stringify(grnUserData)
	
	if(grnUserObj != '') {
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
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
				   url:'https://dev.bpmetrics.com/grn/m_app/',
				   data:{action:'checkSOonSP',grn_user:grnUserObj,sp_salesorderNumber :sp_salesOrderNumber},
				   success:function(data){
				   		hideModal();
				   		var responseJson = $.parseJSON(data);
				   		//{"status":"success","soInfo":{"SO#":"192","Job":"Cheryl & Marvin Fisher"}}
				   		//alert(responseJson.soInfo);
				   		var $sp_details_div=$('#sp_details_div');
				   		if(responseJson.status=="success"){
				   			var soInfo=responseJson.soInfo;
					   		//alert(soInfo["SO#"]+"-----"+soInfo.Job);
					   		$sp_details_div.find('#sp_jobName').val(soInfo["Job"]);
					   		$sp_details_div.find('#chooseColorForSalesOrder').val(getRandomColor());
					   		
					   		$sp_details_div.show();
					   		//createNewSO(soInfo["Job"],soInfo["SO#"]);
					   		
					   		$('a#tryAgainBtn').removeClass('display-none');
					   		$('a#addNewSalesOrderBtn').removeClass('display-none');
					   		$('a#getSOBySONumberBtn').addClass('display-none');
					   		
					   		$(".sales-order-msg").html('');
				   		}
				   		else if(responseJson.status=="fail"){
				   			$sp_details_div.hide();
				   			//alert(responseJson.msg);
				   			$(".sales-order-msg").html(responseJson.msg);
				   		} 
					},
					error:function(data,t,f){
						hideModal();
						console.log(data+' '+t+' '+f);
						navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
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

function tryAgainSOBySONumber(){
	var $sp_details_div=$('#sp_details_div');
	$sp_details_div.hide();
	$('#sp_salesOrderNumber').val('');
	$sp_details_div.find('#sp_jobName').val('');
	$sp_details_div.find('#chooseColorForSalesOrder').val('');
	
	$sp_details_div.hide();
	$('a#tryAgainBtn').addClass('display-none');
	$('a#addNewSalesOrderBtn').addClass('display-none');
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
	//var grnUserObj=window.localStorage.getItem("grnUser");
	
	var grnUserData={"ID":"1","grn_companies_id":"1","permissions":"7"};
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"full_name":window.localStorage.getItem("full_name"),"nickname":window.localStorage.getItem("nickname"),"grn_roles_id":window.localStorage.getItem("grn_roles_id"),"permissions":"7","email":window.localStorage.getItem("email"),"lastActive":window.localStorage.getItem("lastActive")};
	var grnUserObj=JSON.stringify(grnUserData)
	
	if(grnUserObj != '') {
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
		}
		else if(connectionType=="WiFi connection"){
			var spJobName=$('#sp_jobName').val();
			var spSalesorderNumber=$('#sp_salesOrderNumber').val();
			var grn_colors_id=$('#chooseColorForSalesOrder').val(); 
			showModal();
			var grn_colors_id=getRandomColor();
			$.ajax({
				type : 'POST',
			   url:'https://dev.bpmetrics.com/grn/m_app/',
			   data:{action:'addSaleOrderTime',grn_user:grnUserObj,grn_colors_id :grn_colors_id,sp_jobName:spJobName,sp_salesorderNumber:spSalesorderNumber},
			   success:function(data){
			   		hideModal();
			   		var responseJson = $.parseJSON(data);
			   		//alert(responseJson.status);
			   		//alert(responseJson.msg);
			   		tryAgainSOBySONumber();
			   		$(".sales-order-msg").html(responseJson.msg);
			   		//$.mobile.changePage('#view-all-sales-order','slide');
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
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
	//var grnUserObj=window.localStorage.getItem("grnUser");
	
	var grnUserData={"ID":"1","grn_companies_id":"1","full_name":"Dynaread IT","nickname":"IT","grn_roles_id":"1,2,3,4,5,6,7,8,9,10","permissions":"7","email":"support@dynaread.com","lastActive":1444985408};
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"full_name":window.localStorage.getItem("full_name"),"nickname":window.localStorage.getItem("nickname"),"grn_roles_id":window.localStorage.getItem("grn_roles_id"),"permissions":"7","email":window.localStorage.getItem("email"),"lastActive":window.localStorage.getItem("lastActive")};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:'https://dev.bpmetrics.com/grn/m_app/',
			   data:{action:'getCompanyAvailableCategories',grn_user:grnUserObj},
			   success:function(data){
			   		hideModal();
			   		var responseJson = $.parseJSON(data);
			   		time_cats_arr=responseJson.time_cats;
			   		getSalesOrders();
				},
				error:function(data,t,f){
					hideModal();
					console.log(data+' '+t+' '+f);
					navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
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
	//var grnUserObj=window.localStorage.getItem("grnUser");
	
	var grnUserData={"ID":"1","grn_companies_id":"1","full_name":"Dynaread IT","nickname":"IT","grn_roles_id":"1,2,3,4,5,6,7,8,9,10","permissions":"7","email":"support@dynaread.com","lastActive":1444985408};
	//var grnUserData={"ID":window.localStorage.getItem("ID"),"grn_companies_id":window.localStorage.getItem("grn_companies_id"),"full_name":window.localStorage.getItem("full_name"),"nickname":window.localStorage.getItem("nickname"),"grn_roles_id":window.localStorage.getItem("grn_roles_id"),"permissions":"7","email":window.localStorage.getItem("email"),"lastActive":window.localStorage.getItem("lastActive")};
	var grnUserObj=JSON.stringify(grnUserData);
	
	if(grnUserObj != '') {
		
		//var connectionType=checkConnection();
		var connectionType="WiFi connection";
		
		if(connectionType=="Unknown connection" || connectionType=="No network connection"){
			navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
		}
		else if(connectionType=="WiFi connection"){
			showModal();
			$.ajax({
				type : 'POST',
			   url:'https://dev.bpmetrics.com/grn/m_app/',
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
					                         '<img class="icon-img" src="img/'+timeCats+'.png" id="timer_img_spOrderNoReplace_'+timeCats+'" data-order="1" data-timecat="'+timeCats+'" data-action="clock" onclick="logTimer(this);return false;">'+
					                     '</span>'+
					                 '</td>'+
					                 '<td>'+
					                     '<span id="orderId_spOrderNoReplace" class="timer">--:-- hrs</span>'+
					                 '</td>'+
					                 '<td class="order-t-icon">'+
					                     '<a class="timer timer-icon clock" id="timer_spOrderNoReplace_'+timeCats+'" data-icon="flat-time" data-order="1" data-timecat="'+timeCats+'" data-action="clock" onclick="logTimer(this);return false;">'+
										 ' &nbsp;<img class="icon-img" src="img/icon-clock.png" >'+
										 '</a>'+
					                 '</td>'+
					             '</tr>';
			   		});
			   		tbodyObj+='</tbody>';
			   		
			   		var salse_orders_arr=responseJson.salse_orders;
			   		jQuery.each(salse_orders_arr, function(index,value) {
			        	var jsonObj=value;
			        	var id=jsonObj["id"];
			        	var grn_companies_id=jsonObj["grn_companies_id"];
			        	var sp_manager=jsonObj["sp_manager"];
			        	var sp_salesorderNumber=jsonObj["sp_salesorderNumber"];
			        	var sp_jobName=jsonObj["sp_jobName"];
			        	var grn_colors_id=jsonObj["grn_colors_id"];
			        	var time_running_status=jsonObj["time_running_status"];
			        	var grn_status_id=jsonObj["grn_status_id"];
			        	var HexColor=jsonObj["HexColor"];
			        	
			        	var tbodyObjCurr = tbodyObj.replace("spOrderNoReplace", sp_salesorderNumber);
			        	var divObj='<div id="sales-table-div_'+sp_salesorderNumber+'" class="sales-table-div">'+
				                		'<table id="sp_order_'+sp_salesorderNumber+'"  class="order-box ui-table" style="border: 1px solid #'+HexColor+';" data-role="table" data-mode="" class="ui-responsive table-stroke sales-table">'+
									     '<thead onclick="showHideTable(this);">'+
									         '<tr>'+
									             '<th style="background-color: #'+HexColor+';" class="sp-order " colspan="3" id="sp_order_name_'+sp_salesorderNumber+'">'+
									             		sp_jobName+' #'+sp_salesorderNumber+
									                 '<a href="#" onclick="getLogTimeListOfOrder(this); return false;" class="process-report pull-right" data-order="1">Report'+
									                 '</a>'+
									             '</th>'+
									         '</tr>'+
									     '</thead>'+
									     tbodyObjCurr+
									     '</tbody>'+
									     '<tfoot>'+
									         '<tr>'+
									             '<td colspan="3" class="td-danger"><a href="#" class="order-close"><span>CLOSE</span></a>'+
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
					navigator.notification.alert("Please check your connection or try again after sometime.", function() {});	
					alert(data+' '+t+' '+f);
					console.log(data+' '+t+' '+f);
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

function logTimer(){
	navigator.notification.alert("Time Tracker will be coming soon, we are working hard to give it to you as soon as possible.", function() {});
}

function getLogTimeListOfOrder(){
	navigator.notification.alert("Log Time Report will be coming soon, we are working hard to give it to you as soon as possible.", function() {});
}

function changeLoginRole(roleId){
	navigator.notification.alert("Change Login Role will be coming soon, we are working hard to give it to you as soon as possible.", function() {});
}


/* ----------------  Code Reusable -------------------------  */

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
   //$('#timeTrackerDiv').timer();
   $('#timeTrackerDiv').timer({
		seconds: 200 //Specify start time in seconds
	});
	
	var startTimerDiv = document.getElementById("startTimerDiv");
	startTimerDiv.setAttribute('style', 'display:none;');
	var endTimerDiv = document.getElementById("endTimerDiv");
	endTimerDiv.setAttribute('style', 'display:block;');
	
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
	
	var startTimerDiv = document.getElementById("startTimerDiv");
	startTimerDiv.setAttribute('style', 'display:block;');
	var endTimerDiv = document.getElementById("endTimerDiv");
	endTimerDiv.setAttribute('style', 'display:none;');
}
			
function AddValueToDB() {
   //alert('Databases are nowwww supported in this browser.');
   var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
   db.transaction(initializeDB, errorCB, successCB);
} 

function GetValueToDB() {
   //alert('Databases are nowwww supported in this browser.');
   var db = window.openDatabase("Database", "1.0", "Cordova Demo", 2000000);
   db.transaction(successCBData, errorCB);
} 

// Populate the database 
function initializeDB(tx) {
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
function queryDB(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function queryDBData(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccessData, errorCB);
}

// Query the success callback
function querySuccess(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	alert("Returned rows = " + results.rows.length);
	// this will be true since it was a select statement and so rowsAffected was 0
	if (!results.rowsAffected) {
		console.log('No rows affected!');
		return false;
	}
	// for an insert statement, this property will return the ID of the last inserted row
	console.log("Last inserted row ID = " + results.insertId);
}

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

