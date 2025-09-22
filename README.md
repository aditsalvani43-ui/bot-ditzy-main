# bot-ditzy-main
# 🤖 Simple WhatsApp Bot - Android Tutorial

WhatsApp bot dengan pairing code yang dioptimalkan khusus untuk perangkat Android, termasuk **Oppo A18** dan perangkat Android lainnya.

[![Android](https://img.shields.io/badge/Android-Optimized-green.svg)](https://android.com/)
[![Termux](https://img.shields.io/badge/Termux-Supported-brightgreen.svg)](https://termux.com/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-blue.svg)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.8+-orange.svg)](https://github.com/WhiskeySockets/Baileys)

## 📱 Fitur Khusus Android

### Auto-Play Media saat `.menu`
- 🎵 **Musik otomatis** play setelah 3 detik
- 🖼️ **Welcome image** kirim otomatis setelah 1.5 detik  
- 📱 **Thumbnail** muncul di semua pesan bot
- 🎛️ **Interactive menu** dengan auto-play system

### Optimasi Android
- 🔋 **Low Memory Mode** - Hemat RAM untuk Android
- 🧹 **Auto Cleanup** - Hapus file temporary otomatis
- 📊 **Memory Management** - Monitor usage memory
- ⚡ **Fast Performance** - Optimized untuk Android

## 📋 Requirements

- **Device**: Android 7.0+ (seperti Oppo A18)
- **RAM**: Minimal 2GB (recommended 3GB+)
- **Storage**: 500MB free space
- **Internet**: Koneksi stable
- **WhatsApp**: Active WhatsApp account

## 🚀 Installation Tutorial (Termux)

### Method 1: Auto Installation (Recommended)

#### Step 1: Install Termux
```bash
# Download Termux dari F-Droid (RECOMMENDED)
# Link: https://f-droid.org/packages/com.termux/

# Atau dari Google Play Store (jika tidak ada F-Droid)
```

#### Step 2: Setup Termux
```bash
# Buka Termux, jalankan:
termux-setup-storage
# Berikan permission storage saat diminta
```

#### Step 3: Run Auto Installer
```bash
# Download installer
curl -o install.sh https://your-repo/install-termux.sh

# Jalankan installer  
chmod +x install.sh
./install.sh
```

#### Step 4: Follow Installation
- Installer akan guide step by step
- Tunggu sampai selesai (10-15 menit)
- Jawab pertanyaan setup sesuai kebutuhan

### Method 2: Manual Installation

#### Step 1: Prepare Termux
```bash
# Update packages
pkg update && pkg upgrade -y

# Install dependencies
pkg install nodejs npm git curl wget python -y

# Setup storage
termux-setup-storage
```

#### Step 2: Create Project
```bash
# Pindah ke storage
cd /sdcard

# Buat project
mkdir simple-wa-bot
cd simple-wa-bot

# Buat struktur folder
mkdir -p config lib commands sessions/auth temp media logs
```

#### Step 3: Copy Files
Copy semua file dari artifacts ke folder yang sesuai:

```
simple-wa-bot/
├── index.js
├── package.json  
├── setup.js
├── config/
│   └── config.example.js
├── lib/
│   ├── functions.js
│   └── handler.js
└── commands/
    ├── basic.js
    ├── media.js
    └── fun.js
```

#### Step 4: Install Dependencies
```bash
# Install packages (tunggu 10-15 menit)
npm install
```

#### Step 5: Setup Bot
```bash
# Run setup wizard
node setup.js

# Atau copy config manual
cp config/config.example.js config/config.js
nano config/config.js
```

## ⚙️ Configuration untuk Android

Edit `config/config.js`:

```javascript
module.exports = {
    botName: 'My Awesome Bot',
    prefix: '.',
    owner: ['62812345678'], // Nomor WA kamu (tanpa +)
    timezone: 'Asia/Jakarta',
    
    // Android optimizations
    maxFileSize: 25 * 1024 * 1024, // 25MB (reduced for Android)
    android: {
        lowMemoryMode: true,        // Hemat memory
        cleanTempFiles: true,       // Auto cleanup
        maxConcurrentDownloads: 2,  // Limit download
        compressionLevel: 6         // Kompresi image
    }
};
```

## 🔗 Pairing Process (STEP BY STEP)

### Step 1: Start Bot
```bash
# Method 1: Normal start
npm start

# Method 2: Pakai script
./start-bot.sh
```

### Step 2: Input Phone Number
```
Enter your WhatsApp number: 62812345678
```
**Format**: Kode negara + nomor (tanpa +, tanpa 0 di depan)
- Indonesia: 62812345678  
- Malaysia: 60123456789
- Singapore: 6591234567

### Step 3: Get Pairing Code
Bot akan generate kode 8 digit:
```
Pairing Code: AB12-CD34
```

### Step 4: Pair dengan WhatsApp
1. Buka **WhatsApp** di HP
2. Pergi ke **Settings** (⚙️)
3. Pilih **Linked Devices** 
4. Tap **"Link a Device"**
5. Pilih **"Link with phone number instead"**
6. Masukkan kode: **AB12CD34**
7. Bot akan connect otomatis ✅

### Step 5: Test Bot
Kirim pesan ke bot:
```
.ping
.menu
.info
```

## 📱 Commands Available

### Basic Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `.ping` | Check bot response time | `.ping` |
| `.menu` | Interactive menu + auto-play media | `.menu` |
| `.info` | Bot & system information | `.info` |
| `.runtime` | Show bot uptime | `.runtime` |

### Media Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `.rvo` | Reveal view once messages | Reply to view once + `.rvo` |
| `.sticker` | Create sticker from media | Send image + `.sticker` |
| `.toimg` | Convert sticker to image | Reply to sticker + `.toimg` |
| `.music` | Play bot background music | `.music` |
| `.welcome` | Send welcome message | `.welcome` |
| `.getimg` | Get image from URL | `.getimg https://...` |

### Fun Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `.say` | Make bot say something | `.say Hello World` |
| `.reverse` | Reverse text | `.reverse Hello` |
| `.calculate` | Math calculator | `.calculate 2+2*5` |
| `.qr` | Generate QR code | `.qr Hello World` |
| `.quote` | Get random quote | `.quote` |
| `.flip` | Flip coin | `.flip` |
| `.dice` | Roll dice | `.dice` or `.dice 20` |
| `.random` | Random number | `.random 1 100` |

## 🎵 Auto-Play Media System

### Cara Kerja Auto-Play
Ketika user ketik **`.menu`**:

1. **Menu muncul** dengan thumbnail
2. **1.5 detik kemudian**: Welcome image terkirim otomatis
3. **3 detik kemudian**: Musik background auto-play
4. **Follow-up message**: Info musik sedang playing

### Custom Media Files
Ganti file ini dengan milik Anda:

#### 1. music.mp3 (Musik Background)
```bash
# Download musik favorit (format MP3)
# Max size: 25MB untuk Android
# Copy ke folder media/
cp /path/to/your-music.mp3 ./media/music.mp3
```

#### 2. welcome.jpg (Welcome Image)
```bash  
# Siapkan gambar welcome (JPG/PNG)
# Max size: 5MB untuk Android
# Recommended: 1080x1080 pixels
cp /path/to/your-welcome.jpg ./media/welcome.jpg
```

#### 3. thumb.jpg (Bot Thumbnail)
```bash
# Siapkan thumbnail bot (JPG/PNG) 
# Max size: 1MB untuk Android
# Recommended: 512x512 pixels
cp /path/to/your-thumb.jpg ./media/thumb.jpg
```

### Test Auto-Play
```bash
# Restart bot untuk load media baru
pm2 restart wa-bot

# Test di WhatsApp
.menu
```

## 🛠️ Production Setup (PM2)

### Install PM2
```bash
# Install PM2 globally
npm install -g pm2
```

### Start dengan PM2
```bash
# Method 1: Pakai script
./start-pm2.sh

# Method 2: Manual
pm2 start ecosystem.config.js
pm2 save
```

### PM2 Commands untuk Android
```bash
# Monitor bot (real-time)
pm2 monit

# Lihat logs
pm2 logs wa-bot

# Restart bot
pm2 restart wa-bot  

# Stop bot
pm2 stop wa-bot

# Status PM2
pm2 status
```

## 📊 Android Performance Tips

### Memory Management
```bash
# Check memory usage
free -h

# Check bot memory dengan command
.info

# Monitor PM2 memory
pm2 monit
```

### Keep Bot Running
```bash
# Jaga Termux tetap hidup:
# 1. Jangan tutup Termux
# 2. Disable battery optimization untuk Termux
# 3. Pakai PM2 untuk auto-restart
# 4. Set Termux sebagai persistent notification
```

### Battery Optimization
1. **Settings** → **Battery** → **Battery Optimization**
2. Cari **Termux**
3. Set ke **"Don't optimize"**
4. Apply settings

## 🔧 Troubleshooting Android

### Bot Tidak Connect
```bash
# Hapus session lama
rm -rf sessions/auth/*

# Restart bot
npm start

# Pair ulang dengan WhatsApp
```

### Memory Habis
```bash
# Restart Termux
exit
# Buka Termux lagi

# Atau restart dengan PM2
pm2 restart wa-bot
```

### Commands Tidak Jalan
```bash
# Check prefix di config
nano config/config.js

# Check logs error
pm2 logs wa-bot

# Restart bot
pm2 restart wa-bot
```

### Installation Error
```bash
# Clear cache
npm cache clean --force

# Install ulang
rm -rf node_modules package-lock.json
npm install --force
```

### Sharp Installation Failed (Common di Android)
```bash
# Install sharp dengan flag khusus
npm install sharp --platform=linux --arch=arm64

# Atau skip sharp (bot tetap jalan tanpa sticker)
npm install --ignore-scripts
```

## 📱 Android Device Specific

### Oppo A18 Optimization
```javascript
// Di config/config.js
android: {
    lowMemoryMode: true,        // Wajib untuk Oppo A18
    maxConcurrentDownloads: 1,  // Limit download
    compressionLevel: 8,        // Kompresi tinggi
    cleanTempFiles: true        // Auto cleanup
}
```

### Xiaomi/Redmi
```bash
# Disable MIUI optimization di Developer Options
# Enable "Don't keep activities" = OFF
# Set battery optimization = OFF untuk Termux
```

### Samsung Galaxy
```bash
# Disable adaptive battery untuk Termux
# Add Termux ke "Never sleeping apps"
# Set background app limits = OFF
```

### General Android Tips
```bash
# 1. Keep Termux in recent apps
# 2. Don't use task killers  
# 3. Ensure stable internet
# 4. Monitor storage space
# 5. Regular restart device
```

## 🔄 Update Bot

### Auto Update
```bash
# Jika clone dari GitHub
git pull origin main
npm install
pm2 restart wa-bot
```

### Manual Update
```bash
# Download file baru
# Replace file lama
# Restart bot
pm2 restart wa-bot
```

## 📋 File Structure

```
simple-wa-bot/
├── index.js                 # Main bot (pairing code)
├── package.json            # Dependencies Android-optimized  
├── setup.js                # Interactive setup
├── install-termux.sh       # Auto installer
├── start-bot.sh           # Startup script
├── start-pm2.sh           # PM2 startup
├── config/
│   ├── config.js          # Your configuration
│   └── config.example.js  # Template
├── lib/
│   ├── functions.js       # Helper functions
│   └── handler.js         # Message handler
├── commands/
│   ├── basic.js          # Basic commands + enhanced menu
│   ├── media.js          # Media commands + auto-play
│   └── fun.js            # Fun commands
├── media/
│   ├── music.mp3         # Background music (auto-play)
│   ├── welcome.jpg       # Welcome image (auto-send)  
│   └── thumb.jpg         # Bot thumbnail
├── sessions/auth/        # Session files (auto-generated)
├── temp/                 # Temporary files
└── logs/                 # PM2 logs
```

## 🆘 Support

### Common Issues
- **Pairing gagal**: Pastikan nomor HP format benar
- **Bot lemot**: Restart Termux, close app lain
- **Memory error**: Enable low memory mode di config
- **Commands tidak respon**: Check prefix dan logs

### Get Help
- Check logs: `pm2 logs wa-bot`
- Monitor: `pm2 monit` 
- Test connection: `.ping`
- Bot info: `.info`

## ⚠️ Important Notes

### Security
- Jangan share file sessions/ ke orang lain
- Backup sessions/ secara rutin
- Jangan gunakan untuk spam
- Ikuti Terms of Service WhatsApp

### Performance
- Bot consume ~100-200MB RAM
- Storage usage ~50-100MB
- CPU usage minimal saat idle
- Network usage tergantung aktivitas

### Battery Impact
- Termux running = battery drain
- Use PM2 untuk efficiency  
- Monitor dengan battery stats
- Optimize settings sesuai device

---

## 🎉 Congratulations!

Bot WhatsApp Anda sudah siap dan optimized untuk Android!

**Key Features:**
- ✅ Pairing code connection
- ✅ Auto-play musik saat .menu
- ✅ Welcome image auto-send
- ✅ 20+ commands ready
- ✅ Android memory optimization
- ✅ PM2 production ready

**Test Commands:**
```
.menu    → See auto-play system
.ping    → Test response
.rvo     → Reveal view once  
.sticker → Create stickers
```

Selamat menggunakan bot WhatsApp Android Anda! 🚀📱
