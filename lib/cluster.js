// DIY Cluster
// by Subbu Allamaraju (@s3u)
// Public Clone URL:	git://gist.github.com/1593337.git

'use strict'

var cluster = require('cluster'),
    http = require('http'),
    os = require('os'),
    fs = require('fs'),
	proxy = require("./proxy"),
	config = require('../config/server');

function Master(options) {
    this.options = options;

    this.killall = function(signal) {
        var that = this, fullname, master;
        fs.readdir(that.options.pids, function(err, paths) {
            paths.forEach(function(filename) {
                fullname = that.options.pids + '/' + filename;
                if(/\master./.test(filename)) {
                    master = fullname;
                }
                else {
                    kill(fullname, signal);
                }
            });
            if(master && signal !== 'SIGINT') {
                kill(master, signal);
            }
        });
    };

    var kill = function(fullname, signal) {
        fs.readFile(fullname, 'ascii', function(err, data) {
            process.kill(parseInt(data), signal);
        });
        fs.unlink(fullname, function(err) {
            if(err) {
                console.log('Unable to delete ' + fullname);
            }
        });
    }

    this.createWorker = function () {
        var worker = cluster.fork();
		//#13 FIX - replacing worker.pid with worker.id
		fs.writeFileSync(this.options.pids + '/worker.' + worker.id + '.pid', worker.id);
    }
}

Master.prototype.listen = function(app, cb) {
    if(cluster.isMaster) {
        fs.writeFileSync(this.options.pids + '/master.' + process.pid + '.pid', process.pid);

        // Fork workers.
        var noWorkers = os.cpus().length;
        for(var i = 0; i < noWorkers; i++) {
            this.createWorker();
        }

        var that = this;
        var sigint = false;
        cluster.on('death', function (worker) {
            if(!sigint) {
                that.createWorker();
            }
        });

        process.on('SIGINT', function() {
            sigint = true;
            fs.readdir(that.options.pids, function(err, paths) {
                paths.forEach(function(filename) {
                    fs.unlink(that.options.pids + '/' + filename);
                });
                process.exit();
            });
        });
    }
    else {
        // Worker processes have an http server.
        app.listen(this.options.port, cb);
    }
};

Master.prototype.stop = function() {
    this.killall('SIGKILL');
}

Master.prototype.shutdown = function() {
    this.killall('SIGTERM');
}

var master = new Master({
    pids: __dirname + '/pids',
    port: config.port
});

if(process.argv.indexOf('stop') >= 0) {
    master.stop()
}
else if(process.argv.indexOf('shutdown') >= 0) {
    master.shutdown();
}
else {

    master.listen(proxy, function() {
        //console.log('Listening');
    });
}

exports.cluster = master;
