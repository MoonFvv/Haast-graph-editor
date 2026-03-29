#!/bin/bash
set -e

PLUGIN_NAME="Haast Flow Editor"
BUNDLE_ID="com.haastproductions.floweditor"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAGING_DIR="$ROOT_DIR/.dmg-staging"
OUTPUT_DIR="$ROOT_DIR/releases"

# Lees versie uit package.json
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
DMG_NAME="${PLUGIN_NAME// /-}-v${VERSION}.dmg"

echo "→ Building plugin v$VERSION..."
cd "$ROOT_DIR"
npm run build

echo "→ Generating update.json..."
cat > "$ROOT_DIR/update.json" << UPDATEEOF
{
  "version": "$VERSION",
  "files": [
    "dist/index.html",
    "dist/assets/index.js",
    "dist/assets/index.css"
  ]
}
UPDATEEOF

echo "→ Staging files..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR/$PLUGIN_NAME"

cp -r "$ROOT_DIR/CSXS"     "$STAGING_DIR/$PLUGIN_NAME/"
cp -r "$ROOT_DIR/dist"     "$STAGING_DIR/$PLUGIN_NAME/"
cp -r "$ROOT_DIR/jsx"      "$STAGING_DIR/$PLUGIN_NAME/"

# Auto-installer script (dubbelklikbaar)
cp "$ROOT_DIR/scripts/install.command" "$STAGING_DIR/Installeer (dubbelklik).command"
chmod +x "$STAGING_DIR/Installeer (dubbelklik).command"

echo "→ Creating DMG..."
mkdir -p "$OUTPUT_DIR"
hdiutil create \
  -volname "$PLUGIN_NAME v$VERSION" \
  -srcfolder "$STAGING_DIR" \
  -ov \
  -format UDZO \
  "$OUTPUT_DIR/$DMG_NAME"

echo "→ Cleaning up..."
rm -rf "$STAGING_DIR"

echo ""
echo "✓ Klaar: releases/$DMG_NAME"
echo ""
echo "── Voor auto-updates ──────────────────────────────"
echo "   Commit en push update.json naar je GitHub repo."
echo "   Bestaande gebruikers updaten automatisch."
echo "───────────────────────────────────────────────────"
