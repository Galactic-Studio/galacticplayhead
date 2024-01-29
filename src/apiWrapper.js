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

function getServer(){
    return new Promise (resolve => {
        serverId =  fs.readFileSync(path.join(__dirname, "..", ".server"), 'utf8');
        log.info('Server ID:', serverId);
        resolve()
    })
}

function getAuth(){
    return new Promise (resolve => {
        authCode = fs.readFileSync(path.join(__dirname, "..", ".auth"), 'utf8');
        log.info('Auth Code:', authCode);
        resolve()
    })
}


async function sendServerReady(){
    return new Promise(async resolve => {
        await getServer()
        await getAuth()
        log.info(`Server sending ready: ${serverId}`)
        let request = axios.request({
            method: "post",
            url:`https://api.gplay.galacticstudio.space/allowHeadServer/${serverId}`,
            headers:{
                'Authorization': authCode
            }
        }).then(res =>{
            resolve()
        })
        log.info("Server Ready")
        log.info(request)
    })

}
module.exports = {
    sendServerReady,
    authCode,
    serverId
}