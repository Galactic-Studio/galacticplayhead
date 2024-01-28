const fs = require('fs');
const path = require("path")
const axios = require('axios');
let authCode;

try {
    // Adjust the path according to where your .auth file is located
    authCode = fs.readFileSync(path.join(__dirname, "..", ".auth"), 'utf8');
    console.log('Auth Code:', authCode);
} catch (err) {
    console.error('Error reading .auth file:', err);
    authCode = 0
}

async function sendServerReady(serverId){
    let request = await axios.request({
        method: "post",
        url:`api.gplay.galacticstudio.space/allowHeadServer/${serverId}`,
        headers:{
            'Authorization': authCode
        }
    })
}
module.exports = {
    sendServerReady,
    authCode
}