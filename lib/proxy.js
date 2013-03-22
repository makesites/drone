// proxy.js
// - parses the routes config and redirects traffic to the appropriate location

// libs
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'), 
	express = require('express'),
    crypto = require("crypto"), 
	config = require('../config/drone')
	ssl = { creds : {}, options : {} };

// set the dev flag based on the environment
var DEV = !(process.env.NODE_ENV == "production");

// initialization
setupConfig();
setupRouter();
setupExpress();
setupSSL();


//
// Create an instance of node-http-proxy
//
var proxy = new (httpProxy.RoutingProxy)();

// a proxy for all the direct routes ( host -> ip:port )
//httpProxy.createServer( config.routes ).listen( config.ports.router );
//
// create a standalone HTTPS proxy server
//
httpProxy.createServer( ssl.options ).listen( config.ports.ssl );

// main proxy logic
/*
httpProxy.createServer(function (req, res, proxy) {
	//
	// Proxy both HTTP & HTTPS requests
	//
	
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
	var routes = config.routes;
	var host = req.headers.host || false;
	var protocol = req.socket.encrypted ? 'https' : 'http';
	// #4 - Always redirect a www request 
	if (/^www/.test(host)){ 
		// remove www prefix
		host = host.replace(/^www\./, '');
		// 
		res.writeHead(301,
			{Location: protocol+ '://'+host + req.url });
		res.end();
	}
	
	//#14 FIX: removing port from host
	if(host.indexOf(":") > -1) host = host.substring(0, host.indexOf(":") );
	// get the 'naked' domain
	var domain = host;
	if (/^dev/.test(domain)){ 
		// include www here?
		domain = domain.replace(/^dev\./, '');
	}
	// #17 - check direct routes
	// pick the port 
	var port = ((domains.indexOf(domain) > -1) ? config.ports.express : config.ports.router) || false;
	// don't continue if there is no host/port
  	if( !host || !port ) return;
  
	proxy.proxyRequest(req, res, {
		host: host,
		port: port
	});
	
}).listen(config.ports.proxy);
*/



//
// Server
//
//
// - regular requests
var server = http.createServer( proxyRequest );
// - websockets
server.on('upgrade', proxySocket);

//
// Setup
//
// - Import config from external file(s)
function setupConfig(){
	// set config options
	// - max number of concurrent socket connections - per domain
	config.sockets || (config.sockets = {});
	if(config.sockets.max) httpProxy.setMaxSockets(config.sockets.max);
	// - read hosts file and add domains to the router
	if( typeof(config.paths.hosts) != "undefined" ){
		var hosts = JSON.parse( String( fs.readFileSync(config.paths.hosts, 'utf8') ) );
		// merge with existing (empty?) arrays
		config.hosts["express"] = config.hosts["express"].concat(hosts["express"]);
		config.hosts["nginx"] = config.hosts["nginx"].concat(hosts["nginx"]);
		// update routes (if available)
		if( typeof hosts["route"] != "undefined" ){
			for(i in hosts["route"]){
				config.routes.router[i] = hosts["route"][i];
			}
		}
	}
	
	// setup ssl
	if( typeof(config.paths.ssl) != "undefined" ){
		var ssl = JSON.parse( String( fs.readFileSync(config.paths.ssl, 'utf8') ) );
		// merge with existing (empty?) arrays
		config.ssl = config.ssl.concat(ssl);
	}
}

// - setup router options
function setupRouter(){
	//add nginx sites to the router
	var nginx = config.hosts.nginx;
	for(i in nginx){
		config.routes.router[ nginx[i] ] = "127.0.0.1:"+ config.ports.nginx;
	}
	// save the list of routing domains (nginx+router)
	config.hosts["router"] = Object.keys(config.routes.router);
	
}

