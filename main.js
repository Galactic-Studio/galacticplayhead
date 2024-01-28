const log = require('simple-node-logger').createSimpleLogger('head.log');

log.info("Logger Started")
const {ChildServer} = require("./src/server")
const express = require("express");
const wrapper = require("./src/apiWrapper");
const app = express();
const sys = require('systeminformation');

app.use(express.json());
const port = 8080;

//wrapper.sendServerReady()

app.listen(port);

app.post("/createGameServer/:serverId", async (req, res)=>{
    let data = req.body
    console.log(data)
    if (req.headers.Authroization === wrapper.authCode){
        console.log(data)
        let server = new ChildServer(data.name, data.ownerId, data.gameId, data.serverMap, req.params.serverId)
    }
})

app.get("/checkAvailability", async (req, res)=>{

})
async function getDropletUsage() {
    try {
        const cpu = await sys.cpuCurrentSpeed();
        const memory = await sys.mem();
        const disk = await sys.fsSize();
        console.log(cpu)
        console.log(`CPU Load: ${cpu.max.toFixed(2)}%`);
        console.log(`CPU Free: ${(100 - cpu).toFixed(2)}%`);
        console.log(`Free Memory: ${((memory.free / (1024 ** 3)).toFixed(2))} GB`);
        console.log(`Total Memory: ${((memory.total / (1024 ** 3)).toFixed(2))} GB`);
        console.log(`Disk Usage: ${disk.map(d => `${d.fs}: ${((d.size - d.used) / (1024 ** 3)).toFixed(2)} GB free`).join(', ')}`);
    } catch (error) {
        console.error(`Error getting system info: ${error}`);
    }
}
getDropletUsage()