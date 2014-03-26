
var clusterMaster = require("cluster-master"),
	os = require('os'),
	path = require("path");

function Master(options) {
	//this.options = options;
}

Master.prototype.listen = function(options, callback) {

	clusterMaster({ exec: __dirname +"/proxy.js" // script to run
		, size: os.cpus().length // number of workers
		, env: {}
		, args: []
		//, silent: true
		, signals: false
		, repl: false
		, onMessage: function (msg) {
			console.error("Message from %s %j"
			, this.uniqueID
			, msg)
		}
	});

	// execute callback
	if(typeof callback == "function"){
		callback()
	}
};

Master.prototype.stop = function() {
	// graceful shutdown
	clusterMaster.quit()
}

Master.prototype.shutdown = function() {
	// not so graceful shutdown
	clusterMaster.quitHard()
}

var master = new Master();

module.exports = master;
