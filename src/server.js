const net = require('net');
const { S3Client, ListObjectsV2Command, GetObjectCommand, S3} = require("@aws-sdk/client-s3");
const fs = require('fs')
const exfs = require('fs-extra')
const path = require('path');
const stream = require('stream');
const { promisify} = require('util');
const crypto = require("crypto");
const { exec } = require('child_process');
const log = require('simple-node-logger').createSimpleLogger('head.log');

log.info("Server Required")

const s3Client = new S3({
    forcePathStyle: false,
    endpoint: "https://nyc3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: "DO002CPG3V9ME6X2BYCJ",
        secretAccessKey: "vMAmirYIhRkYXNb4h6nlw//U3mCBWPzMz0Z8dKQbt1U"
    }
});
function checkPort(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => {
                resolve(port);
            });
            server.close();
        });
        server.on('error', (err) => {
            reject(err);
        });
    });
}

class ChildServer {
    constructor(name, ownerId, gameId) {
        this.name = name
        this.owner = ownerId
        this.game = gameId
        this.serverId = crypto.randomUUID()
    }

    static generatePort(){
        return new Promise(async resolve => {
            let port;
            let isAvailable = false;
            while (!isAvailable) {
                port = Math.floor(10000 + Math.random() * 90000);
                try {
                    await checkPort(port);
                    await checkPort(port+1);
                    isAvailable = true;
                    log.info(port)
                } catch (err) {
                    log.info(`Port ${port} is in use, trying another one...`);
                }
            }
            resolve(port);
        })
    }
    startChildServer(){
       return new Promise(async (resolve, reject) => {
           this.port = await ChildServer.generatePort()
           this.gamePort = this.port+1;
           log.info("Downloading Files")
           await this.downloadFiles()
           log.info("Files Downloaded")
           const scriptPath = path.join( __dirname,'servers', `${this.serverId}-${this.port}`, 'setupServer.sh');
           await exfs.ensureFile(scriptPath);
           log.info("Starting Child Server")
           fs.chmodSync(scriptPath, '755');
           exec(`bash ${scriptPath} ${this.port} ${this.gamePort}`, (error, stdout, stderr) => {
               if (error) {
                   console.error(`Error: ${error.message}`);
                   return;
               }
               if (stderr) {
                   console.error(`Stderr: ${stderr}`);
                   return;
               }
               log.info(`Stdout: ${stdout}`);
           });
       })
    }
    downloadFiles(){
        return new Promise(async (resolve, reject) => {
            const files = await s3Client.send(new ListObjectsV2Command({
                Bucket: "galacticstudio",
                Prefix: `${this.owner}/${this.game}`
            }))
            if (!files.Contents) {
                throw new Error('Folder not found or is empty');
            }
            // for (const object of files.Contents) {
            //     const getObjectCommand = new GetObjectCommand({
            //         Bucket: "galacticstudio",
            //         Key: object.key
            //     });
            //     const { Body } = await s3Client.send(getObjectCommand);
            //     const pipeline = promisify(stream.pipeline);
            //     await pipeline(Body, fs.createWriteStream(`${this.serverId}-${this.port}`));
            // }
        }).catch(err=>{
            log.info(err)
        })
    }
}

module.exports = {
    ChildServer
}