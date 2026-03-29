#!/bin/bash
# Haast Flow Editor — Installer
# Als macOS dit blokkeert: ga naar Systeeminstelling → Privacy → Beveiliging → klik "Sta toch toe"

BUNDLE_ID="com.haastproductions.floweditor"
PLUGIN_FOLDER="Haast Flow Editor"
EXTENSIONS_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
INSTALL_DIR="$EXTENSIONS_DIR/$BUNDLE_ID"

# Verwijder quarantine van dit script zelf (nodig voor bestanden ontvangen via internet)
xattr -d com.apple.quarantine "$0" 2>/dev/null

# Zoek plugin-map relatief aan dit script (werkt ook op een gemounte DMG)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_SOURCE="$SCRIPT_DIR/$PLUGIN_FOLDER"

clear
echo "================================================"
echo "   Haast Flow Editor — Installatie"
echo "================================================"
echo ""

# Controleer of plugin-map aanwezig is
if [ ! -d "$PLUGIN_SOURCE" ]; then
  echo "FOUT: Plugin map niet gevonden."
  echo ""
  echo "Zorg dat 'Installeer (dubbelklik).command' en de"
  echo "'$PLUGIN_FOLDER' map in dezelfde folder staan."
  echo ""
  read -p "Druk op Enter om te sluiten..."
  exit 1
fi

# Verwijder quarantine van alle plugin-bestanden
xattr -cr "$PLUGIN_SOURCE" 2>/dev/null

echo "→ Extensions map aanmaken..."
mkdir -p "$EXTENSIONS_DIR"

echo "→ Oude versie verwijderen..."
rm -rf "$INSTALL_DIR"

echo "→ Plugin installeren..."
cp -r "$PLUGIN_SOURCE" "$INSTALL_DIR"

echo "→ Rechten instellen..."
chmod -R 755 "$INSTALL_DIR"

echo "→ After Effects debug-modus inschakelen..."
for v in 11 10 9 8; do
  defaults write "com.adobe.CSXS.$v" PlayerDebugMode 1 2>/dev/null
done

echo ""
echo "================================================"
echo "   Installatie geslaagd!"
echo "================================================"
echo ""
echo "  1. Open After Effects"
echo "  2. Venster → Extensies → Haast Flow Editor"
echo ""
echo "  Eerste keer: AE opnieuw opstarten als de plugin"
echo "  niet zichtbaar is."
echo ""
read -p "Druk op Enter om te sluiten..."
