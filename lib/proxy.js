// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	httpProxy = require('http-proxy')
	drone_config = require('../config/drone'),
	hosts = require('./hosts'),
	vhosts = require('./vhosts'),
	servers = {};


// - max number of concurrent socket connections - per domain
//httpProxy.setMaxSockets(drone_config.sockets.max);

//
// Create an instance of node-http-proxy
//
var proxy = new httpProxy.createProxyServer({
	target: {
		host: '127.0.0.1',
		port: drone_config.ports.router
	}
});
//
// Server
//
//
// - regular requests
servers.http = http.createServer(function (req, res) {
	//
	// forward to the router
	//
	proxy.web(req, res);
	// - websockets
	servers.http.on('upgrade', forwardSocket);
});

// Initialization
hosts.setup();
//
// Create a standalone HTTPS proxy server
//
if( drone_config.ports.ssl ){
	servers.https = httpProxy.createServer( hosts.ssl() );
	// - websockets
	servers.https.on('upgrade', forwardSocket);
}
//
// vhost are setup last as they affect the global namespace...
vhosts.setup();


// Router
servers.router = http.createServer( proxyRequest );
// - websockets
servers.router.on('upgrade', proxySocket);

//
// Proxies
//
function proxyRequest(req, res) {

	var host = req.headers.host || false;
	// don't continue if there is no host
	if( !host ) return res.end();

	// get the port for the requested host
	var target = hosts.find( host );
	//
	proxy.web(req, res, target);

}

function proxySocket(req, socket, head) {

	var host = req.headers.host || false;
	// don't continue if there is no host
	if( !host ) return res.end();

	// get the port for the requested host
	var target = hosts.find( host );
	//
	proxy.ws(req, socket, head, target);

}

function forwardSocket(req, socket, head) {
	//
	// forward to the router
	//
	proxy.ws(req, socket, head);
}


// export server object
module.exports = servers;
