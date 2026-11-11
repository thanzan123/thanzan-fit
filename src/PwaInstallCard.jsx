import React, { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';
import { isStandaloneMode, shouldShowIosInstallGuide } from './pwaInstall.js';

function getInstalledState() {
  return isStandaloneMode(
    typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches,
    typeof navigator !== 'undefined' && navigator.standalone === true,
  );
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function PwaInstallCard() {
  const [installed, setInstalled] = useState(getInstalledState);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const iosGuide = shouldShowIosInstallGuide(isIosDevice(), installed);

  useEffect(() => {
    const onBeforeInstall = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice?.outcome === 'accepted') setInstalled(true);
    else setDismissed(true);
  };

  if (installed || dismissed || (!installPrompt && !iosGuide)) return null;

  return <section className="card pwa-install-card" aria-label="Install THANZAN FIT">
    <div className="pwa-install-icon"><Download size={18}/></div>
    <div className="pwa-install-copy">
      <strong>Keep THANZAN FIT close</strong>
      {installPrompt
        ? <p>Add the app to your home screen for quick access and offline app-shell support.</p>
        : <p><Share size={14}/> On iPhone or iPad, tap Share, then “Add to Home Screen”.</p>}
    </div>
    {installPrompt && <button className="button primary" type="button" onClick={install}>Install app</button>}
    <button className="icon-button pwa-install-dismiss" type="button" aria-label="Dismiss install suggestion" onClick={() => setDismissed(true)}>×</button>
  </section>;
}
