const fs = require('fs');
const path = require("path")
let authCode;

try {
    // Adjust the path according to where your .auth file is located
    authCode = fs.readFileSync(path.join(__dirname, "..", ".auth"), 'utf8');
    console.log('Auth Code:', authCode);
} catch (err) {
    console.error('Error reading .auth file:', err);
}

