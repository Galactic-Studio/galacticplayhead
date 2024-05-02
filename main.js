const log = require('simple-node-logger').createSimpleLogger('headOutput.log');
log.info("Starting Head Server")
log.info("Logger Started")
const {ChildServer} = require("./src/server")
const express = require("express");
const wrapper = require("./src/apiWrapper");
const app = express();
const sys = require('systeminformation');

let childServers = [];

app.use(express.json());
const port = 8080;

app.listen(port);

app.post("/createGameServer/:serverId", async (req, res)=>{
    let data = req.body
    log.info(data)
    let auth = await wrapper.getAuth()
    if (req.headers.authorization === auth){
        log.info(data)
        log.info("Starting a Game Server")
        let server = new ChildServer(data.serverName, data.ownerId, data.gameId, data.serverMap, req.params.serverId)
        log.info(server)
        await server.startChildServer()
        childServers.push(server)
        res.status(201).send("Server Started")
    }else{
        res.status(401).send("Bad Auth Code")
    }
})

function shutdownServer() {
    return new Promise(async (resolve, reject) => {
        log.info("Shutting Down Server")
        await wrapper.sendServerShutdown()
        process.exit(0)
        childServers.forEach(server => {
            server.sendServerShutdown()
        })
    })

}

app.post("/shutdownServer", async (req, res)=>{
    log.info("Shutting Down Server")
    let auth = await wrapper.getAuth()
    if (req.headers.authorization === auth){
        log.info("Shutting Down Child Servers")
        shutdownServer()
        res.status(201).send("Shutting Down Server")
    }else{
        res.status(401).send("Bad Auth Code")
    }
})

app.get("/checkAvailability", async (req, res)=>{

})
async function getDropletUsage() {
    try {
        const cpu = await sys.cpuCurrentSpeed();
        const memory = await sys.mem();
        const disk = await sys.fsSize();
        log.info(cpu)
        log.info(`CPU Load: ${cpu.max.toFixed(2)}%`);
        log.info(`CPU Free: ${(100 - cpu).toFixed(2)}%`);
        log.info(`Free Memory: ${((memory.free / (1024 ** 3)).toFixed(2))} GB`);
        log.info(`Total Memory: ${((memory.total / (1024 ** 3)).toFixed(2))} GB`);
        log.info(`Disk Usage: ${disk.map(d => `${d.fs}: ${((d.size - d.used) / (1024 ** 3)).toFixed(2)} GB free`).join(', ')}`);
    } catch (error) {
        log.info(`Error getting system info: ${error}`);
    }
}
wrapper.sendServerReady()
log.info("Head Server is Ready")