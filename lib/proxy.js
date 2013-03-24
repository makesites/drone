// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy')
	config = require('../config/drone'), 
	hosts = require('./hosts'),
	vhosts = require('./vhosts');


// initialization
hosts.setup();
vhosts.setup();

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
var server = http.createServer( proxyRequest );
// - websockets
server.on('upgrade', proxySocket);
//
// Create a standalone HTTPS proxy server
//
httpProxy.createServer( hosts.ssl() ).listen( config.ports.ssl );

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


//
// Create the targets HTTPS server for both cases
//
module.exports = server; 