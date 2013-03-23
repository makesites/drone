var express = require('express'),
    config = require('../config/drone'), 
	hosts = require('./hosts');


// set the dev flag based on the environment
var DEV = !(process.env.NODE_ENV == "production");

var vhosts = {
	// - create express server
	setup: function(){ 
		
		var domains =  config.hosts.express;
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
}

module.exports = vhosts; 