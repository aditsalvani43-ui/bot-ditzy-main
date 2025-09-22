const { 
    default: WAConnect, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeInMemoryStore,
    proto,
    getContentType 
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const moment = require('moment-timezone');
const { handleMessage } = require('./lib/handler');
const { smsg } = require('./lib/functions');

// Load configuration
let config;
try {
    config = require('./config/config');
} catch (error) {
    console.error(chalk.red('Configuration file not found!'));
    console.log(chalk.yellow('Please run: node setup.js'));
    process.exit(1);
}

// Create store for message handling
const store = makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
});

async function startBot() {
    // Ensure sessions directory exists
    await fs.ensureDir('./sessions/auth');
    
    const { state, saveCreds } = await useMultiFileAuthState('./sessions/auth');
    
    const sock = WAConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: [config.botName || "Ditzy Time", "Chrome", "1.0.0"],
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        emitOwnEvents: true,
        maxMsgRetryCount: 3
    });

    // Bind store to socket
    store.bind(sock.ev);

    // Handle pairing code
    if (!sock.authState.creds.registered) {
        console.log(chalk.yellow('Waiting for phone number to pair...'));
        
        // Get phone number from user input
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(chalk.blue('Enter your WhatsApp number (with country code, e.g., 62812345678): '), async (phoneNumber) => {
            rl.close();
            
            console.log(chalk.yellow('Generating pairing code...'));
            
            try {
                const code = await sock.requestPairingCode(phoneNumber.trim());
                console.log(chalk.green('Pairing Code:'), chalk.bold.white(code));
                console.log(chalk.cyan('Steps:'));
                console.log(chalk.cyan('1. Open WhatsApp on your phone'));
                console.log(chalk.cyan('2. Go to Settings > Linked Devices'));
                console.log(chalk.cyan('3. Tap "Link a Device"'));
                console.log(chalk.cyan('4. Enter the pairing code above'));
            } catch (error) {
                console.error(chalk.red('Failed to generate pairing code:'), error);
                process.exit(1);
            }
        });
    }

    // Connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connection closed:'), lastDisconnect?.error?.message || 'Unknown error');
            
            if (shouldReconnect) {
                console.log(chalk.yellow('Reconnecting in 3 seconds...'));
                setTimeout(() => startBot(), 3000);
            } else {
                console.log(chalk.red('Bot logged out. Please restart and pair again.'));
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Bot connected successfully!'));
            console.log(chalk.blue('Bot Number:'), sock.user.id.split(':')[0]);
            console.log(chalk.magenta('Bot is ready to receive commands!'));
        } else if (connection === 'connecting') {
            console.log(chalk.yellow('Connecting to WhatsApp...'));
        }
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg || msg.key.fromMe || !msg.message) return;
            
            // Skip if message is too old (more than 1 minute)
            const messageTime = msg.messageTimestamp;
            const now = Math.floor(Date.now() / 1000);
            if (now - messageTime > 60) return;
            
            const message = await smsg(sock, msg, store);
            await handleMessage(sock, message, config);
            
        } catch (error) {
            console.error(chalk.red('Error handling message:'), error.message);
        }
    });

    // Handle calls (auto reject)
    sock.ev.on('call', async (callData) => {
        for (const call of callData) {
            console.log(chalk.yellow('Incoming call from:'), call.from);
            try {
                await sock.rejectCall(call.id, call.from);
                console.log(chalk.green('Call rejected'));
            } catch (error) {
                console.error(chalk.red('Error rejecting call:'), error.message);
            }
        }
    });

    return sock;
}

// Start the bot with error handling
async function initialize() {
    try {
        await startBot();
    } catch (error) {
        console.error(chalk.red('Failed to start bot:'), error.message);
        console.log(chalk.yellow('Retrying in 5 seconds...'));
        setTimeout(initialize, 5000);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log(chalk.yellow('\nBot stopped gracefully'));
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error.message);
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled Rejection:'), error.message);
});

// Display startup banner
console.log(chalk.blue(`
┌─────────────────────────────────────┐
│        Simple WhatsApp Bot          │
│      Optimized for Android          │
│         Starting up...              │
└─────────────────────────────────────┘
`));

// Initialize bot
initialize();
