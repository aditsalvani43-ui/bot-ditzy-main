const { getBuffer, fetchJson } = require('../lib/functions');

const funCommands = {
    // Say command
    say: async (sock, m, args, text, isOwner, config) => {
        if (!text) {
            return await sock.sendMessage(m.chat, {
                text: 'Please provide text to say!\nUsage: .say <text>'
            }, { quoted: m });
        }

        await sock.sendMessage(m.chat, {
            text: text
        });
    },

    // Reverse text
    reverse: async (sock, m, args, text, isOwner, config) => {
        if (!text) {
            return await sock.sendMessage(m.chat, {
                text: 'Please provide text to reverse!\nUsage: .reverse <text>'
            }, { quoted: m });
        }

        const reversed = text.split('').reverse().join('');

        await sock.sendMessage(m.chat, {
            text: `Reversed Text:\n${reversed}`
        }, { quoted: m });
    },

    // Calculator
    calculate: async (sock, m, args, text, isOwner, config) => {
        if (!text) {
            return await sock.sendMessage(m.chat, {
                text: 'Please provide a math expression!\nUsage: .calculate <expression>\nExample: .calculate 2 + 2'
            }, { quoted: m });
        }

        try {
            // Simple calculator (basic operations only for security)
            const expression = text.replace(/[^0-9+\-*/.() ]/g, '');

            if (!expression) {
                return await sock.sendMessage(m.chat, {
                    text: 'Invalid expression! Only numbers and basic operators (+, -, *, /, (), .) are allowed.'
                }, { quoted: m });
            }

            const result = eval(expression);

            if (isNaN(result)) {
                return await sock.sendMessage(m.chat, {
                    text: 'Invalid calculation result!'
                }, { quoted: m });
            }

            await sock.sendMessage(m.chat, {
                text: `Calculator\n\nExpression: ${text}\nResult: ${result}`
            }, { quoted: m });

        } catch (error) {
            await sock.sendMessage(m.chat, {
                text: 'Invalid math expression!'
            }, { quoted: m });
        }
    },

    // QR Code generator
    qr: async (sock, m, args, text, isOwner, config) => {
        if (!text) {
            return await sock.sendMessage(m.chat, {
                text: 'Please provide text to generate QR code!\nUsage: .qr <text>'
            }, { quoted: m });
        }

        try {
            await sock.sendMessage(m.chat, {
                text: 'Generating QR code...'
            }, { quoted: m });

            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            const qrBuffer = await getBuffer(qrUrl);

            if (qrBuffer) {
                await sock.sendMessage(m.chat, {
                    image: qrBuffer,
                    caption: `QR Code Generated\n\nContent: ${text}`
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Failed to generate QR code!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('QR Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Error generating QR code!'
            }, { quoted: m });
        }
    },

    // Random quote
    quote: async (sock, m, args, text, isOwner, config) => {
        try {
            await sock.sendMessage(m.chat, {
                text: 'Getting random quote...'
            }, { quoted: m });

            const response = await fetchJson('https://api.quotable.io/random');

            if (response && response.content) {
                const quoteText = `Random Quote\n\n"${response.content}"\n\n— ${response.author}`;

                await sock.sendMessage(m.chat, {
                    text: quoteText
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Failed to get quote!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('Quote Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Error getting quote!'
            }, { quoted: m });
        }
    },

    // Random fact
    fact: async (sock, m, args, text, isOwner, config) => {
        try {
            await sock.sendMessage(m.chat, {
                text: 'Getting random fact...'
            }, { quoted: m });

            const response = await fetchJson('https://uselessfacts.jsph.pl/random.json?language=en');

            if (response && response.text) {
                const factText = `Random Fact\n\n${response.text}`;

                await sock.sendMessage(m.chat, {
                    text: factText
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.chat, {
                    text: 'Failed to get fact!'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('Fact Error:', error);
            await sock.sendMessage(m.chat, {
                text: 'Error getting fact!'
            }, { quoted: m });
        }
    },

    // Flip coin
    flip: async (sock, m, args, text, isOwner, config) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';

        await sock.sendMessage(m.chat, {
            text: `Coin Flip Result\n\nResult: ${result}`
        }, { quoted: m });
    },

    // Roll dice
    dice: async (sock, m, args, text, isOwner, config) => {
        const sides = parseInt(args[0]) || 6;

        if (sides < 2 || sides > 100) {
            return await sock.sendMessage(m.chat, {
                text: 'Dice sides must be between 2 and 100!\nUsage: .dice [sides] (default: 6)'
            }, { quoted: m });
        }

        const result = Math.floor(Math.random() * sides) + 1;

        await sock.sendMessage(m.chat, {
            text: `Dice Roll Result\n\nDice: D${sides}\nResult: ${result}`
        }, { quoted: m });
    },

    // Random number
    random: async (sock, m, args, text, isOwner, config) => {
        const min = parseInt(args[0]) || 1;
        const max = parseInt(args[1]) || 100;

        if (min >= max) {
            return await sock.sendMessage(m.chat, {
                text: 'Minimum value must be less than maximum!\nUsage: .random <min> <max>'
            }, { quoted: m });
        }

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        await sock.sendMessage(m.chat, {
            text: `Random Number\n\nRange: ${min} - ${max}\nResult: ${result}`
        }, { quoted: m });
    }
};

module.exports = funCommands;
