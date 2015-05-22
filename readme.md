```
░ █ ▀ ▀ ▄ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　░ █ ▄ ─ ░ █ 　░ █ ▀ ▀ ▀ 　
░ █ ─ ░ █ 　░ █ ▄ ▄ ▀ 　░ █ ─ ─ ░ █ 　░ █ ░ █ ░ █ 　░ █ ▀ ▀ ▀ 　
░ █ ▄ ▄ ▀ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ █ 　░ █ ─ ─ ▀ █ 　░ █ ▄ ▄ ▄ 　
```

A node module acting as a server gateway to other web apps - designed with minimal footprint and modular architecture in mind.

Uses the cluster library from the Node.js API to reach maximum performance in a multi-core environment. Can redirect by proxy to websites served by express.js or nginx and even to other IPs.


## Features

* Multi-core (cluster) support
* Redirect to other ports and/or IPs
* Multi-app environment using express vhosts
* Nginx integration


## Install

To include drone to an existing app/setup simply install the node module:
```
npm install drone-server
```
or clone directly from github:
```
git clone git://github.com/makesites/drone.git
```


## Usage

Update the ```config/``` folder (using the sample files) with the supported domain names and run the *server.js* file:
```
node server.js
```
Read the online docs for more detailed info:
[https://github.com/makesites/drone/wiki](https://github.com/makesites/drone/wiki)


## Credits

Initiated by [Makis Tracend](http://github.com/tracend) ( [Full list of contributors](https://github.com/makesites/drone/contributors) )

Distributed by [Makesites.org](http://makesites.org)

### Trivia

Originally developed to become the backbone for the [K&D Interactive](http://kdi.co) network.

### Thanks

ASCII logo by [Tarty](http://fsymbols.com/generators/tarty/) (brighter, perforated)

### License

Released under the [MIT lisense](http://makesites.org/licenses/MIT)
