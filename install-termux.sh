#!/bin/bash

# WhatsApp Bot Auto Installer for Termux (Android Optimized)
# Specially optimized for Android devices like Oppo A18

clear
echo "╔══════════════════════════════════════════╗"
echo "║     Simple WhatsApp Bot Installer        ║"
echo "║        Optimized for Android             ║"
echo "║         Termux Version 1.0               ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${MAGENTA}[STEP]${NC} $1"
}

# Check Android device info
check_device_info() {
    echo -e "${CYAN}Android Device Information:${NC}"
    if [ -f "/system/build.prop" ]; then
        BRAND=$(getprop ro.product.brand 2>/dev/null || echo "Unknown")
        MODEL=$(getprop ro.product.model 2>/dev/null || echo "Unknown")
        VERSION=$(getprop ro.build.version.release 2>/dev/null || echo "Unknown")
        echo "Brand: $BRAND"
        echo "Model: $MODEL" 
        echo "Android: $VERSION"
    fi
    echo ""
}

# Check if running in Termux
if [[ ! -d "/data/data/com.termux" ]]; then
    print_error "This script is designed for Termux only!"
    echo "Please install Termux from F-Droid and run this script inside Termux."
    echo "F-Droid link: https://f-droid.org/packages/com.termux/"
    exit 1
fi

print_status "WhatsApp Bot installation starting..."
check_device_info

# Check available storage
available_space=$(df /data/data/com.termux | tail -1 | awk '{print $4}')
if [ "$available_space" -lt 500000 ]; then
    print_warning "Low storage space detected. Please free up some space."
fi

# Step 1: Update packages (with Android optimizations)
print_header "Step 1/7: Updating Termux packages"
print_status "This may take a few minutes on Android devices..."
pkg update -y
if [ $? -eq 0 ]; then
    print_success "Packages updated successfully"
else
    print_warning "Some packages failed to update, continuing anyway"
fi

pkg upgrade -y
echo ""

# Step 2: Install required packages (Android optimized versions)
print_header "Step 2/7: Installing required packages for Android"
print_status "Installing Node.js, npm, git, and other tools..."

# Install packages one by one for better error handling on Android
packages=("nodejs" "npm" "git" "curl" "wget" "python")
for package in "${packages[@]}"; do
    print_status "Installing $package..."
    pkg install $package -y
    if [ $? -eq 0 ]; then
        print_success "$package installed"
    else
        print_warning "$package installation failed, but continuing"
    fi
done

# Verify critical installations
echo ""
print_status "Verifying installations:"
if command -v node &> /dev/null; then
    echo -e "${GREEN}Node.js: $(node --version)${NC}"
else
    print_error "Node.js installation failed!"
    exit 1
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}NPM: $(npm --version)${NC}"
else
    print_error "NPM installation failed!"
    exit 1
fi

if command -v git &> /dev/null; then
    echo -e "${GREEN}Git: $(git --version)${NC}"
else
    print_error "Git installation failed!"
    exit 1
fi

echo ""

# Step 3: Setup storage access
print_header "Step 3/7: Setting up storage access"
print_status "Configuring Termux storage access..."
termux-setup-storage
sleep 2
print_success "Storage access configured"
echo ""

# Step 4: Navigate to storage and create project
print_header "Step 4/7: Setting up project directory"

# Try different storage locations for Android compatibility
if [ -d "/sdcard" ] && [ -w "/sdcard" ]; then
    cd /sdcard
    print_status "Using /sdcard for project location"
elif [ -d "/storage/emulated/0" ] && [ -w "/storage/emulated/0" ]; then
    cd /storage/emulated/0
    print_status "Using /storage/emulated/0 for project location"
else
    cd ~
    print_status "Using home directory for project location"
fi

print_status "Current directory: $(pwd)"

# Check if project directory exists
if [ -d "simple-wa-bot" ]; then
    print_warning "Project directory already exists"
    echo -n "Remove existing directory? (y/n): "
    read remove_existing
    if [[ "$remove_existing" == "y" || "$remove_existing" == "Y" ]]; then
        rm -rf simple-wa-bot
        print_success "Existing directory removed"
    else
        print_error "Installation cancelled"
        exit 1
    fi
fi

# Create project structure
print_status "Creating project structure..."
mkdir -p simple-wa-bot
cd simple-wa-bot

# Create directories with proper Android permissions
mkdir -p {config,lib,commands,sessions/auth,temp,media,logs}
chmod 755 config lib commands sessions temp media logs
chmod 700 sessions/auth

print_success "Project structure created"
echo ""

# Step 5: Create package.json optimized for Android
print_header "Step 5/7: Setting up Node.js project"
print_status "Creating package.json optimized for Android devices..."

cat > package.json << 'EOF'
{
  "name": "simple-wa-bot",
  "version": "1.0.0",
  "description": "Simple WhatsApp Bot optimized for Android devices",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "setup": "node setup.js",
    "pm2:start": "pm2 start ecosystem.config.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.8",
    "axios": "^1.6.7",
    "chalk": "^4.1.2",
    "file-type": "^16.5.4",
    "fs-extra": "^11.2.0",
    "moment-timezone": "^0.5.45",
    "node-fetch": "^2.7.0",
    "pino": "^8.19.0",
    "qrcode-terminal": "^0.12.0",
    "sharp": "^0.33.2"
  }
}
EOF

print_success "package.json created"
echo ""

# Step 6: Install dependencies (Android optimized)
print_header "Step 6/7: Installing Node.js dependencies"
print_status "Installing dependencies... This may take 10-15 minutes on Android"
print_warning "Keep Termux running in the foreground during installation"

# Set npm config for Android
npm config set fetch-timeout 300000
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000

