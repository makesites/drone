var http = require('http'),
	https = require('https'),
	httpProxy = require('http-proxy')
	config = require('../config/drone'),
	hosts = require('./hosts'),
	vhosts = require('./vhosts'),
	servers = {};

// - max number of concurrent socket connections - per domain
//httpProxy.setMaxSockets(config.sockets.max);

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
if( config.ports.ssl ){
	servers.https = httpProxy.createServer( hosts.ssl() );
	// - websockets

}
//
// Internal Router
servers.router = http.createServer();
//

// export server object
module.exports = servers;


