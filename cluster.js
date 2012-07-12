// server.js
// - cluster handles the distribution of the requests among all the available cpu cores
var cluster = require('cluster')
  , proxy = require('./proxy');

cluster(proxy)
  //.use(cluster.logger('logs'))
  //.use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  //.use(cluster.repl(8888))
  .listen(80);