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

	ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-RC4-SHA:ECDHE-ECDSA-RC4-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:DHE-DSS-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA256:ECDH-RSA-AES256-GCM-SHA384:ECDH-ECDSA-AES256-GCM-SHA384:ECDH-RSA-AES256-SHA384:ECDH-ECDSA-AES256-SHA384:AES256-GCM-SHA384:AES128-GCM-SHA256:RC4-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK',

	sockets: {
		max : 1000
	},

	proxy: {
		xfwd: true // forward headers
	}

 }
