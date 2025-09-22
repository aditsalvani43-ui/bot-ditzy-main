const chalk = require('chalk');
const moment = require('moment-timezone');

// Import command modules
const basicCommands = require('../commands/basic');
const mediaCommands = require('../commands/media');
const funCommands = require('../commands/fun');

const handleMessage = async (sock, m, config) => {
    try {
        if (!m.body) return;
        
        const isCmd = m.body.startsWith(config.prefix);
        const command = isCmd ? m.body.slice(config.prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = m.body.trim().split(' ').slice(1);
        const text = args.join(' ');
        
        // Log incoming message
        if (isCmd) {
            console.log(chalk.cyan('Command:'), {
                from: m.name || m.sender.split('@')[0],
                chat: m.isGroup ? 'Group' : 'Private',
                command: command,
                time: moment().tz(config.timezone).format('HH:mm:ss')
            });
        }
        
        // Auto typing
        if (config.autoTyping && isCmd) {
            await sock.sendPresenceUpdate('composing', m.chat);
        }
        
        // Auto read
        if (config.autoRead) {
            await sock.readMessages([m.key]);
        }
        
        // Command handling
        if (isCmd) {
            // Check if user is owner for restricted commands
            const isOwner = config.owner.includes(m.sender.split('@')[0]);
            
            // Handle button responses (commands with hyphens)
            const cleanCommand = command.replace(/-/g, '');
            
            // Basic commands
            if (basicCommands[command] || basicCommands[cleanCommand]) {
                const cmd = basicCommands[command] || basicCommands[cleanCommand];
                await cmd(sock, m, args, text, isOwner, config);
                return;
            }
            
            // Media commands
            if (mediaCommands[command] || mediaCommands[cleanCommand]) {
                const cmd = mediaCommands[command] || mediaCommands[cleanCommand];
                await cmd(sock, m, args, text, isOwner, config);
                return;
            }
            
            // Fun commands
            if (funCommands[command] || funCommands[cleanCommand]) {
                const cmd = funCommands[command] || funCommands[cleanCommand];
                await cmd(sock, m, args, text, isOwner, config);
                return;
            }
            
            // Command not found
            await sock.sendMessage(m.chat, {
                text: `Command *${command}* not found!\n\nType *${config.prefix}menu* to see available commands.`
            }, { quoted: m });
        }
        
        // Handle button interactions (without prefix)
        else if (m.body && (m.body.includes('-help') || ['music', 'welcome', 'ping', 'info'].includes(m.body))) {
            const buttonCmd = m.body.replace(config.prefix, '');
            const isOwner = config.owner.includes(m.sender.split('@')[0]);
            
            // Check in all command modules
            if (basicCommands[buttonCmd]) {
                await basicCommands[buttonCmd](sock, m, [], '', isOwner, config);
            } else if (mediaCommands[buttonCmd]) {
                await mediaCommands[buttonCmd](sock, m, [], '', isOwner, config);
            } else if (funCommands[buttonCmd]) {
                await funCommands[buttonCmd](sock, m, [], '', isOwner, config);
            }
        }
        
    } catch (error) {
        console.error(chalk.red('Handler Error:'), error.message);
        
        // Send error message to user
        try {
            await sock.sendMessage(m.chat, {
                text: 'An error occurred while processing your request.'
            }, { quoted: m });
        } catch (sendError) {
            console.error(chalk.red('Failed to send error message:'), sendError.message);
        }
    }
};

module.exports = { handleMessage };
