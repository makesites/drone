var fs = require('fs'),
	config = require('../config/drone'),
	server = require('../config/server'),
	crypto = require('crypto'),
	tls = require('tls');


var hosts = {
	creds: {},
//
// Setup
//
	setup: function(){

		// - Import config from external file(s)
		// set config options
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

		// - setup router options
		//add nginx sites to the router
		var nginx = config.hosts.nginx;
		for(i in nginx){
			config.routes.router[ nginx[i] ] = "127.0.0.1:"+ config.ports.nginx;
		}
		// save the list of routing domains (nginx+router)
		config.hosts["router"] = Object.keys(config.routes.router);

	},

	find: function ( host ) {
		// local vars
		// clean up host
		//#14 FIX: removing port from host
		if(host.indexOf(":") > -1) host = host.substring(0, host.indexOf(":") );

		var target = this.domain( host );

		if( target ){
			return target;
		}
		// no match yet...

		hostparts = host.match(/\./gi);

		if(typeof hostparts !== null && hostparts.length > 1){
			// this is a subdomain

			// remove the first part (up until the dot) and try again
			host = host.replace(/([^.]+)\./, "");

			var target = this.domain( host );

			if( target ){
				return target;
			}

		}
		// oh dear, this is a domain... ultimate fallback
		return {
			host : "127.0.0.1",
			hostname : "localhost",
			port : parseInt( config.ports.nginx )
		}

	},

	//
	domain : function ( host ){
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
					port : parseInt( route[1] ) || 80
				};

			} else if( route[0] == "127.0.0.1" && ( typeof route[1] == "undefined" || route[1] == "80" ) ) {
				// this will lead to a redirect loop
				// do nothing and the request will fail...
			} else {
				// this is a 'valid' internal redirect
				domain = {
					host : route[0],
					hostname : host,
					port : parseInt( route[1] )
				};
			}

		// lookup express domains
		} else if( express_domains.indexOf(host) > -1 ) {

			domain = {
				host : "127.0.0.1",
				hostname : host,
				port : parseInt( config.ports.express )
			};

		}

		//var port = config.ports.proxy || false;
		//var port = ((xprs.indexOf(host) > -1) ? config.ports.express : config.ports.router) || false;

		return domain;
	},

	// - Create SSL ports
	ssl : function(){

		var router = {};

		for(var host in config.ssl){
			var site = config.ssl[host];
			if( typeof site.credentials != "undefined" || typeof site.domain != "undefined"){

				var creds = {};
				// mandatory
				creds.key = fs.readFileSync( site.credentials.key, 'utf8');
				creds.cert = fs.readFileSync( site.credentials.cert, 'utf8');
				// optional
				if( site.credentials.ca ) creds.ca = fs.readFileSync( site.credentials.ca, 'utf8');
				//#25 support ciphers
				if( config.ciphers ){
					creds.honorCipherOrder = true;
					creds.ciphers = config.ciphers;
				}
				// find host
				//var domain = this.find( host );
				router[site.domain] = "127.0.0.1:"+config.ports.router;
				//router[site.domain] = domain.host +":"+ domain.port;
				this.creds[site.domain] = credentials( creds );

			}
		}

		// using the global ssl object...
		return {
			SNICallback: function(domain, cb){
				var context = hosts.creds[domain] || null;
				// if it's a subdomain, check the main domain
				if( !context && isSubdomain( domain ) && config.sslDomainFallback ){
					var root = domain.substr( domain.indexOf('.')+1 );
					context = hosts.creds[root] || null;
				}
				return ( cb ) ? cb(null, context) : context;
			},
			key: (server.ssl.key) ? fs.readFileSync( server.ssl.key ) : false,
			cert: (server.ssl.cert) ? fs.readFileSync( server.ssl.cert ) : false
		};

	}






};



// Helpers
//
// generic function to load the credentials context from disk
//
function credentials( options ) {
	// backewards compatibility
	return ( tls.createSecureContext ) ? tls.createSecureContext(options).context :  crypto.createCredentials(options).context;
};

function isSubdomain( domain ) {
	// prerequisites
	if( !domain ) return false;
	// variables
	var regex = new RegExp(/^([a-z]+\:\/{2})?([\w-]+\.[\w-]+\.\w+)$/);
	// check
	return !!domain.match(regex); // make sure it returns boolean
}
module.exports = hosts;
