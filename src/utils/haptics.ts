/**
 * Haptic Feedback utility for native mobile/PWA tactile responsiveness
 * Gracefully degrades if the device or browser does not support navigator.vibrate
 */
export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'selection';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'success':
        navigator.vibrate([12, 40, 16]);
        break;
      case 'warning':
        navigator.vibrate([20, 60, 20]);
        break;
    }
  } catch {
    // Non-critical; silently handle any security or permission block
  }
}
