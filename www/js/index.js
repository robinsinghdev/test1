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
     
     /*
     jQuery.mobile.phonegapNavigationEnabled = true;
     jQuery.mobile.defaultDialogTransition = "pop";
     jQuery.mobile.defaultPageTransition = "none";
      
     jQuery.mobile.loader.prototype.options.text = "loading";
     jQuery.mobile.loader.prototype.options.textVisible = true;
     jQuery.mobile.loader.prototype.options.theme = "a";
     */
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
        // Start adding your code here....
		//app.receivedEvent('deviceready');
		/*
		var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
		db.transaction(initializeDB, errorCB, successCB);
		*/
        checkPreAuth();
		$("#loginForm").on("submit",handleLogin);
    },
	// Update DOM on a Received Event
    receivedEvent: function(id) {
		
    }
};



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

    alert('Connection type: ' + states[networkState]);
}
/*
function init() {
	document.addEventListener("deviceready", deviceReady, true);
	delete init;
}
*/
    
function checkPreAuth() {
	alert('checkPreAuth starts: ');
	var form = $("#loginForm");
	if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
		$("#username", form).val(window.localStorage["username"]);
		$("#password", form).val(window.localStorage["password"]);
		handleLogin();
	}
	alert('checkPreAuth ends: ');
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
	var u='support@dynaread.com';
	var p='marbleF16XS';
	if(u != '' && p!= '') {
		
		$.ajax({
			type : 'POST',
		   url:'http://dev.bpmetrics.com/grn/m_app/',
		   data:{action:'userLogin',email:u,password:p,check:'1'},
		   //dataType: 'json',
		   //contentType: "application/json; charset=utf-8",		   
		   success:function(data,t,f){
			var responseJson = $.parseJSON(data);
			var jsonString = JSON.stringify(responseJson);
			alert(jsonString);
			if(responseJson.status == "success" ){
				var grnUser=responseJson.grn_user;
				
				window.localStorage["username"] = u;
				window.localStorage["password"] = p;
				
				window.localStorage["ID"] = grnUser["ID"];
				window.localStorage["grn_companies_id"] = grnUser["grn_companies_id"];
				window.localStorage["full_name"] = grnUser["full_name"];
				window.localStorage["nickname"] = grnUser["nickname"];
				window.localStorage["grn_roles_id"] = grnUser["grn_roles_id"];
				window.localStorage["permissions"] = grnUser["permissions"];
				
				window.localStorage["email"] = grnUser["email"];
				window.localStorage["lastActive"] = grnUser["lastActive"];
				
				alert(window.localStorage.getItem("username")+"---------"+window.localStorage.getItem("full_name"));
				//$.mobile.changePage("../account/home-page.html", { transition: "slide" });
				$.mobile.changePage('#home-page','slide');
			}else{
				navigator.notification.alert("Invalid Credentials, please try again", function() {});
			}
			
		   },
		   error:function(data,t,f){
			 var responseJson = $.parseJSON(data);
			 //alert(w+' '+t+' '+f);
			 console.log(data+' '+t+' '+f);
			 alert(JSON.stringify(data));
			 alert(responseJson.status);
			 if(data.status==404){
				 
			 }
			 navigator.notification.alert("Please check your connection or try again after sometime.", function() {});
		   }
		});
			
		//$("#submitButton").removeAttr("disabled");
	
	} else {
		navigator.notification.alert("You must enter a username and password", function() {});
		$("#submitButton").removeAttr("disabled");
	}
	
	return false;
}

function checkSession(){
	alert('checkSession called');
	$.ajax({
		url:'http://dev.bpmetrics.com/grn/m_app/test.php',
				cache : false,
				type : 'POST',//While GET working
				async: false,
				data:{action:'userLogin',email:u,password:p,check:'1'},
				dataType: 'json',
				contentType: "application/json; charset=utf-8",	
				success:function(data){
				
				   alert(data);
				   console.log(data);
				   var responseJson = $.parseJSON(data);
				   var jsonString = JSON.stringify(responseJson);
				   console.log(jsonString);
				   alert(jsonString);
				   alert(responseJson["status"]);
				},
				error:function(w,t,f){
				   alert(w+' '+t+' '+f);
				   console.log(w+' '+t+' '+f);
				   //alert(w+' '+t+' '+f);
				
				   //var responseJson = $.parseJSON(data);
				   var jsonString = JSON.stringify(w);
				   
				   
//				   console.log(JSON.stringify(w));
//				   console.log(JSON.stringify(t));
//				   console.log(JSON.stringify(f));
				}
		});
}

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
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
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
	
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
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
   var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
   db.transaction(initializeDB, errorCB, successCB);
} 

function GetValueToDB() {
   //alert('Databases are nowwww supported in this browser.');
   var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
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
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.transaction(queryDB, errorCB);
}

function successCBData() {
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.transaction(queryDBData, errorCB);
}
