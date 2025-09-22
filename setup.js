const fs = require('fs-extra');
const chalk = require('chalk');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(chalk.blue(`
╔═══════════════════════════════════════╗
║     Simple WhatsApp Bot Setup         ║
║        Optimized for Android          ║
║            Version 1.0                ║
╚═══════════════════════════════════════╝
`));

async function setupBot() {
    try {
        console.log(chalk.yellow('Setting up your WhatsApp Bot for Android...\n'));
        
        // Create necessary directories
        console.log(chalk.cyan('Creating directories...'));
        await fs.ensureDir('./sessions/auth');
        await fs.ensureDir('./temp');
        await fs.ensureDir('./media');
        await fs.ensureDir('./logs');
        console.log(chalk.green('Directories created successfully!'));
        
        // Create media files
        console.log(chalk.cyan('\nCreating media files...'));
        await createMediaFiles();
        
        // Setup configuration
        console.log(chalk.cyan('\nSetting up configuration...'));
        
        const botName = await askQuestion('Enter bot name (default: Simple WA Bot): ') || 'Simple WA Bot';
        const prefix = await askQuestion('Enter command prefix (default: .): ') || '.';
        const ownerNumber = await askQuestion('Enter your WhatsApp number (with country code, e.g., 62812345678): ');
        const timezone = await askQuestion('Enter your timezone (default: Asia/Jakarta): ') || 'Asia/Jakarta';
        
        if (!ownerNumber) {
            throw new Error('Owner number is required!');
        }
        
        // Create config file
        const configContent = `module.exports = {
    // Bot basic configuration
    botName: '${botName}',
    prefix: '${prefix}',
    
    // Owner phone numbers (without +)
    owner: [
        '${ownerNumber}', // Your number
    ],
    
    // Timezone setting
    timezone: '${timezone}',
    
    // Bot behavior
    autoTyping: false,
    autoRead: false,
    
    // File upload limits (optimized for Android)
    maxFileSize: 50 * 1024 * 1024, // 50MB
    
    // API configurations
    apis: {},
    
    // Database configuration
    database: {
        type: 'json',
        path: './database.json'
    },
    
    // Message settings
    messages: {
        wait: 'Please wait...',
        error: 'An error occurred!',
        ownerOnly: 'This command is only for owners!'
    },
    
    // Feature toggles
    features: {
        antiSpam: true,
        antiLink: false,
        welcome: false
    },
    
    // Spam protection
    spam: {
        maxMessages: 5,
        timeframe: 10000,
        punishment: 'warn'
    },
    
    // Android optimizations
    android: {
        lowMemoryMode: true,
        cleanTempFiles: true,
        maxConcurrentDownloads: 2,
        compressionLevel: 6
    }
};`;
        
        await fs.writeFile('./config/config.js', configContent);
        console.log(chalk.green('Configuration file created successfully!'));
        
        // Create PM2 ecosystem
        const pm2Config = `module.exports = {
    apps: [{
        name: 'wa-bot',
        script: 'index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M', // Lower for Android
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};`;
        
        await fs.writeFile('./ecosystem.config.js', pm2Config);
        
        // Create start script
        const startScript = `#!/bin/bash
echo "Starting Simple WhatsApp Bot..."
echo "Make sure your phone is ready for pairing!"
echo ""
node index.js`;
        
        await fs.writeFile('./start.sh', startScript);
        await fs.chmod('./start.sh', '755');
        
        console.log(chalk.green('Setup completed successfully!\n'));
        
        console.log(chalk.blue('Your WhatsApp Bot is ready to use!'));
        console.log(chalk.yellow('\nNext steps:'));
        console.log(chalk.cyan('1. Run: npm start'));
        console.log(chalk.cyan('2. Enter your phone number when prompted'));
        console.log(chalk.cyan('3. Use the pairing code in WhatsApp'));
        console.log(chalk.cyan('4. Start using your bot!\n'));
        
        console.log(chalk.blue('Available commands:'));
        console.log(chalk.white(`${prefix}ping - Check bot speed`));
        console.log(chalk.white(`${prefix}menu - Show all commands`));
        console.log(chalk.white(`${prefix}rvo - Reveal view once messages`));
        console.log(chalk.white(`${prefix}sticker - Create sticker`));
        console.log(chalk.white(`${prefix}music - Play bot music`));
        console.log(chalk.white(`${prefix}welcome - Send welcome message\n`));
        
        console.log(chalk.magenta('Media files created:'));
        console.log(chalk.white('• media/music.mp3 - Replace with your music'));
        console.log(chalk.white('• media/welcome.jpg - Replace with your welcome image'));
        console.log(chalk.white('• media/thumb.jpg - Replace with your bot thumbnail\n'));
        
        console.log(chalk.green('Happy coding!'));
        
    } catch (error) {
        console.error(chalk.red('Setup failed:'), error.message);
    } finally {
        rl.close();
    }
}

// Function to create media files
async function createMediaFiles() {
    try {
        // Create sample music file (silent MP3)
        const musicPath = './media/music.mp3';
        const silentMP3 = Buffer.from([
            0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        await fs.writeFile(musicPath, silentMP3);
        
        // Create welcome image placeholder
        const welcomePath = './media/welcome.jpg';
        const thumbPath = './media/thumb.jpg';
        const minimalJPEG = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46,
            0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00,
            0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01,
            0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF,
            0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00,
            0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
        ]);
        
        await fs.writeFile(welcomePath, minimalJPEG);
        await fs.writeFile(thumbPath, minimalJPEG);
        
        // Create README for media folder
        const mediaReadme = `# Media Files for Android

## Required Files

### music.mp3
- Bot background music
- Max size: 25MB (optimized for Android)
- Format: MP3

### welcome.jpg
- Welcome message image
- Max size: 5MB
- Format: JPG/PNG
- Recommended: 1080x1080 pixels

### thumb.jpg
- Bot thumbnail image
- Max size: 1MB
- Format: JPG/PNG
- Recommended: 512x512 pixels

## Android Tips
- Keep file sizes small for better performance
- Use compressed images
- Avoid very high resolution files
- Test on your device first

## How to Replace
1. Copy your files to this folder
2. Rename exactly: music.mp3, welcome.jpg, thumb.jpg
3. Restart bot to load new files

Generated by Simple WhatsApp Bot Setup`;
        
        await fs.writeFile('./media/README.md', mediaReadme);
        console.log(chalk.green('Media files created successfully!'));
        
    } catch (error) {
        console.error(chalk.red('Error creating media files:'), error);
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(chalk.yellow(question), (answer) => {
            resolve(answer.trim());
        });
    });
}

// Run setup
setupBot();
