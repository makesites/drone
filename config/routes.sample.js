var fs = require('fs');
// all php / html sites use nginx, that's listening to port 3000
// 
// Conventions: 
// - regular website ports range 4000-6000
// - ssl ports take up the range 6000-8000
module.exports = {
	proxy : { 
		port : 8001
	}, 
	
	paths : {
		www : "/var/www/"
	}, 
	
	routes : {
		hostnameOnly: true,
		router: {
			"yourdomain.com" : "127.0.0.1:3000"
		}
	}, 
	
	express : { 
		port : 4000,
		domains : [
			"hostname1.com", 
			"hostname2.com"
		]
	}, 
	
	ssl: {
		domain: "yourdomain.com", 
		port: 6001, 
		credentials: {  
			key: fs.readFileSync('path/to/your/key.pem', 'utf8'),
			cert: fs.readFileSync('path/to/your/cert.pem', 'utf8')
		}
	}

 }
