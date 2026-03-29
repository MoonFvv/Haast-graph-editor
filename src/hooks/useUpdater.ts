import { useEffect, useState } from 'react';
import { checkAndApplyUpdate } from '../utils/updater';

export type UpdateStatus = 'idle' | 'checking' | 'updated' | 'up-to-date' | 'error';

export function useUpdater() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [newVersion, setNewVersion] = useState<string | undefined>();

  useEffect(() => {
    // Small delay so the panel UI loads first
    const timer = setTimeout(async () => {
      setStatus('checking');
      const result = await checkAndApplyUpdate();
      if (result.status === 'updated') {
        setStatus('updated');
        setNewVersion(result.newVersion);
      } else {
        setStatus(result.status === 'error' ? 'error' : 'up-to-date');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return { updateStatus: status, newVersion };
}
