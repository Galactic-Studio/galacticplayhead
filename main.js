console.log("Logger Started")
const {ChildServer} = require("./src/server")

let server = new ChildServer("test", "test", "test")
server.startChildServer()