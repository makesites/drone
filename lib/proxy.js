// proxy.js
// - parses the routes config and redirects traffic to the appropriate location
var httpProxy = require('http-proxy')
	drone_config = require('../config/drone'),
	hosts = require('./hosts'),
	servers = require("./servers");

// - max number of concurrent socket connections - per domain
//httpProxy.setMaxSockets(drone_config.sockets.max);
//
// Create an instance of node-http-proxy
//
var proxy = new httpProxy.createProxyServer( drone_config.proxy );

// should the host file automatically setup?
hosts.setup();

//
// Proxies
//
function proxyRequest(req, res) {

	var host = req.headers.host || false;
	// don't continue if there is no host
	if( !host ) return res.end();

	// get the port for the requested host
	var target = hosts.find( host );
	// FIX: http-proxy seems to work better with addresses (for now)
	target = "http://localhost:"+target.port;
	proxy.web(req, res, { target: target });

}

function proxyToRouter(req, res) {
	//
	// forward to the router
	//
	proxy.web(req, res, {
		target: {
			host: '127.0.0.1',
			port: drone_config.ports.router
		}
	});

}

function proxySocket(req, socket, head) {

	var host = req.headers.host || false;
	// don't continue if there is no host
	if( !host ) return res.end();

	// get the port for the requested host
	var target = hosts.find( host );
	// FIX: http-proxy seems to work better with addresses (for now)
	target = "http://localhost:"+target.port;
	proxy.ws(req, socket, head, { target: target });

}

function forwardSocket(req, socket, head) {
	//
	// forward to the router
	//
	proxy.ws(req, socket, head, {
		target: {
			host: '127.0.0.1',
			port: drone_config.ports.router
		}
	});
}


//
// Listeners
//
if( servers.http ){
	servers.http.on('request', proxyToRouter);
	servers.http.on('upgrade', forwardSocket);
	servers.http.listen(drone_config.ports.http);
}
if( servers.https ){
	servers.https.on('request', proxyToRouter);
	servers.https.on('upgrade', forwardSocket);
	servers.https.listen(drone_config.ports.ssl);
}
servers.router.on('request', proxyRequest);
servers.router.on('upgrade', proxySocket);
servers.router.listen(drone_config.ports.router);
