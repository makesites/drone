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
			http 			: "80",
			router 		: "8000",
			express 		: "8002",
			nginx 		: "3000",
			ssl 			: "443"
	},

	routes : {
		hostnameOnly: false,
		router: {
				"localhost" : "127.0.0.1:3000"
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

	ssl: [],

	sockets: {
		max : 1000
	},

	proxy: {
		xfwd: true // forward headers
	}

 }
