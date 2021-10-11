const config = JSON.parse(require('fs').readFileSync('./config.json'));
module.exports = {config}

const https = require('https');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const bot = require('./bot');

async function startLoop() {
    while (true) {
        if (Date.now() - bot.getLastLogin() < 30000) {
            await delay(30000 - (Date.now() - bot.getLastLogin()));
        }

        await checkStatus();
        await delay(60000 / config['checksPerMin']);
    }
}

function checkStatus() {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.hypixel.net',
            port: 443,
            path: '/status?uuid=' + config['uuid'] + '&key=' + config['apikey'],
            method: 'GET'
        }, res => {
            res.on('data', d => {
                const parsed = JSON.parse(d);
                if (parsed.success) {
                    if (!parsed.session.online) {
                        bot.runBot(resolve);
                    } else {
                        resolve();
                    }
                } else {
                    reject();
                }
            })
        })

        req.on('error', error => {
            reject(error);
        })

        req.end();
    });
}

startLoop();