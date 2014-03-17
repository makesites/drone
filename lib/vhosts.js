var http = require('http'),
	vhost = require('vhost'),
	express = require('express'),
	config = require('../config/drone'),
	hosts = require('./hosts'),
	app = express();

var vhosts = {
	// - create express server
	setup: function(){

		var domains =  config.hosts.express;
		var path = config.paths.www;
		// initiate the express server only if there are domains using it
		if( domains.length ){
			//
			for(name in domains){
				try{
					// #12 - supporting server object (as a fallback)
					var domain = domains[name];
					var site = require( path + domain );
					var exec = ( site.app ) ? site.app : site.server;
					// adding vhost
					app.use( vhost( domain, exec ) );
					app.use( vhost( "*."+ domain, exec ) );

				} catch( e ){
					// log event : console.log(e);
				}
			}
			this.server = http.createServer(app);
			this.server.listen( config.ports.express );
		}
	},
	/*
	root: function(){
		var domains =  config.hosts.express;

		return function(req, res, next) {
			var host = req.headers.host;
			if ( domains.indexOf( host )  > -1 ) {
				return next();
			} else {
				hostparts = host.match(/\./gi);
				if(typeof hostparts !== null && hostparts.length > 1){
					// this is a subdomain...

					// remove the first part (up until the dot) and try again
					host = host.replace(/([^.]+)\./, "");
					// compare again...
					if( domains.indexOf( host )  > -1 ){
						res.redirect( req.protocol + '://' + host + req.url);
						//res.writeHead(301, { Location: req.protocol + '://' + host + req.url });
						return res.end();
					}

				}
			}
			// no valid domain...
			res.end();
		}

	}
	*/
}

module.exports = vhosts;