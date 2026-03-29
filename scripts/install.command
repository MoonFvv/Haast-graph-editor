#!/bin/bash
# Haast Flow Editor — Auto Installer
# Dubbelklik dit bestand om de plugin te installeren

BUNDLE_ID="com.haastproductions.floweditor"
PLUGIN_FOLDER="Haast Flow Editor"
EXTENSIONS_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
INSTALL_DIR="$EXTENSIONS_DIR/$BUNDLE_ID"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_SOURCE="$SCRIPT_DIR/$PLUGIN_FOLDER"

clear
echo "================================="
echo "  Haast Flow Editor — Installatie"
echo "================================="
echo ""

# Controleer of plugin-map aanwezig is
if [ ! -d "$PLUGIN_SOURCE" ]; then
  echo "FOUT: Plugin map niet gevonden op:"
  echo "$PLUGIN_SOURCE"
  echo ""
  read -p "Druk op Enter om te sluiten..."
  exit 1
fi

# Maak extensions folder aan indien nodig
mkdir -p "$EXTENSIONS_DIR"

# Verwijder oude versie
if [ -d "$INSTALL_DIR" ]; then
  echo "→ Oude versie verwijderen..."
  rm -rf "$INSTALL_DIR"
fi

# Kopieer plugin
echo "→ Plugin installeren..."
cp -r "$PLUGIN_SOURCE" "$INSTALL_DIR"

# Zet debug-modus aan (nodig voor unsigned plugins)
echo "→ Debug-modus inschakelen..."
for v in 11 10 9 8; do
  defaults write "com.adobe.CSXS.$v" PlayerDebugMode 1 2>/dev/null
done

echo ""
echo "================================="
echo "  Installatie geslaagd!"
echo "================================="
echo ""
echo "Stap 1: Open After Effects"
echo "Stap 2: Venster → Extensies → Haast Flow Editor"
echo ""
read -p "Druk op Enter om te sluiten..."
