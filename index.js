/*
 * Drone Server
 * Source: https://github.com/makesites/drone
 *
 * Author: Makis Tracend (@tracend)
 * Distributed through Makesites.org
 * Released under the MIT license (http://makesites.org/licenses/MIT)
 */

// init cluster
var cluster = require('./lib/cluster');

// Listen to router
if(process.argv.indexOf('stop') >= 0) {
	cluster.stop()
}
else if(process.argv.indexOf('shutdown') >= 0) {
	cluster.shutdown();
}
else {
	cluster.listen({}, function() {
		//console.log('Listening HTTP');
	});

}
