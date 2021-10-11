var lastLogin;
var running;

function runBot(resolve) {
    if (running) {
        return;
    }
    const c = require('chalk');
    const main = require('./main');
    const mcp = require('minecraft-protocol');
    const mineflayer = require('mineflayer');

    var lastTip = 0;
    var limbo = false;

    mcp.ping({
        host: 'hypixel.net',
        version: main.config['version']
    });

    running = true;
    console.log(c.blue('Pinged hypixel.'));

    const bot = mineflayer.createBot({
        host: 'hypixel.net',
        username: main.config['username'],
        password: main.config['password'],
        port: 25565,
        version: main.config['version'],
        auth: main.config['auth']
    })

    bot.on('login', () => {
        if (!limbo) {
            console.log(c.yellow('Joined hypixel.'));
        }
    })

    bot.on('spawn', () => {
        if (!limbo) {
            bot.chat('/achat \u00A7c');
            console.log(c.yellow('Sending to limbo...'));
        }
    })

    bot.on('error', (error) => {
        log(c.red('Error: ' + error));
    })

    bot.on('kicked', (reason) => {
        if (reason.includes('You logged in from another location!')) {
            lastLogin = Date.now();
            console.log(c.redBright('You logged in from another location!'));
        } else {
            console.log(c.redBright(reason));
        }
    })

    bot.on('physicsTick', () => {
        if (limbo && Date.now() - lastTip > 60000) {
            lastTip = Date.now();
            bot.chat('/tip all');
        }
    })

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        if (msg.toLowerCase().includes('limbo')) {
            if (!limbo) {
                limbo = true;
                console.log(c.yellow('Sent to limbo.'));
            }
        } else if (msg == 'Illegal characters in chat' && !limbo) {
            console.log(c.yellow('Sent to limbo.'));
        } else if (msg.startsWith('You tipped ')) {
            console.log(c.green(msg));
        }
    })

    bot.on('end', () => {
        running = false;
        resolve();
    });
}

function getLastLogin() {
    return lastLogin;
}

module.exports = {runBot, getLastLogin};