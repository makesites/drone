var fs = require('fs');
// Notes: 
// - all php / html sites use nginx, that's listening to port 3000
module.exports = {
	paths : {
			www : "/var/www/",
			//hosts : __dirname +"/hosts.json",
			//ssl : __dirname +"/ssl.json"
	},
	ports : {
			proxy 		: "8000",
			router 		: "8001",
			express 	: "8002",
			nginx 		: "3000"
	},
	routes : {
		hostnameOnly: false,
		router: {
			//"localhost" : "127.0.0.1:80"
			}
	}, 
	
	hosts : {
			express : [
			//		"hostname1.com", 
			//		"hostname2.com"
			],
			nginx : [
			//		"yourdomain.com"
			]
	},

	ssl: {}

 }
