What is this?
=============
node-im is a Facebook Chat client that I built to learn about XMPP.

<img src="https://github.com/6/node-im/raw/master/screenshot.png">

Prerequisites
=============
Install expat libraries

    sudo apt-get install libexpat1 libexpat1-dev

Install upstart

    sudo apt-get install upstart

Install [Node.JS](http://nodejs.org) and [NPM](http://npmjs.org/)

Also, install CoffeeScript globally with NPM:

    npm -g install coffee-script

Installation
============
Clone this repository with Git

    git clone git://github.com/6/node-im.git

Alternatively, [download the zip](https://github.com/6/node-im/zipball/master) and unzip it

`cd` into the `node-im`

Install node package dependencies

    npm install

Modify the upstart conf file to point to this directory (see line 11 of `node-im.conf`). Then, chmod and move upstart conf file to the correct directory

    chmod u+x node-im.conf
    sudo mv node-im.conf /etc/init/

Generate self-signed SSL certificate

    cd certs
    openssl genrsa -out node-im.key 1024    
    openssl req -new -key node-im.key -x509 -out node-im.crt -days 999

Usage
=====
Starting/stopping the application is very easy with upstart.

To start

    sudo start node-im

To stop

    sudo stop node-im

To see the status

    sudo status node-im

Config
======
BOSH server can be configured in the `bosh.js.conf` file (default port 5280).

The web server's port can be changed in `web_server.coffee` (default port 3000).
