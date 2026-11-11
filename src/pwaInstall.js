export function isStandaloneMode(displayModeMatches, navigatorStandalone) {
  return Boolean(displayModeMatches || navigatorStandalone);
}

export function shouldShowIosInstallGuide(isIosDevice, isInstalled) {
  return Boolean(isIosDevice && !isInstalled);
}
