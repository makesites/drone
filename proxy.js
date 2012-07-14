// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'), 
	express = require('express'), 
	config = require('./config/drone');

// initialization
setupConfig();
setupRouter();
setupExpress();
setupSSL();


// create a proxy for all the direct routes
httpProxy.createServer( config.routes ).listen( config.ports.router );


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
	var domains = config.hosts.express;
    var host = req.header('host');
    var port = (domains.indexOf(host) > -1) ? config.ports.express : config.ports.router;
	
	proxy.proxyRequest(req, res, {
		host: host,
		port: port
	});
	
}).listen(config.ports.proxy);

//
// Create an instance of node-http-proxy
//
var proxy = new (httpProxy.RoutingProxy)();

var server = http.createServer(function (req, res) {
  //
  // Proxy normal HTTP requests
  //
  var host = req.header('host');
  
  proxy.proxyRequest(req, res, {
		host: host,
		port: config.ports.proxy
	});
});

server.on('upgrade', function(req, socket, head) {
  //
  // Proxy websocket requests too
  //
  proxy.proxyWebSocketRequest(req, socket, head);
});



// Helpers
// - Import config from external file(s)
function setupConfig(){
	if( typeof(config.paths.hosts) != "undefined" ){
		var hosts = JSON.parse( String( fs.readFileSync(config.paths.hosts, 'utf8') ) );
		// merge with existing (empty?) arrays
		config.hosts["express"] = config.hosts["express"].concat(hosts["express"]);
		config.hosts["nginx"] = config.hosts["nginx"].concat(hosts["nginx"]);
		// update routes (if available)
		if( typeof(hosts["route"]) != "undefined" ){
			for(i in hosts["route"]){
				config.routes.router[i] = hosts["route"][i];
			}
		}
	}
}

// - setup router options
function setupRouter(){
	//add nginx sites to the router
	var nginx = config.hosts.nginx;
	for(i in nginx){
		config.routes.router[ domains[i] ] = "127.0.0.1:"+ config.ports.nginx;
	}
}

// - create express server
function setupExpress(){ 
	
	var domains = config.hosts.express;
	var path = config.paths.www;
	// initiate the express server only if there are domains using it
	if( domains.length ){ 
		var server = express.createServer();
		for(name in domains){
			server.use(express.vhost( domains[name], require( path + domains[name]).app ) );
		}
		server.listen( config.ports.express );
	}
}

// - Create SSL ports
function setupSSL(){ 
	var ssl = config.ssl;
	
	for(site in ssl){ 
	
		if( typeof(ssl[site].credentials) != "undefined"){ 
		
		var key = fs.readFileSync( ssl[site].credentials.key, 'utf8');
		var cert = fs.readFileSync( ssl[site].credentials.cert, 'utf8');
		
		https.createServer(ssl[site].credentials, function (req, res) {
			// redirect all requests back to the proxy (with no ssl)
			proxy.proxyRequest(req, res, {
				host: ssl[site].domains,
				port: config.ports.proxy
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
	/*var addresses = [
	  {
		host: '123.456.7.01',
		port: 4001
	  },
	  {
		host: '123.456.7.02',
		port: 4002
	  }
	];*/
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
