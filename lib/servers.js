var http = require('http'),
	https = require('https'),
	drone_config = require('../config/drone'),
	hosts = require('./hosts'),
	vhosts = require('./vhosts'),
	servers = {};

// Initialization
hosts.setup();
// vhost are setup last as they affect the global namespace...
vhosts.setup();

//
// Public Servers
//
// - regular requests
servers.http = http.createServer();
//
// Create a standalone HTTPS proxy server
//
if( drone_config.ports.ssl ){
	servers.https = https.createServer( hosts.ssl() );
	// - websockets

}
//
// Internal Router
servers.router = http.createServer();
//

// export server object
module.exports = servers;


