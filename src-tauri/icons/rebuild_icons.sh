#!/bin/bash

# Icon rebuild script
# This script regenerates all required icon sizes from the source icon.png file

SOURCE_ICON="icon.png"
ICO_OUTPUT="icon.ico"
ICNS_OUTPUT="icon.icns"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon $SOURCE_ICON not found!"
    exit 1
fi

echo "Rebuilding icons from $SOURCE_ICON..."

# Create backup directory
mkdir -p backup
echo "Backing up existing icons..."
cp -v *.png backup/ 2>/dev/null || true
cp -v *.ico backup/ 2>/dev/null || true
cp -v *.icns backup/ 2>/dev/null || true

# Generate Windows icons
echo "Generating Windows icons..."
magick convert "$SOURCE_ICON" -resize 32x32 "32x32.png"
magick convert "$SOURCE_ICON" -resize 64x64 "64x64.png"
magick convert "$SOURCE_ICON" -resize 128x128 "128x128.png"
magick convert "$SOURCE_ICON" -resize 256x256 "128x128@2x.png"

# Generate Windows Store icons
echo "Generating Windows Store icons..."
magick convert "$SOURCE_ICON" -resize 30x30 "Square30x30Logo.png"
magick convert "$SOURCE_ICON" -resize 44x44 "Square44x44Logo.png"
magick convert "$SOURCE_ICON" -resize 71x71 "Square71x71Logo.png"
magick convert "$SOURCE_ICON" -resize 89x89 "Square89x89Logo.png"
magick convert "$SOURCE_ICON" -resize 107x107 "Square107x107Logo.png"
magick convert "$SOURCE_ICON" -resize 142x142 "Square142x142Logo.png"
magick convert "$SOURCE_ICON" -resize 150x150 "Square150x150Logo.png"
magick convert "$SOURCE_ICON" -resize 284x284 "Square284x284Logo.png"
magick convert "$SOURCE_ICON" -resize 310x310 "Square310x310Logo.png"
magick convert "$SOURCE_ICON" -resize 50x50 "StoreLogo.png"

# Generate ICO file (Windows icon format)
echo "Generating ICO file..."
magick convert "$SOURCE_ICON" -resize 16x16 -resize 32x32 -resize 48x48 -resize 64x64 -resize 128x128 -resize 256x256 "$ICO_OUTPUT"

# Generate ICNS file (macOS icon format)
echo "Generating ICNS file..."
magick convert "$SOURCE_ICON" -resize 16x16 -resize 32x32 -resize 64x64 -resize 128x128 -resize 256x256 -resize 512x512 -resize 1024x1024 "$ICNS_OUTPUT"

# Generate Android icons
echo "Generating Android icons..."
mkdir -p android/mipmap-mdpi
mkdir -p android/mipmap-hdpi
mkdir -p android/mipmap-xhdpi
mkdir -p android/mipmap-xxhdpi
mkdir -p android/mipmap-xxxhdpi
mkdir -p android/mipmap-anydpi-v26

# Android icons - foreground
magick convert "$SOURCE_ICON" -resize 48x48 "android/mipmap-mdpi/ic_launcher_foreground.png"
magick convert "$SOURCE_ICON" -resize 72x72 "android/mipmap-hdpi/ic_launcher_foreground.png"
magick convert "$SOURCE_ICON" -resize 96x96 "android/mipmap-xhdpi/ic_launcher_foreground.png"
magick convert "$SOURCE_ICON" -resize 144x144 "android/mipmap-xxhdpi/ic_launcher_foreground.png"
magick convert "$SOURCE_ICON" -resize 192x192 "android/mipmap-xxxhdpi/ic_launcher_foreground.png"

# Android icons - round
magick convert "$SOURCE_ICON" -resize 48x48 "android/mipmap-mdpi/ic_launcher_round.png"
magick convert "$SOURCE_ICON" -resize 72x72 "android/mipmap-hdpi/ic_launcher_round.png"
magick convert "$SOURCE_ICON" -resize 96x96 "android/mipmap-xhdpi/ic_launcher_round.png"
magick convert "$SOURCE_ICON" -resize 144x144 "android/mipmap-xxhdpi/ic_launcher_round.png"
magick convert "$SOURCE_ICON" -resize 192x192 "android/mipmap-xxxhdpi/ic_launcher_round.png"

# Android icons - regular
magick convert "$SOURCE_ICON" -resize 48x48 "android/mipmap-mdpi/ic_launcher.png"
magick convert "$SOURCE_ICON" -resize 72x72 "android/mipmap-hdpi/ic_launcher.png"
magick convert "$SOURCE_ICON" -resize 96x96 "android/mipmap-xhdpi/ic_launcher.png"
magick convert "$SOURCE_ICON" -resize 144x144 "android/mipmap-xxhdpi/ic_launcher.png"
magick convert "$SOURCE_ICON" -resize 192x192 "android/mipmap-xxxhdpi/ic_launcher.png"

# Generate iOS icons
echo "Generating iOS icons..."
mkdir -p ios

magick convert "$SOURCE_ICON" -resize 20x20 "ios/AppIcon-20x20@1x.png"
magick convert "$SOURCE_ICON" -resize 40x40 "ios/AppIcon-20x20@2x-1.png"
magick convert "$SOURCE_ICON" -resize 40x40 "ios/AppIcon-20x20@2x.png"
magick convert "$SOURCE_ICON" -resize 60x60 "ios/AppIcon-20x20@3x.png"

magick convert "$SOURCE_ICON" -resize 29x29 "ios/AppIcon-29x29@1x.png"
magick convert "$SOURCE_ICON" -resize 58x58 "ios/AppIcon-29x29@2x-1.png"
magick convert "$SOURCE_ICON" -resize 58x58 "ios/AppIcon-29x29@2x.png"
magick convert "$SOURCE_ICON" -resize 87x87 "ios/AppIcon-29x29@3x.png"

magick convert "$SOURCE_ICON" -resize 40x40 "ios/AppIcon-40x40@1x.png"
magick convert "$SOURCE_ICON" -resize 80x80 "ios/AppIcon-40x40@2x-1.png"
magick convert "$SOURCE_ICON" -resize 80x80 "ios/AppIcon-40x40@2x.png"
magick convert "$SOURCE_ICON" -resize 120x120 "ios/AppIcon-40x40@3x.png"

magick convert "$SOURCE_ICON" -resize 60x60 "ios/AppIcon-60x60@2x.png"
magick convert "$SOURCE_ICON" -resize 180x180 "ios/AppIcon-60x60@3x.png"

magick convert "$SOURCE_ICON" -resize 76x76 "ios/AppIcon-76x76@1x.png"
magick convert "$SOURCE_ICON" -resize 152x152 "ios/AppIcon-76x76@2x.png"

magick convert "$SOURCE_ICON" -resize 167x167 "ios/AppIcon-83.5x83.5@2x.png"

magick convert "$SOURCE_ICON" -resize 1024x1024 "ios/AppIcon-512@2x.png"

echo "Icon regeneration complete!"
echo "Summary of generated icons:"
echo "- Windows icons: 32x32, 64x64, 128x128, 128x128@2x"
echo "- Windows Store icons: Square30x30Logo to Square310x310Logo"
echo "- Windows ICO file: icon.ico"
echo "- macOS ICNS file: icon.icns"
echo "- Android icons: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi variants"
echo "- iOS icons: Various sizes for iPhone and iPad"
