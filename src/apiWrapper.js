const fs = require('fs');
const path = require("path")
const axios = require('axios');
let authCode;
const log = require('simple-node-logger').createSimpleLogger('headOutput.log');

try {
    // Adjust the path according to where your .auth file is located
    authCode = fs.readFileSync(path.join(__dirname, "..", ".auth"), 'utf8');
    log.info('Auth Code:', authCode);
} catch (err) {
    log.info('Error reading .auth file:', err);
    authCode = 0
}

async function sendServerReady(serverId){
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
    authCode
}