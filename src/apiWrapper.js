const fs = require('fs');
const path = require("path")
const axios = require('axios');
let authCode;
let serverId;
const log = require('simple-node-logger').createSimpleLogger('headOutput.log');

try {
    // Adjust the path according to where your .auth file is located
    authCode = fs.readFileSync(path.join(__dirname, "..", ".auth"), 'utf8');
    log.info('Auth Code:', authCode);
} catch (err) {
    log.info('Error reading .auth file:', err);
    authCode = 0
}
try {
    // Adjust the path according to where your .auth file is located
    serverId = fs.readFileSync(path.join(__dirname, "..", ".server"), 'utf8');
    log.info('Server ID:', authCode);
} catch (err) {
    log.info('Error reading .server file:', err);
    serverId = ""
}

async function sendServerReady(){
    log.info(`Server sending ready: ${serverId}`)
    let request = await axios.request({
        method: "post",
        url:`api.gplay.galacticstudio.space/allowHeadServer/${serverId}`,
        headers:{
            'Authorization': authCode
        }
    })
    log.info(request)
}
module.exports = {
    sendServerReady,
    authCode,
    serverId
}