module.exports = {
    // Bot basic configuration
    botName: 'Ditzy Time',
    prefix: '.',
    
    // Owner phone numbers (without +)
    owner: [
        '6281234567890', // Replace with your number
        // Add more owners if needed
    ],
    
    // Timezone setting
    timezone: 'Asia/Jakarta', // Change to your timezone
    
    // Bot behavior
    autoTyping: false,      // Auto typing when processing commands
    autoRead: false,        // Auto read incoming messages
    
    // File upload limits (optimized for Android)
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes (reduced for Android)
    
    // API configurations (optional)
    apis: {
        // Add your API keys here if needed
    },
    
    // Database configuration (for future use)
    database: {
        type: 'json',
        path: './database.json'
    },
    
    // Message settings
    messages: {
        wait: 'Please wait...',
        error: 'An error occurred!',
        ownerOnly: 'This command is only for owners!',
        groupOnly: 'This command can only be used in groups!',
        privateOnly: 'This command can only be used in private chat!',
        adminOnly: 'This command is only for group admins!',
        botAdminOnly: 'Bot must be admin to use this command!'
    },
    
    // Feature toggles
    features: {
        antiSpam: true,
        antiLink: false,
        welcome: false,
        autoSticker: false,
        autoDownload: false
    },
    
    // Spam protection
    spam: {
        maxMessages: 5,
        timeframe: 10000,
        punishment: 'warn'
    },
    
    // Android specific optimizations
    android: {
        lowMemoryMode: true,        // Enable memory optimizations
        cleanTempFiles: true,       // Auto cleanup temp files
        maxConcurrentDownloads: 2,  // Limit concurrent downloads
        compressionLevel: 6         // Image compression level
    }
};
