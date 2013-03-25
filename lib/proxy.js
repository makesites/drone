// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy')
	config = require('../config/drone'), 
	hosts = require('./hosts'),
	vhosts = require('./vhosts'),
	server = {};


// - max number of concurrent socket connections - per domain
httpProxy.setMaxSockets(config.sockets.max);

//
// Create an instance of node-http-proxy
//
var proxy = new (httpProxy.RoutingProxy)();
//
// Server
//
//
// - regular requests
server.http = http.createServer(function (req, res) {
	//
	// proxy to the router
	//
	proxy.proxyRequest(req, res, {
		host: '127.0.0.1',
		port: config.ports.router
	});
});

// Initialization
hosts.setup();
//
// Create a standalone HTTPS proxy server
//
if( config.ports.ssl ){
	server.https = httpProxy.createServer( hosts.ssl() );
}
// 
// vhost are setup last as they affect the global namespace...
vhosts.setup();


// Router
server.router = http.createServer( proxyRequest );
// - websockets
server.router.on('upgrade', proxySocket);

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
	proxy.proxyRequest(req, res, target);
	
}

function proxySocket(req, socket, head) {
	
	var host = req.headers.host || false;
    // don't continue if there is no host
  	if( !host ) return res.end();
  
	// get the port for the requested host
	var target = hosts.find( host );
	//
	proxy.proxyWebSocketRequest(req, socket, head, target);
	
}


// export server object
module.exports = server;