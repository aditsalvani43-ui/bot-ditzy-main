const { runtime, formatSize } = require('../lib/functions');
const fs = require('fs-extra');
const os = require('os');

const basicCommands = {
    // Ping command
    ping: async (sock, m, args, text, isOwner, config) => {
        const start = Date.now();
        const msg = await sock.sendMessage(m.chat, {
            text: 'Calculating ping...'
        }, { quoted: m });

        const end = Date.now();
        const ping = end - start;

        await sock.sendMessage(m.chat, {
            text: `Pong!\nSpeed: ${ping}ms`,
            edit: msg.key
        });
    },

    // Enhanced Menu command with auto-play
    menu: async (sock, m, args, text, isOwner, config) => {
        const uptime = process.uptime();

        try {
            // Check media files
            const welcomePath = './media/welcome.jpg';
            const musicPath = './media/music.mp3';
            const thumbPath = './media/thumb.jpg';

            let welcomeBuffer = null;
            let musicBuffer = null;
            let thumbBuffer = null;

            if (await fs.pathExists(welcomePath)) {
                welcomeBuffer = await fs.readFile(welcomePath);
            }
            if (await fs.pathExists(musicPath)) {
                musicBuffer = await fs.readFile(musicPath);
            }
            if (await fs.pathExists(thumbPath)) {
                thumbBuffer = await fs.readFile(thumbPath);
            }

            const menuText = `
╭─────────────────────╮
│      ${config.botName}      │
╰─────────────────────╯

🤖 Welcome ${m.name || 'User'}!

📊 Bot Information
⏱️ Runtime: ${runtime(uptime)}
👤 Owner: @${config.owner[0]}
🎯 Prefix: ${config.prefix}

📋 BASIC COMMANDS
${config.prefix}ping - Check bot speed
${config.prefix}menu - Show this menu
${config.prefix}info - Bot information
${config.prefix}runtime - Bot uptime

🎨 MEDIA COMMANDS
${config.prefix}rvo - Reveal view once
${config.prefix}sticker - Create sticker
${config.prefix}toimg - Convert sticker to image
${config.prefix}music - Play bot music
${config.prefix}welcome - Send welcome message

🎮 FUN COMMANDS
${config.prefix}say - Make bot say something
${config.prefix}reverse - Reverse text
${config.prefix}calculate - Calculator
${config.prefix}qr - Generate QR code
${config.prefix}quote - Random quote

Music & Welcome will auto-play!
            `.trim();

            // Send menu with thumbnail
            await sock.sendMessage(m.chat, {
                text: menuText,
                contextInfo: {
                    mentionedJid: [`${config.owner[0]}@s.whatsapp.net`],
                    externalAdReply: {
                        title: `${config.botName} Menu`,
                        body: `Tap for quick actions!`,
                        thumbnailUrl: '',
                        sourceUrl: '',
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: true,
                        thumbnail: thumbBuffer || null
                    }
                }
            }, { quoted: m });

            // Auto-send welcome image (delayed)
            if (welcomeBuffer) {
                setTimeout(async () => {
                    const welcomeText = `
🎉 Auto-Welcome Activated!

👋 Hello ${m.name || 'User'}!
🤖 Welcome to ${config.botName}!

✨ What can I do?
🔓 Reveal view once messages
🎨 Create awesome stickers  
🎵 Play music & media
🧮 Calculate math problems
📱 Generate QR codes

💡 Quick Start:
• Type ${config.prefix}ping to test
• Need help? Type ${config.prefix}info

Enjoy your bot experience! ❤️
                    `.trim();

                    await sock.sendMessage(m.chat, {
                        image: welcomeBuffer,
                        caption: welcomeText,
                        contextInfo: {
                            mentionedJid: [`${config.owner[0]}@s.whatsapp.net`]
                        }
                    });
                }, 1500);
            }

            // Auto-send music (delayed more)
            if (musicBuffer) {
                setTimeout(async () => {
                    await sock.sendMessage(m.chat, {
                        audio: musicBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        contextInfo: {
                            externalAdReply: {
                                title: 'Bot Theme Music',
                                body: `${config.botName} - Now Playing!`,
                                thumbnailUrl: '',
                                sourceUrl: '',
                                mediaType: 1,
                                showAdAttribution: false,
                                renderLargerThumbnail: true,
                                thumbnail: thumbBuffer || null
                            }
                        }
                    });

                    // Send music info
                    await sock.sendMessage(m.chat, {
                        text: `🎵 Music Auto-Play 🎵\n\n🎶 Bot theme music is now playing!\n🎧 Enjoy the vibe while using commands\n\nYou can replay anytime with ${config.prefix}music`,
                    });
                }, 3000);
            }

        } catch (error) {
            console.error('Enhanced Menu Error:', error);
            
            // Fallback to simple menu
            const fallbackText = `
🤖 ${config.botName} Menu

📋 Basic: ping, menu, info, runtime
🎨 Media: rvo, sticker, music, welcome  
🎮 Fun: calculate, qr, quote, flip

📊 Runtime: ${runtime(uptime)}
👤 Owner: @${config.owner[0]}

Commands ready to use!
            `.trim();

            await sock.sendMessage(m.chat, {
                text: fallbackText,
                contextInfo: {
                    mentionedJid: [`${config.owner[0]}@s.whatsapp.net`]
                }
            }, { quoted: m });
        }
    },

    // Info command
    info: async (sock, m, args, text, isOwner, config) => {
        const used = process.memoryUsage();
        const infoText = `
┌─ 🤖 BOT INFORMATION
├ Name: ${config.botName}
├ Version: 1.0.0
├ Platform: ${os.platform()}
├ Node.js: ${process.version}
├ Architecture: ${os.arch()}
└ Owner: @${config.owner[0]}

┌─ 💾 MEMORY USAGE
├ RSS: ${formatSize(used.rss)}
├ Heap Total: ${formatSize(used.heapTotal)}
├ Heap Used: ${formatSize(used.heapUsed)}
├ External: ${formatSize(used.external)}
└ Array Buffers: ${formatSize(used.arrayBuffers)}

┌─ 🖥️ SERVER INFO
├ CPU: ${os.cpus()[0].model}
├ Cores: ${os.cpus().length}
├ Free RAM: ${formatSize(os.freemem())}
├ Total RAM: ${formatSize(os.totalmem())}
└ Load Average: ${os.loadavg().map(x => x.toFixed(2)).join(', ')}

Bot is running smoothly!
        `.trim();

        await sock.sendMessage(m.chat, {
            text: infoText,
            contextInfo: {
                mentionedJid: [`${config.owner[0]}@s.whatsapp.net`]
            }
        }, { quoted: m });
    },

    // Runtime command
    runtime: async (sock, m, args, text, isOwner, config) => {
        const uptime = process.uptime();

        await sock.sendMessage(m.chat, {
            text: `⏰ Bot Runtime\n⏱️ ${runtime(uptime)}`
        }, { quoted: m });
    },

    // Owner only restart command
    restart: async (sock, m, args, text, isOwner, config) => {
        if (!isOwner) {
            return await sock.sendMessage(m.chat, {
                text: 'This command is only for owners!'
            }, { quoted: m });
        }

        await sock.sendMessage(m.chat, {
            text: 'Restarting bot...'
        }, { quoted: m });

        process.exit(0);
    },

    // Helper commands for button responses
    'basic-help': async (sock, m, args, text, isOwner, config) => {
        const basicHelp = `
📋 BASIC COMMANDS

${config.prefix}ping
└ Check bot response time

${config.prefix}menu  
└ Show main menu with auto-play

${config.prefix}info
└ Detailed bot & system info

${config.prefix}runtime
└ Show how long bot has been running

${config.prefix}restart (owner only)
└ Restart the bot

💡 Usage Examples:
• ${config.prefix}ping
• ${config.prefix}info
        `.trim();

        await sock.sendMessage(m.chat, {
            text: basicHelp
        }, { quoted: m });
    },

    'media-help': async (sock, m, args, text, isOwner, config) => {
        const mediaHelp = `
🎨 MEDIA COMMANDS

${config.prefix}rvo
└ Reveal view once messages (reply to view once)

${config.prefix}sticker
└ Create sticker from image/video

${config.prefix}toimg  
└ Convert sticker to image

${config.prefix}music
└ Play bot background music

${config.prefix}welcome
└ Send welcome message with image

💡 Usage Examples:
• Reply to view once: ${config.prefix}rvo
• Send image + ${config.prefix}sticker
        `.trim();

        await sock.sendMessage(m.chat, {
            text: mediaHelp
        }, { quoted: m });
    },

    'fun-help': async (sock, m, args, text, isOwner, config) => {
        const funHelp = `
🎮 FUN COMMANDS

${config.prefix}say <text>
└ Make bot say something

${config.prefix}reverse <text>
└ Reverse your text

${config.prefix}calculate <math>
└ Solve math problems

${config.prefix}qr <text>
└ Generate QR code

${config.prefix}quote
└ Get inspirational quotes

💡 Usage Examples:
• ${config.prefix}calculate 2+2*5
• ${config.prefix}qr Hello World
        `.trim();

        await sock.sendMessage(m.chat, {
            text: funHelp
        }, { quoted: m });
    }
};

module.exports = basicCommands;
