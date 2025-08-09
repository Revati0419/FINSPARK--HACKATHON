#!/bin/bash

# This script builds your Chrome extension using the robust BUNDLING method.
# It is designed for your specific project structure.

# Exit immediately if any command fails, preventing a broken build.
set -e

echo "🔑 Reading API Key from .env file..."
# This is the most reliable way to read the key.
API_KEY_VALUE=$(grep '^API_KEY=' .env | cut -d '=' -f 2)

# Check if the key was actually found.
if [ -z "$API_KEY_VALUE" ]; then
    echo "❌ ERROR: API_KEY not found in .env file. Please make sure it's set correctly."
    exit 1
fi

echo "⚙️  Building extension into 'dist' folder..."
# 1. CLEANUP: Remove any old build to start fresh.
rm -rf dist

# 2. FOLDER SETUP: Create the directory structure inside 'dist'.
mkdir -p dist/popup dist/injected_ui

# --- THE BUNDLING PROCESS ---

# 3. First, create a temporary version of config.js with the real key.
echo "    > Injecting API Key into temporary config..."
sed "s|__API_KEY_PLACEHOLDER__|${API_KEY_VALUE}|g" utils/config.js > utils/temp_config.js

# 4. Now, concatenate all JS files into ONE bundle, in the correct order.
#    This order is critical and matches your manifest requirements.
echo "    > Bundling all JavaScript files into dist/bundle.js..."
cat \
  utils/temp_config.js \
  content_script.js \
  utils/translator.js \
  utils/speech_services.js \
  utils/audio.js \
  utils/speech.js \
  utils/ai.js \
  utils/settings.js \
  > dist/bundle.js

# 5. Clean up the temporary file.
rm utils/temp_config.js

# 6. Copy all other non-JS assets into the dist folder.
echo "    > Copying other assets..."
cp manifest.json background.js icon.png dist/
cp -r popup/ dist/
cp -r injected_ui/ dist/

echo "✅ Build complete! You can now load the 'dist' directory into Chrome."