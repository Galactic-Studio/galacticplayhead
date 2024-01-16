const log = require('simple-node-logger').createSimpleLogger('head.log');
log.info("Logger Started")
const {ChildServer} = require("./src/server")

let server = new ChildServer("test", "test", "test")
server.startChildServer()