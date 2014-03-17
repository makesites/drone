/*
 * Drone Server
 * Source: https://github.com/makesites/drone
 * Author: Makis Tracend (@tracend)
 * Released under the MIT license (http://makesites.org/licenses/MIT)
 * Distributed through Makesites.org
 */

// Setup main app/server
//var cluster = require('./lib/cluster'),
var	proxy = require("./lib/proxy"),
	config = require('./config/drone');

/*
// Listen to router
if(process.argv.indexOf('stop') >= 0) {
	cluster.stop()
}
else if(process.argv.indexOf('shutdown') >= 0) {
	cluster.shutdown();
}
else {

	cluster.listen(proxy.router, function() {
		//console.log('Listening HTTP');
	});

}
*/
exports.http = proxy.http || false;
exports.https = proxy.https || false;
