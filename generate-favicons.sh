#!/bin/bash

# Favicon Generator Script
# Usage: ./generate-favicons.sh path/to/your/logo.png

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-logo-file>"
    echo "Example: $0 public/images/logo.png"
    exit 1
fi

LOGO_PATH="$1"
OUTPUT_DIR="public"

if [ ! -f "$LOGO_PATH" ]; then
    echo "Error: Logo file '$LOGO_PATH' not found!"
    exit 1
fi

echo "Generating favicons from: $LOGO_PATH"
echo "Output directory: $OUTPUT_DIR"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate multi-size favicon.ico (16x16, 32x32, 48x48, 64x64)
echo "Creating favicon.ico with multiple sizes..."
convert "$LOGO_PATH" \
    \( -clone 0 -resize 16x16 -background transparent -gravity center -extent 16x16 \) \
    \( -clone 0 -resize 32x32 -background transparent -gravity center -extent 32x32 \) \
    \( -clone 0 -resize 48x48 -background transparent -gravity center -extent 48x48 \) \
    \( -clone 0 -resize 64x64 -background transparent -gravity center -extent 64x64 \) \
    -delete 0 "$OUTPUT_DIR/favicon.ico"

# Generate PNG favicons for modern browsers
echo "Creating PNG favicons..."
convert "$LOGO_PATH" -resize 96x96 -background transparent -gravity center -extent 96x96 "$OUTPUT_DIR/favicon-96x96.png"
convert "$LOGO_PATH" -resize 144x144 -background transparent -gravity center -extent 144x144 "$OUTPUT_DIR/favicon-144x144.png"

# Generate Apple touch icons
echo "Creating Apple touch icon..."
convert "$LOGO_PATH" -resize 180x180 -background transparent -gravity center -extent 180x180 "$OUTPUT_DIR/apple-touch-icon.png"

# Generate Android/Chrome icons
echo "Creating Android/Chrome icons..."
convert "$LOGO_PATH" -resize 192x192 -background transparent -gravity center -extent 192x192 "$OUTPUT_DIR/logo192.png"
convert "$LOGO_PATH" -resize 512x512 -background transparent -gravity center -extent 512x512 "$OUTPUT_DIR/logo512.png"

echo ""
echo "✅ Favicon generation complete!"
echo ""
echo "Generated files:"
echo "  - favicon.ico (16x16, 32x32, 48x48, 64x64)"
echo "  - favicon-96x96.png"
echo "  - favicon-144x144.png"
echo "  - apple-touch-icon.png (180x180)"
echo "  - logo192.png (192x192)"
echo "  - logo512.png (512x512)"
echo ""
echo "Don't forget to update your HTML <head> section with the favicon links!"