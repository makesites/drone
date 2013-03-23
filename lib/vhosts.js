var express = require('express'),
    config = require('../config/drone'), 
	hosts = require('./hosts');


// set the dev flag based on the environment
var DEV = !(process.env.NODE_ENV == "production"),
	server, app;

var vhosts = {
	// - create express server
	setup: function(){ 
		
		var domains =  config.hosts.express;
		var path = config.paths.www;
		// initiate the express server only if there are domains using it
		if( domains.length ){ 
			app = express();
			app.use( this.root );
			server = http.createServer(app);
			for(name in domains){
				try{ 
					// #12 - supporting server object (as a fallback)
					var domain = domains[name];
					var site = require( path + domain );
					var exec = ( site.app ) ? site.app : site.server;
					// adding vhost
					app.use(express.vhost( domain, exec ) );
					// optionally add dev domains
					if( DEV ){ 
						app.use(express.vhost( "dev."+ domain, exec ) );
					}
					
				} catch( e ){
					// log event : console.log(e);
				}
			}
			server.listen( config.ports.express );
		}
	}, 
	
	root: function(req, res, next) {
		console.log(" req.headers ", req.headers );
		next();
	}
}

module.exports = vhosts; 