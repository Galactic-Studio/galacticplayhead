const log = require('simple-node-logger').createSimpleLogger('head.log');
log.info("Logger Started")
const {ChildServer} = require("./src/server")
const express = require("express");
const app = express();
const port = 8080; // Get port from command-line argument

let server = new ChildServer("test", "test", "test", "/Game/ThirdPerson/Maps/ThirdPersonMap")
server.startChildServer()

app.listen(port);

