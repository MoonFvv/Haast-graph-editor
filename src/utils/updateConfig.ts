/**
 * Auto-updater configuratie
 *
 * 1. Maak een GitHub repo aan en push je code daarheen.
 * 2. Pas GITHUB_OWNER en GITHUB_REPO hieronder aan.
 * 3. Na elke update: npm run build → commit & push → users updaten automatisch.
 */

export const UPDATE_CONFIG = {
  // Pas dit aan naar jouw GitHub gebruikersnaam en repo naam:
  GITHUB_OWNER: 'MoonFvv',
  GITHUB_REPO: 'Haast-graph-editor',

  // Bestanden die bij elke build worden bijgewerkt:
  UPDATE_FILES: [
    'dist/index.html',
    'dist/assets/index.js',
    'dist/assets/index.css',
  ],

  get MANIFEST_URL() {
    return `https://raw.githubusercontent.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/main/update.json`;
  },

  get BASE_URL() {
    return `https://raw.githubusercontent.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/main/`;
  },
} as const;
