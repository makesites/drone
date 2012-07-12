// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'), 
	express = require('express'), 
	config = require('./config/routes');

// initialization
setupExpress();
setupSSL();

//
// Create an instance of node-http-proxy
//
var proxy = new httpProxy.HttpProxy({
  target: {
    host: 'localhost',
    port: 8000
  }
});

// create a proxy for all the direct routes
httpProxy.createServer( config.routes ).listen( config.proxy.port );


httpProxy.createServer(function (req, res, proxy) {
	//
	// Put your custom server logic here
	//
	// Example: 
	// A simple round-robin load balancing strategy.
	// 
	// if (ips instanceof Array) {
	// var target = loadBalance(ips);
	// proxy.proxyRequest(req, res,  target);
	// 
	//} else {	
	//}
	// 
	
	// check if this is an express server
	var domains = config.express.domains;
    var host = req.header('host');
    var port = (domains.indexOf(host) > -1) ? config.express.port : config.proxy.port;
	
	proxy.proxyRequest(req, res, {
		host: host,
		port: port
	});
	
}).listen(8000);

var server = http.createServer(function (req, res) {
  //
  // Proxy normal HTTP requests
  //
  proxy.proxyRequest(req, res);
});

server.on('upgrade', function(req, socket, head) {
  //
  // Proxy websocket requests too
  //
  proxy.proxyWebSocketRequest(req, socket, head);
});



// Helpers
// - create express servers
function setupExpress(){ 
	
	var domains = config.express.domains;
	var path = config.paths.www;
	
	// initiate the express server only if there are domains using it
	if( domains.length ){ 
		express.createServer();
		for(name in domains){
			express.use(express.vhost( domains[name], require( path + domains[name]).app ) );
		}
		express.listen( config.express.port );
	}
}

// - Create SSL ports
function setupSSL(){ 
	var ssl = config.ssl;
	
	for(site in ssl){ 
		if( typeof(ssl[site].credentials) != "undefined"){ 
		
		https.createServer(ssl[site].credentials, function (req, res) {
			// redirect all requests back to port 80 (with no ssl)
			proxy.proxyRequest(req, res, {
				host: ssl[site].domains,
				port: config.proxy.port
			});
			
		}).listen(ssl[site].port);
		
		}
	}
}


// - Simple round robin function...
function loadBalance( addresses ){
	// 
	// First, list the servers you want to use in your rotation.
	// this is an example, pass your address list through routes config
	//
	var addresses = [
	  {
		host: '123.456.7.01',
		port: 4001
	  },
	  {
		host: '123.456.7.02',
		port: 4002
	  }
	];
	//
	// On each request, get the first location from the list...
	//
	var target = addresses.shift();
	//
	// ...and then the server you just used becomes the last item in the list.
	//
	addresses.push(target);
	//
	// ...then proxy to the server whose 'turn' it is...
	//
	return target;
	
}


//
// Create the target HTTPS server for both cases
//
module.exports = server; 