// - create express server
function setupExpress(){ 
	
	var domains = config.hosts.express;
	var path = config.paths.www;
	// initiate the express server only if there are domains using it
	if( domains.length ){ 
		var server = express();
		for(name in domains){
			try{ 
				// #12 - supporting server object (as a fallback)
				var domain = domains[name];
				var site = require( path + domain );
				var exec = ( site.app ) ? site.app : site.server;
				// adding vhost
				server.use(express.vhost( domain, exec ) );
				// optionally add dev domains
				if( DEV ){ 
					server.use(express.vhost( "dev."+ domain, exec ) );
				}
				
			} catch( e ){
				// log event : console.log(e);
			}
		}
		server.listen( config.ports.express );
	}
}

// - Create SSL ports
function setupSSL(){ 
	// using the global ssl object...
	ssl.options = {
		https: {
			SNICallback: function(hostname){
				return ssl.creds[hostname];
			}
		},
  		hostnameOnly: true,
		router: {}
	};
	
	for(var host in config.ssl){ 
		var site = config.ssl[host];
		if( typeof site.credentials != "undefined" || typeof site.domain != "undefined"){ 
			
			var key = fs.readFileSync( site.credentials.key, 'utf8');
			var cert = fs.readFileSync( site.credentials.cert, 'utf8');
			
			ssl.options.router[site.domain] = "127.0.0.1:"+config.ports.proxy;
			ssl.creds[site.domain] = credentials({key:key, cert:cert});
			
		}
	}
}

//
// Proxies
//
function proxyRequest(req, res) {
	
	var host = req.headers.host || false;
	// don't continue if there is no host
	if( !host ) return res.end();
	
	// get the port for the requested host
	var site = findSite( host );
	
	//
	proxy.proxyRequest(req, res, site);
	
}

function proxySocket(req, socket, head) {
	
	var host = req.headers.host || false;
    // don't continue if there is no host
  	if( !host ) return res.end();
  
	// get the port for the requested host
	var site = findSite( host );
	
  	//
	proxy.proxyWebSocketRequest(req, socket, head, site);
	
}


function findSite( host ) {
	// local vars
	var site = { host: false, port: false };
	// clean up host
	//#14 FIX: removing port from host
	if(host.indexOf(":") > -1) host = host.substring(0, host.indexOf(":") );
	
	var domain = findDomain( host );
	
	if( domain ){
		return domain;
	}
	// no match yet...
	
	hostparts = host.match(/\./gi);
	
	if(typeof hostparts !== null && hostparts.length > 1){
		// this is a subdomain
		
		// remove the first part (up until the dot) and try again
		host = host.replace(/([^.]+)\./, "");
		
		var domain = findDomain( host );
		
		if( domain ){
			return domain;
		}
		
	} else {
		// oh dear, this is a domain...
		// ultimate fallback
		//res.writeHead(301, { Location: protocol+ 'http://kdi.co/' });
		//res.end();
		return { 
			host : "127.0.0.1",
			hostname : "localhost",
			port : config.ports.nginx
		}
		
	}

}

function findDomain( host ){
	var domain = false;
	// lists
	var express_domains = config.hosts.express;
	var routed_domains = config.hosts.router;
	// lookup direct redirects (router)
	
	var in_routes = routed_domains.indexOf(host);
	if( in_routes > -1){
		var route = config.routes.router[host].split(":");
		// check if it's an internal or extenal route
		if( route[0] != "127.0.0.1" ){
			
			domain = {
				host : route[0],
				hostname : host, 
				port : route[1] || "80"
			};
		
		} else if( route[0] == "127.0.0.1" && ( typeof route[1] == "undefined" || route[1] == "80" ) ) {
			// this will lead to a redirect loop
			// do nothing and the request will fail...
		} else {
			// this is a 'valid' internal redirect
			domain = {
				host : host,
				port : route[1]
			};
		}

	// lookup express domains
	} else if( express_domains.indexOf(host) > -1 ) {
		
		domain = {
			host : host,
			port : config.ports.express
		};
		
	}
	
	//var port = config.ports.proxy || false;
	//var port = ((xprs.indexOf(host) > -1) ? config.ports.express : config.ports.router) || false;
	
	return domain;
}

// Helpers

//
// generic function to load the credentials context from disk
//
function credentials( options ) {
  return crypto.createCredentials(options).context;
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
	
};


//
// Create the targets HTTPS server for both cases
//
module.exports = server; 