# Install with retry mechanism for Android
install_success=false
for i in {1..3}; do
    print_status "Installation attempt $i of 3..."
    if npm install --no-audit --no-fund --prefer-offline; then
        install_success=true
        break
    else
        print_warning "Installation attempt $i failed, retrying..."
        sleep 5
    fi
done

if [ "$install_success" = true ]; then
    print_success "Dependencies installed successfully"
else
    print_warning "Some dependencies may have failed, trying alternative approach..."
    npm install --force --no-audit --no-fund
fi

echo ""

# Step 7: Create essential bot files
print_header "Step 7/7: Creating bot files"
print_status "Creating essential bot files..."

# Create basic config template if not exists
if [ ! -f "config/config.example.js" ]; then
    print_status "Creating configuration template..."
    cat > config/config.example.js << 'EOF'
module.exports = {
    botName: 'Simple WA Bot',
    prefix: '.',
    owner: ['6281234567890'], // Replace with your number
    timezone: 'Asia/Jakarta',
    autoTyping: false,
    autoRead: false,
    maxFileSize: 25 * 1024 * 1024, // 25MB for Android
    apis: {},
    database: { type: 'json', path: './database.json' },
    messages: {
        wait: 'Please wait...',
        error: 'An error occurred!',
        ownerOnly: 'This command is only for owners!'
    },
    features: {
        antiSpam: true,
        antiLink: false,
        welcome: false
    },
    spam: {
        maxMessages: 5,
        timeframe: 10000,
        punishment: 'warn'
    },
    android: {
        lowMemoryMode: true,
        cleanTempFiles: true,
        maxConcurrentDownloads: 2,
        compressionLevel: 6
    }
};
EOF
fi

# Create startup scripts
print_status "Creating startup scripts..."

# Android-optimized start script
cat > start-bot.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting WhatsApp Bot on Android..."
echo "📱 Make sure your phone is ready for pairing!"
echo ""

# Check if config exists
if [ ! -f "config/config.js" ]; then
    echo "❌ Configuration file not found!"
    if [ -f "setup.js" ]; then
        echo "🔧 Running setup first..."
        node setup.js
    elif [ -f "config/config.example.js" ]; then
        echo "📝 Copying config template..."
        cp config/config.example.js config/config.js
        echo "✅ Config copied. Please edit config/config.js with your settings"
        echo "Then run this script again"
        exit 1
    else
        echo "❌ No config template found!"
        exit 1
    fi
fi

# Check memory and warn if low
free_mem=$(free | grep Mem | awk '{print $7}')
if [ "$free_mem" -lt 100000 ]; then
    echo "⚠️ Low memory detected. Consider closing other apps."
fi

# Start bot with Android optimizations  
export NODE_OPTIONS="--max-old-space-size=512"
echo "🤖 Starting bot..."
node index.js
EOF

chmod +x start-bot.sh

# PM2 script for Android
cat > start-pm2.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting bot with PM2 (Android optimized)..."

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create Android-optimized ecosystem config
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
    apps: [{
        name: 'wa-bot',
        script: 'index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '400M',
        node_args: '--max-old-space-size=512',
        env: { NODE_ENV: 'production' },
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        kill_timeout: 5000
    }]
};
EOFPM2
fi

# Start bot with PM2
pm2 start ecosystem.config.js
pm2 save

echo "✅ Bot started with PM2"
echo "📊 Commands:"
echo "  pm2 logs wa-bot    - View logs"
echo "  pm2 restart wa-bot - Restart bot"
echo "  pm2 stop wa-bot    - Stop bot"
echo "  pm2 monit          - Monitor"
EOF

chmod +x start-pm2.sh

print_success "Startup scripts created"

# Create basic media files
print_status "Creating media placeholders..."
mkdir -p media

# Create media README
cat > media/README.md << 'EOF'
# Media Files for Android

Replace these files with your own:

1. music.mp3 (max 25MB) - Bot background music
2. welcome.jpg (max 5MB) - Welcome image  
3. thumb.jpg (max 1MB) - Bot thumbnail

Keep files small for better Android performance!
EOF

print_success "Media structure created"

# Final instructions
echo ""
echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Android Device Setup Complete${NC}"
echo -e "${CYAN}📂 Project Location: $(pwd)${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
if [ -f "setup.js" ]; then
    echo -e "${GREEN}1. Run setup: node setup.js${NC}"
    echo -e "${GREEN}2. Or start directly: ./start-bot.sh${NC}"
else
    echo -e "${GREEN}1. Copy bot files to this directory${NC}"
    echo -e "${GREEN}2. Edit config/config.js with your settings${NC}"
    echo -e "${GREEN}3. Run: ./start-bot.sh${NC}"
fi
echo -e "${GREEN}4. For production: ./start-pm2.sh${NC}"
echo ""
echo -e "${BLUE}📱 Android Optimization Tips:${NC}"
echo -e "${WHITE}• Keep Termux in foreground during bot operation${NC}"
echo -e "${WHITE}• Close other apps to free memory${NC}"
echo -e "${WHITE}• Use PM2 for better memory management${NC}"
echo -e "${WHITE}• Monitor bot with: pm2 monit${NC}"
echo ""
echo -e "${CYAN}🎯 Bot Commands:${NC}"
echo -e "${WHITE}• .ping - Check bot speed${NC}"
echo -e "${WHITE}• .menu - Show all commands with auto-play${NC}"
echo -e "${WHITE}• .rvo - Reveal view once messages${NC}"
echo -e "${WHITE}• .sticker - Create sticker from image${NC}"
echo -e "${WHITE}• .music - Play bot music${NC}"
echo ""
echo -e "${GREEN}🚀 Your Android WhatsApp Bot is ready!${NC}"
echo -e "${MAGENTA}Keep Termux running and enjoy your bot! 📱${NC}"
