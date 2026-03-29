import { UPDATE_CONFIG } from './updateConfig';

declare const __APP_VERSION__: string;

interface UpdateManifest {
  version: string;
  files: string[];
}

function isNewer(current: string, latest: string): boolean {
  const [cMaj, cMin, cPatch] = current.split('.').map(Number);
  const [lMaj, lMin, lPatch] = latest.split('.').map(Number);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPatch > cPatch;
}

function getNodeFs(): { writeFileSync: (p: string, d: string) => void; mkdirSync: (p: string, o: object) => void } | null {
  try {
    // CEP exposes Node.js via window.cep_node when --enable-nodejs is set
    const cepNode = (window as any).cep_node;
    if (cepNode) return cepNode.require('fs');
    // Fallback: direct require (also available in CEP Node context)
    return (window as any).require('fs');
  } catch {
    return null;
  }
}

function getNodePath(): { join: (...parts: string[]) => string; dirname: (p: string) => string } | null {
  try {
    const cepNode = (window as any).cep_node;
    if (cepNode) return cepNode.require('path');
    return (window as any).require('path');
  } catch {
    return null;
  }
}

function getExtensionPath(): string | null {
  try {
    const csi = new window.CSInterface();
    return (csi as any).getSystemPath('extension');
  } catch {
    return null;
  }
}

export interface UpdateResult {
  status: 'up-to-date' | 'updated' | 'error';
  newVersion?: string;
  error?: string;
}

export async function checkAndApplyUpdate(): Promise<UpdateResult> {
  const currentVersion = __APP_VERSION__;

  // Skip if GitHub owner hasn't been configured
  if ((UPDATE_CONFIG.GITHUB_OWNER as string) === 'JOUW_GITHUB_GEBRUIKERSNAAM') {
    return { status: 'up-to-date' };
  }

  let manifest: UpdateManifest;
  try {
    const res = await fetch(UPDATE_CONFIG.MANIFEST_URL, { cache: 'no-store' });
    if (!res.ok) return { status: 'up-to-date' };
    manifest = await res.json();
  } catch {
    return { status: 'up-to-date' };
  }

  if (!isNewer(currentVersion, manifest.version)) {
    return { status: 'up-to-date' };
  }

  const fs = getNodeFs();
  const nodePath = getNodePath();
  const extensionPath = getExtensionPath();

  if (!fs || !nodePath || !extensionPath) {
    // Can't write files — skip silently
    return { status: 'up-to-date' };
  }

  try {
    for (const file of manifest.files) {
      const url = UPDATE_CONFIG.BASE_URL + file;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const content = await res.text();
      const dest = nodePath.join(extensionPath, ...file.split('/'));
      fs.mkdirSync(nodePath.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
    }
    return { status: 'updated', newVersion: manifest.version };
  } catch (e) {
    return { status: 'error', error: String(e) };
  }
}
