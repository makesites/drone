```                                            
░ █ ▀ ▀ ▄ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　░ █ ▄ ─ ░ █ 　░ █ ▀ ▀ ▀ 　
░ █ ─ ░ █ 　░ █ ▄ ▄ ▀ 　░ █ ─ ─ ░ █ 　░ █ ░ █ ░ █ 　░ █ ▀ ▀ ▀ 　
░ █ ▄ ▄ ▀ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ █ 　░ █ ─ ─ ▀ █ 　░ █ ▄ ▄ ▄ 　
```

A node js app that redirects to other express apps or server ports... designed with minimal footprint and modular architecture in mind.


## Features

* Uses the cluster library from the Node.js API to reach maximum performance in a multi-core environment.
* Can redirect by proxy to websites served by express.js or nginx and even to other IPs on the same or other servers.


## Install 

Directly from github: 
```
git clone git://github.com/makesites/drone.git
```
or as an npm module
```
npm install drone-server
```

## Usage 

Update the config/ folder with the supported domain names and run the *cluster.js* file: 
```
node cluster.js
```

## Credits 

Created by [Makis Tracend](http://github.com/tracend)

Released under the [MIT lisense](http://makesites.org/licenses/MIT) on [Makesites.org](http://makesites.org)

ASCII logo by [Tarty](http://fsymbols.com/generators/tarty/) (brighter, perforated)
