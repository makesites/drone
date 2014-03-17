var config = require('../config/drone');

module.exports = function( router ){
	router.listen(config.ports.router, function(){
		console.log("Router listening to port", config.ports.router);
	});
}
