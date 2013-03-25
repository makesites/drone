//
var config = require( __dirname +'/config/drone'), 
	drone = require('./index'); 
	
// Listen on activated ports
if( drone.http ){
	drone.http.listen(config.ports.http); 
} 
if( drone.https ){
	drone.https.listen(config.ports.ssl); 
}

//server.listen(config.port); 
