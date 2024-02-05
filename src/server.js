const net = require('net');
const { ListObjectsV2Command, GetObjectCommand, S3} = require("@aws-sdk/client-s3");
const fs = require('fs')
const path = require('path');
const stream = require('stream');
const { promisify} = require('util');
const enums = require("./enums")
const crypto = require("crypto");
const { exec } = require('child_process');
const log = require('simple-node-logger').createSimpleLogger('head.log');

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
    constructor(name, ownerId, gameId, map, serverId) {
        this.name = name
        this.owner = ownerId
        this.gameId = gameId
        this.serverId = serverId
        this.map = map
        this.authCode = crypto.randomBytes(32).toString('hex');
        this.status = enums.gameServerStatus.Starting
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
           log.info("Starting Child Server")
           exec(`bash startServer.sh ${this.gameId} ${this.port} ${this.gamePort} ${this.map} ${this.authCode} ${this.name} ${this.serverId}`, (error, stdout, stderr) => {
               if (error) {
                   log.info(`Error: ${error.message}`);
                   return;
               }
               if (stderr) {
                   log.info(`Stderr: ${stderr}`);
                   return;
               }
               log.info(`Stdout: ${stdout}`);
           });
           log.info("Server Started")
         resolve()
       })
    }
    downloadFiles(){
        return new Promise(async (resolve, reject) => {
            const files = await s3Client.send(new ListObjectsV2Command({
                Bucket: "galacticstudio",
                Prefix: `${this.owner}/${this.gameId}`
            }))
            if (!files.Contents) {
                log.info(`Folder not found or is empty`)
                throw new Error('Folder not found or is empty');
            }
            const totalSize = files.Contents.reduce((acc, obj) => acc + (obj.Size || 0), 0);
            let downloadedSize = 0;

            for (const object of files.Contents) {
                log.info(`Downloading ${object.Key}`)
                if (object.Key.endsWith('/')) {
                    continue; // Skip if it's a folder entry
                }
                const getObjectCommand = new GetObjectCommand({
                    Bucket: "galacticstudio",
                    Key: object.Key
                });
                const localPath = object.Key.split('/').slice(2).join('/');
                const dir = path.join('servers', `${this.gameId}-${this.port}`, path.dirname(localPath));
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir, { recursive: true });
                }
                const { Body } = await s3Client.send(getObjectCommand);
                const pipeline = promisify(stream.pipeline);
                await pipeline(Body, fs.createWriteStream(`${dir}/${path.basename(object.Key)}`));
                downloadedSize += object.Size || 0;
                const percentComplete = (downloadedSize / totalSize * 100).toFixed(2);
                console.log(`Download progress: ${percentComplete}%`);
            }
            resolve()
        }).catch(err=>{
            log.info(err)
        })
    }
}

module.exports = {
    ChildServer
}