/**
 * Screen Wake Lock Utility
 * ป้องกันไม่ให้หน้าจอดับหรือล็อคอัตโนมัติขณะเล่นเกมบน iPhone (iOS 16.4+), Android และ iPad
 */
class ScreenWakeLock {
  constructor() {
    this.wakeLock = null;
    this.isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  async requestWakeLock() {
    if (!this.isSupported) return false;
    try {
      if (!this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      }
      return true;
    } catch (err) {
      console.warn('Wake Lock request warning:', err.message);
      return false;
    }
  }

  release() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }
}

export const screenWakeLock = new ScreenWakeLock();
