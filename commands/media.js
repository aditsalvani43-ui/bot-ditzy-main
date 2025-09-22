const { 
    downloadContentFromMessage, 
    generateWAMessageFromContent 
} = require('@whiskeysockets/baileys');
const { createSticker, getBuffer, formatSize } = require('../lib/functions');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const mediaCommands = {
    // Reveal view once message
    rvo: async (sock, m, args, text, isOwner, config) => {
        if (!m.quoted) {
            return await sock.sendMessage(m.chat, {
                text: 'Reply to a view once message!'
            }, { quoted: m });
        }

        try {
            let media;
            let type;
            let caption = '';

            // Handle different view once message types
            if (m.quoted.mtype === 'viewOnceMessageV2') {
                const viewOnceMsg = m.quoted.message.viewOnceMessageV2.message;
                type = Object.keys(viewOnceMsg)[0];
                media = viewOnceMsg[type];
                caption = media.caption || '';

            } else if (m.quoted.mtype === 'viewOnceMessage') {
                const viewOnceMsg = m.quoted.message.viewOnceMessage.message;
                type = Object.keys(viewOnceMsg)[0];
                media = viewOnceMsg[type];
                caption = media.caption || '';

            } else {
                return await sock.sendMessage(m.chat, {
                    text: 'This is not a view once message!'
                }, { quoted: m });
            }

            if (type === 'imageMessage') {
                const buffer = await downloadContentFromMessage(media, 'image');
                let imageBuffer = Buffer.from([]);
                for await (const chunk of buffer) {
                    imageBuffer = Buffer.concat([imageBuffer, chunk]);
                }

                await sock.sendMessage(m.chat, {
                    image: imageBuffer,
                    caption: caption || 'View once image revealed!'
                }, { quoted: m });

            } else if (type === 'videoMessage') {
                const buffer = await downloadContentFromMessage(media, 'video');
                let videoBuffer = Buffer.from([]);
                for await (const chunk of buffer) {
                    videoBuffer = Buffer.concat([videoBuffer, chunk]);
                }

                await sock.sendMessage(m.chat, {
                    video: videoBuffer,
                    caption: caption || 'View once video revealed!'
                }, { quoted: m });

            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Unsupported view once message type!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('RVO Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Failed to reveal view once message!\nMake sure you replied to a view once message.'
            }, { quoted: m });
        }
    },

    // Create sticker
    sticker: async (sock, m, args, text, isOwner, config) => {
        try {
            let media;

            if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'videoMessage')) {
                media = await downloadContentFromMessage(m.quoted.msg, m.quoted.mtype.replace('Message', ''));
            } else if (m.mtype === 'imageMessage' || m.mtype === 'videoMessage') {
                media = await downloadContentFromMessage(m.msg, m.mtype.replace('Message', ''));
            } else {
                return await sock.sendMessage(m.chat, {
                    text: 'Reply to an image or video, or send an image/video with the command!'
                }, { quoted: m });
            }

            let buffer = Buffer.from([]);
            for await (const chunk of media) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Check file size (max 10MB for sticker)
            if (buffer.length > 10 * 1024 * 1024) {
                return await sock.sendMessage(m.chat, {
                    text: 'File too large! Maximum size is 10MB.'
                }, { quoted: m });
            }

            const packname = args[0] || config.botName;
            const author = args[1] || 'Simple Bot';

            await sock.sendMessage(m.chat, {
                text: 'Creating sticker, please wait...'
            }, { quoted: m });

            const stickerBuffer = await createSticker(buffer, packname, author);

            if (stickerBuffer) {
                await sock.sendMessage(m.chat, {
                    sticker: stickerBuffer
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Failed to create sticker!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('Sticker Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Error creating sticker!'
            }, { quoted: m });
        }
    },

    // Convert sticker to image
    toimg: async (sock, m, args, text, isOwner, config) => {
        if (!m.quoted || m.quoted.mtype !== 'stickerMessage') {
            return await sock.sendMessage(m.chat, {
                text: 'Reply to a sticker!'
            }, { quoted: m });
        }

        try {
            const media = await downloadContentFromMessage(m.quoted.msg, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of media) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await sock.sendMessage(m.chat, {
                text: 'Converting sticker to image...'
            }, { quoted: m });

            // Convert WebP to PNG (optimized for Android)
            const imageBuffer = await sharp(buffer)
                .png({
                    quality: 90,
                    compressionLevel: 6
                })
                .toBuffer();

            await sock.sendMessage(m.chat, {
                image: imageBuffer,
                caption: 'Sticker converted to image!'
            }, { quoted: m });

        } catch (error) {
            console.error('ToImg Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Failed to convert sticker!'
            }, { quoted: m });
        }
    },

    // Play music
    music: async (sock, m, args, text, isOwner, config) => {
        try {
            const musicPath = './media/music.mp3';

            // Check if music file exists
            if (!await fs.pathExists(musicPath)) {
                return await sock.sendMessage(m.chat, {
                    text: 'Music file not found!\nPlease add music.mp3 to the media folder.'
                }, { quoted: m });
            }

            await sock.sendMessage(m.chat, {
                text: 'Playing music...'
            }, { quoted: m });

            const musicBuffer = await fs.readFile(musicPath);

            await sock.sendMessage(m.chat, {
                audio: musicBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: 'Bot Music Player',
                        body: config.botName,
                        thumbnailUrl: '',
                        sourceUrl: '',
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Music Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Failed to play music!'
            }, { quoted: m });
        }
    },

    // Send welcome image
    welcome: async (sock, m, args, text, isOwner, config) => {
        try {
            const welcomePath = './media/welcome.jpg';

            // Check if welcome image exists
            if (!await fs.pathExists(welcomePath)) {
                return await sock.sendMessage(m.chat, {
                    text: 'Welcome image not found!\nPlease add welcome.jpg to the media folder.'
                }, { quoted: m });
            }

            const welcomeBuffer = await fs.readFile(welcomePath);
            const welcomeText = `
🎉 Welcome to ${config.botName}! 🎉

👋 Hello ${m.name || 'User'}!
🤖 I'm a WhatsApp bot ready to help you.

📝 Use *${config.prefix}menu* to see available commands.
💡 Need help? Contact owner: @${config.owner[0]}

Thank you for using our bot! ❤️
            `.trim();

            await sock.sendMessage(m.chat, {
                image: welcomeBuffer,
                caption: welcomeText,
                contextInfo: {
                    mentionedJid: [`${config.owner[0]}@s.whatsapp.net`]
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Welcome Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Failed to send welcome message!'
            }, { quoted: m });
        }
    },

    // Get media info
    mediainfo: async (sock, m, args, text, isOwner, config) => {
        if (!m.quoted || !['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(m.quoted.mtype)) {
            return await sock.sendMessage(m.chat, {
                text: 'Reply to a media message!'
            }, { quoted: m });
        }

        try {
            const msg = m.quoted.msg;
            const type = m.quoted.mtype.replace('Message', '');

            let info = `📄 Media Information\n\n`;
            info += `🎭 Type: ${type.charAt(0).toUpperCase() + type.slice(1)}\n`;
            info += `📦 Size: ${formatSize(msg.fileLength || 0)}\n`;
            info += `🎪 MIME: ${msg.mimetype || 'Unknown'}\n`;

            if (msg.width && msg.height) {
                info += `📐 Dimensions: ${msg.width}x${msg.height}\n`;
            }

            if (msg.seconds) {
                info += `⏱️ Duration: ${Math.floor(msg.seconds / 60)}:${(msg.seconds % 60).toString().padStart(2, '0')}\n`;
            }

            if (msg.fileName) {
                info += `📝 Filename: ${msg.fileName}\n`;
            }

            if (msg.caption) {
                info += `💬 Caption: ${msg.caption}\n`;
            }

            await sock.sendMessage(m.chat, {
                text: info.trim()
            }, { quoted: m });

        } catch (error) {
            console.error('MediaInfo Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Failed to get media information!'
            }, { quoted: m });
        }
    },

    // Get image from URL
    getimg: async (sock, m, args, text, isOwner, config) => {
        if (!text) {
            return await sock.sendMessage(m.chat, {
                text: 'Please provide an image URL!\nUsage: .getimg <url>'
            }, { quoted: m });
        }

        try {
            // Simple URL validation
            if (!text.startsWith('http')) {
                return await sock.sendMessage(m.chat, {
                    text: 'Please provide a valid URL (starting with http/https)'
                }, { quoted: m });
            }

            await sock.sendMessage(m.chat, {
                text: 'Getting image from URL...'
            }, { quoted: m });

            const imageBuffer = await getBuffer(text);

            if (imageBuffer) {
                await sock.sendMessage(m.chat, {
                    image: imageBuffer,
                    caption: `Image downloaded from URL\nSource: ${text}`
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Failed to get image from URL!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('GetImg Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Error getting image from URL!'
            }, { quoted: m });
        }
    }
};

module.exports = mediaCommands;
